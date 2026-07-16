import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockLogin } from '../features/auth/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await mockLogin({ identifier: adminId, password });
      showToast(`Welcome back, ${result.name}.`, 'success');
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-textPrimary">
      <div className="w-full max-w-app">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Administrator Login</h1>
          <p className="text-sm text-white/60 mt-1 text-center">BUBT Transport Office</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-surface border border-border rounded-hero shadow-sm p-6"
        >
          <FormField
            label="Admin ID"
            type="text"
            required
            placeholder="admin.transport1"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
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

        <div className="mt-6 flex justify-center">
          <Link to="/login" className="text-xs text-white/60 hover:text-white">
            Not an admin? Go to User login
          </Link>
        </div>
      </div>
    </div>
  );
}
