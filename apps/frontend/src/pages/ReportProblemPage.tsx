import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockSubmitComplaint } from '../features/user/api';

export default function ReportProblemPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await mockSubmitComplaint(subject, message);
      showToast('Your report has been submitted.', 'success');
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
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
        <h1 className="text-lg font-bold text-textPrimary">Report a problem</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Bus arrived very late"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-textPrimary">
            Details
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what happened"
            className="rounded-card border border-border px-4 py-3 text-sm text-textPrimary
              placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          Submit report
        </Button>
      </form>
    </div>
  );
}
