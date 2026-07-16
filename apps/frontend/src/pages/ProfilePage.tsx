import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, MessageSquareWarning, Lock, User } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { mockGetProfile, type MockUserProfile } from '../features/user/api';

const DESIGNATION_LABELS: Record<MockUserProfile['designation'], string> = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MockUserProfile | null>(null);

  useEffect(() => {
    mockGetProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  const menuItems = [
    { icon: User, label: 'Edit profile', to: '/profile/edit' },
    { icon: Lock, label: 'Change password', to: '/profile/change-password' },
    { icon: MessageSquareWarning, label: 'Report a problem', to: '/report-problem' },
  ];

  return (
    <div className="px-4 pt-5 pb-6">
      <h1 className="text-xl font-bold text-textPrimary mb-4">Profile</h1>

      <Card className="flex items-center gap-3 mb-6">
        <Avatar name={profile.name} />
        <div>
          <h2 className="font-semibold text-textPrimary">{profile.name}</h2>
          <p className="text-xs text-textSecondary">{DESIGNATION_LABELS[profile.designation]}</p>
          <p className="text-xs text-textSecondary">{profile.email}</p>
        </div>
      </Card>

      <div className="flex flex-col gap-2 mb-6">
        {menuItems.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}>
            <Card className="flex items-center justify-between">
              <span className="flex items-center gap-3 text-sm text-textPrimary">
                <Icon size={18} className="text-textSecondary" />
                {label}
              </span>
              <ChevronRight size={16} className="text-textSecondary" />
            </Card>
          </Link>
        ))}
      </div>

      <button
        onClick={() => navigate('/login')}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-danger py-3"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}
