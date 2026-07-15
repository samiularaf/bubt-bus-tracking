/**
 * MOCK auth API — Phase 7 rule: "Use mock data. No backend connection."
 * Shapes match API_DESIGN.md §2 exactly, so swapping this for real `apiClient`
 * calls in Phase 8 requires no changes to the pages that consume it.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A couple of "already registered" emails and a working OTP, to make the
// mock flow demonstrate both the happy path and realistic error states.
const MOCK_REGISTERED_EMAILS = ['taken@bubt.edu.bd'];
const MOCK_VALID_OTP = '123456';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function mockRegister(input: RegisterInput): Promise<{ userId: string }> {
  await delay(600);
  if (MOCK_REGISTERED_EMAILS.includes(input.email.toLowerCase())) {
    throw new Error('This email is already registered.');
  }
  return { userId: 'mock-user-id' };
}

export async function mockVerifyOtp(_userId: string, code: string): Promise<void> {
  await delay(500);
  if (code !== MOCK_VALID_OTP) {
    throw new Error('Incorrect or expired code. Please try again.');
  }
}

export async function mockResendOtp(_userId: string): Promise<void> {
  await delay(400);
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface MockLoginResult {
  role: 'user' | 'driver' | 'admin';
  name: string;
  mustChangePassword: boolean;
}

export async function mockLogin(input: LoginInput): Promise<MockLoginResult> {
  await delay(600);
  if (!input.password || input.password.length < 6) {
    throw new Error('Incorrect email/ID or password.');
  }
  // Mock role inference purely from identifier shape, for demo purposes.
  if (input.identifier.startsWith('DRV-')) {
    return { role: 'driver', name: 'Demo Driver', mustChangePassword: true };
  }
  if (input.identifier.startsWith('admin.')) {
    return { role: 'admin', name: 'Demo Administrator', mustChangePassword: false };
  }
  return { role: 'user', name: 'Demo Student', mustChangePassword: false };
}

export async function mockForgotPassword(_email: string): Promise<void> {
  await delay(600);
}

export async function mockChangePassword(_newPassword: string): Promise<void> {
  await delay(600);
}
