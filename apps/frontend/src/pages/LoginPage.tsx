import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockLogin } from '../features/auth/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await mockLogin({ identifier, password });
      showToast(`Welcome back, ${result.name}.`, 'success');
      // Phase 8 wires this to real session storage; for now just prove the flow.
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to track your BUBT bus">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="email"
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
        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-sm text-primary font-medium">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>
      <p className="text-sm text-textSecondary text-center mt-6">
        New here?{' '}
        <Link to="/register" className="text-primary font-medium">
          Create an account
        </Link>
      </p>
      <div className="mt-8 pt-6 border-t border-border flex justify-center gap-4 text-xs text-textSecondary">
        <Link to="/driver/login" className="hover:text-primary">
          Driver login
        </Link>
        <span>·</span>
        <Link to="/admin/login" className="hover:text-primary">
          Admin login
        </Link>
      </div>
    </AuthShell>
  );
}
