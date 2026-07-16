import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { mockGetNotifications, type MockNotification } from '../features/user/api';

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockGetNotifications().then((result) => {
      setNotifications(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary">Notifications</h1>
      </div>

      {isLoading && <p className="text-sm text-textSecondary">Loading...</p>}
      {!isLoading && notifications.length === 0 && (
        <EmptyState icon={<Bell size={22} />} title="You're all caught up" />
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.isRead ? 'opacity-60' : ''}>
            <div className="flex items-start gap-2">
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              )}
              <div className={notification.isRead ? 'ml-4' : ''}>
                <h3 className="text-sm font-semibold text-textPrimary">{notification.title}</h3>
                <p className="text-xs text-textSecondary mt-0.5">{notification.body}</p>
                <p className="text-[11px] text-textSecondary/70 mt-1">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
