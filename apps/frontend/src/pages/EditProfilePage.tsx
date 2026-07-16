import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { mockGetProfile, mockUpdateProfile, type MockUserProfile } from '../features/user/api';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<MockUserProfile | null>(null);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mockGetProfile().then((result) => {
      setProfile(result);
      setName(result.name);
      setIdNumber(result.idNumber);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockUpdateProfile({ name, idNumber });
    setIsSubmitting(false);
    showToast('Profile updated.', 'success');
    navigate(-1);
  }

  if (!profile) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Full name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Email"
          type="email"
          value={profile.email}
          disabled
          hint="Email cannot be changed."
        />
        <FormField
          label="ID number"
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
