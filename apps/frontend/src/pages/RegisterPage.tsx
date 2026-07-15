import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockRegister } from '../features/auth/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mockRegister({ name, email, password });
      showToast('Verification code sent to your email.', 'success');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="For BUBT students, teachers, and staff">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Full name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <FormField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          hint="Use your university email if you have one."
        />
        <FormField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          error={error ?? undefined}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="text-sm text-textSecondary text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
