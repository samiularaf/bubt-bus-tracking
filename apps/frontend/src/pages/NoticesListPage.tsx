import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { mockGetNotices } from '../features/notices/api';
import type { Notice, NoticeCategory } from '@bubt/shared-types';

const CATEGORY_LABELS: Record<NoticeCategory, string> = {
  general: 'General',
  holiday: 'Holiday',
  ramadan: 'Ramadan',
  exam: 'Exam',
  delay: 'Delay',
  cancellation: 'Cancellation',
  emergency: 'Emergency',
  maintenance: 'Maintenance',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NoticesListPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockGetNotices().then((result) => {
      setNotices(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="px-4 pt-5">
      <h1 className="text-xl font-bold text-textPrimary mb-4">Notices</h1>

      {isLoading && <p className="text-sm text-textSecondary">Loading...</p>}
      {!isLoading && notices.length === 0 && (
        <EmptyState icon={<Bell size={22} />} title="No notices yet" />
      )}

      <div className="flex flex-col gap-3">
        {notices.map((notice) => (
          <Link key={notice.id} to={`/notices/${notice.id}`}>
            <Card>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    notice.category === 'emergency'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {CATEGORY_LABELS[notice.category]}
                </span>
                <span className="text-xs text-textSecondary">{formatDate(notice.publishedAt)}</span>
              </div>
              <h3 className="text-sm font-semibold text-textPrimary">{notice.title}</h3>
              <p className="text-xs text-textSecondary mt-1 line-clamp-2">{notice.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
