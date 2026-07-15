import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockLogin } from '../features/auth/api';

export default function DriverLoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await mockLogin({ identifier: driverId, password });
      if (result.mustChangePassword) {
        showToast('Please set a new password before continuing.', 'info');
        navigate('/driver/change-password');
        return;
      }
      showToast(`Welcome back, ${result.name}.`, 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Driver Login" subtitle="Use the Driver ID provided by your Administrator">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Driver ID"
          type="text"
          required
          placeholder="DRV-001"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          autoComplete="username"
        />
        <FormField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={error ?? undefined}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>
      <p className="text-xs text-textSecondary text-center mt-6">
        Forgot your password? Contact your Transport Office Administrator.
      </p>
      <div className="mt-6 pt-4 border-t border-border flex justify-center">
        <Link to="/login" className="text-xs text-textSecondary hover:text-primary">
          Not a driver? Go to User login
        </Link>
      </div>
    </AuthShell>
  );
}
