import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../features/auth/components/AuthShell';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { mockForgotPassword } from '../features/auth/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockForgotPassword(email);
    setIsSubmitting(false);
    setIsSent(true);
  }

  if (isSent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`If an account exists for ${email}, we've sent a password reset link.`}
      >
        <Link to="/login">
          <Button type="button" variant="secondary">
            Back to login
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Button type="submit" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <p className="text-sm text-textSecondary text-center mt-6">
        <Link to="/login" className="text-primary font-medium">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
