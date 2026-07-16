import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockGetNotice } from '../features/notices/api';
import type { Notice } from '@bubt/shared-types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!noticeId) return;
    mockGetNotice(noticeId).then((result) => result && setNotice(result));
  }, [noticeId]);

  if (!notice) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
          {notice.category}
        </span>
      </div>
      <h1 className="text-xl font-bold text-textPrimary mb-2">{notice.title}</h1>
      <p className="text-xs text-textSecondary mb-5">{formatDate(notice.publishedAt)}</p>
      <p className="text-sm text-textPrimary leading-relaxed whitespace-pre-line">{notice.body}</p>
    </div>
  );
}
