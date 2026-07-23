import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword, verifyPassword, generateTemporaryPassword } from '../utils/password.js';
import { generateOtp, hashOtp, verifyOtp as compareOtp, otpExpiryDate } from '../utils/otp.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../utils/jwt.js';
import { env } from '../config/env.js';
import type { RegisterInput } from '../validation/auth.js';
import type { UserRole } from '@bubt/shared-types';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginResult extends TokenPair {
  user: { id: string; role: UserRole; name: string; mustChangePassword: boolean };
}

function buildAccessToken(user: { id: string; role: UserRole; mustChangePassword: boolean }) {
  return signAccessToken({
    sub: user.id,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
}

async function issueTokenPair(user: {
  id: string;
  role: UserRole;
  mustChangePassword: boolean;
}): Promise<TokenPair> {
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, tokenId });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600_000), // matches JWT_REFRESH_EXPIRY default (30d)
    },
  });

  return { accessToken: buildAccessToken(user), refreshToken };
}

export class AuthService {
  /** User self-registration. Returns userId so the client can move to the OTP screen. */
  async register(input: RegisterInput): Promise<{ userId: string }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('CONFLICT', 'This email is already registered.', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        role: 'user',
        name: input.name,
        email: input.email,
        passwordHash,
        designation: input.designation,
        idNumber: input.idNumber,
        emailVerified: false,
      },
    });

    await this.issueOtp(user.id);
    return { userId: user.id };
  }

  private async issueOtp(userId: string): Promise<void> {
    const code = generateOtp();
    const codeHash = await hashOtp(code);
    await prisma.otpCode.create({
      data: { userId, codeHash, expiresAt: otpExpiryDate() },
    });
    // Phase 10 wires this to a real email provider (see TECH_STACK.md — provider TBD).
    // eslint-disable-next-line no-console
    console.log(`[mock email] OTP for user ${userId}: ${code}`);
  }

  async verifyOtp(userId: string, code: string): Promise<void> {
    const otp = await prisma.otpCode.findFirst({
      where: { userId, consumed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new AppError('OTP_INVALID_OR_EXPIRED', 'This code is invalid or has expired.', 400);
    }

    const isValid = await compareOtp(code, otp.codeHash);
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attemptCount: { increment: 1 } },
      });
      throw new AppError('OTP_INVALID_OR_EXPIRED', 'This code is invalid or has expired.', 400);
    }

    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } }),
      prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
    ]);
  }

  async resendOtp(userId: string): Promise<void> {
    const lastOtp = await prisma.otpCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (lastOtp) {
      const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < env.otpResendCooldownSeconds) {
        throw new AppError(
          'RATE_LIMITED',
          `Please wait ${Math.ceil(env.otpResendCooldownSeconds - secondsSinceLast)}s before requesting a new code.`,
          429,
        );
      }
    }
    await this.issueOtp(userId);
  }

  /** Unified login for User (email), Driver (Driver ID), Admin (Admin ID), per API_DESIGN.md §2. */
  async login(identifier: string, password: string): Promise<LoginResult> {
    const normalized = identifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized.toLowerCase() },
          { driverId: normalized },
          { adminId: normalized },
        ],
      },
    });

    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Incorrect email/ID or password.', 401);
    }
    if (user.status === 'inactive') {
      throw new AppError('FORBIDDEN', 'This account has been deactivated.', 403);
    }
    if (user.role === 'user' && !user.emailVerified) {
      throw new AppError('FORBIDDEN', 'Please verify your email before logging in.', 403);
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('UNAUTHORIZED', 'Incorrect email/ID or password.', 401);
    }

    const tokens = await issueTokenPair(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token.', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });

    if (
      !stored ||
      stored.revoked ||
      stored.tokenHash !== tokenHash ||
      stored.expiresAt < new Date()
    ) {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token.', 401);
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    return { accessToken: buildAccessToken(user) };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.tokenId },
        data: { revoked: true },
      });
    } catch {
      // Already-invalid tokens don't need explicit revocation; logout is idempotent either way.
    }
  }

  async changePassword(
    userId: string,
    newPassword: string,
    currentPassword?: string,
  ): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    // Driver's forced first-login change has no "current password" to check against
    // (they're changing away from an admin-issued temporary password they just used to log in).
    if (currentPassword) {
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new AppError('UNAUTHORIZED', 'Current password is incorrect.', 401);
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    // Deliberately don't reveal whether the account exists — same response either way.
    if (!user) return;

    const resetToken = signAccessToken({
      sub: user.id,
      role: user.role,
      mustChangePassword: false,
    });
    // Phase 10 wires this to a real email provider.
    // eslint-disable-next-line no-console
    console.log(
      `[mock email] Password reset link for ${email}: /reset-password?token=${resetToken}`,
    );
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    let payload;
    try {
      payload = verifyAccessToken(resetToken);
    } catch {
      throw new AppError('UNAUTHORIZED', 'This reset link is invalid or has expired.', 401);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } });
  }

  async createDriver(input: {
    name: string;
    phone: string;
    bloodGroup: string;
    nidOrLicense: string;
    address: string;
    emergencyContact: string;
    assignedBusId: string;
    email?: string;
    photoUrl?: string;
  }): Promise<{ driverId: string; temporaryPassword: string }> {
    const bus = await prisma.bus.findUnique({ where: { id: input.assignedBusId } });
    if (!bus) {
      throw new AppError('NOT_FOUND', 'Assigned bus not found.', 404);
    }

    const existingAssignment = await prisma.user.findUnique({
      where: { assignedBusId: input.assignedBusId },
    });
    if (existingAssignment) {
      throw new AppError('CONFLICT', 'This bus already has a driver assigned.', 409);
    }

    const driverCount = await prisma.user.count({ where: { role: 'driver' } });
    const driverId = `DRV-${String(driverCount + 1).padStart(3, '0')}`;
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    await prisma.user.create({
      data: {
        role: 'driver',
        name: input.name,
        driverId,
        phone: input.phone,
        bloodGroup: input.bloodGroup,
        nidOrLicense: input.nidOrLicense,
        address: input.address,
        emergencyContact: input.emergencyContact,
        assignedBusId: input.assignedBusId,
        email: input.email,
        photoUrl: input.photoUrl,
        passwordHash,
        mustChangePassword: true,
        joiningDate: new Date(),
      },
    });

    return { driverId, temporaryPassword };
  }

  async resetDriverPassword(driverUserId: string): Promise<{ temporaryPassword: string }> {
    const driver = await prisma.user.findUnique({ where: { id: driverUserId } });
    if (!driver || driver.role !== 'driver') {
      throw new AppError('NOT_FOUND', 'Driver not found.', 404);
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    await prisma.user.update({
      where: { id: driverUserId },
      data: { passwordHash, mustChangePassword: true },
    });

    return { temporaryPassword };
  }
}

export const authService = new AuthService();
