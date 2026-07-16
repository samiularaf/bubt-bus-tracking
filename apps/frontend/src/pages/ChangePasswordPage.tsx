import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockChangePassword } from '../features/auth/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mockChangePassword(newPassword);
      showToast('Password changed.', 'success');
      navigate(-1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary">Change password</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Current password"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
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
          Update password
        </Button>
      </form>
    </div>
  );
}
