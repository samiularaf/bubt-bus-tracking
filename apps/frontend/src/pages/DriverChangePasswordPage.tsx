import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockChangePassword } from '../features/auth/api';

export default function DriverChangePasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mockChangePassword(newPassword);
      showToast('Password updated. Welcome to BUBT Transit.', 'success');
      navigate('/driver');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="This is your first login — choose a password only you know"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="New password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          error={error ?? undefined}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Set password and continue
        </Button>
      </form>
    </AuthShell>
  );
}
