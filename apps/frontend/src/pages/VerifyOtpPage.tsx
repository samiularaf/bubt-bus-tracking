import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { OTPInput } from '../components/OTPInput';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockVerifyOtp, mockResendOtp } from '../features/auth/api';

const RESEND_COOLDOWN_SECONDS = 60; // matches OTP_RESEND_COOLDOWN_SECONDS in ACTOR_AUTH_AND_CREDENTIALS.pdf

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const email = (location.state as { email?: string } | null)?.email ?? 'your email';

  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleComplete(code: string) {
    setError(null);
    setIsVerifying(true);
    try {
      await mockVerifyOtp('mock-user-id', code);
      showToast('Email verified. You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    await mockResendOtp('mock-user-id');
    setCooldown(RESEND_COOLDOWN_SECONDS);
    showToast('A new code has been sent.', 'info');
  }

  return (
    <AuthShell title="Verify your email" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <div className="flex flex-col gap-6 items-center">
        <OTPInput onComplete={handleComplete} error={error ?? undefined} />
        {isVerifying && <p className="text-sm text-textSecondary">Verifying...</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="max-w-[220px]"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Button>
      </div>
    </AuthShell>
  );
}
