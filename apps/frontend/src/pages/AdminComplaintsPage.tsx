import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { mockGetAdminComplaints, type AdminComplaintRow } from '../features/admin/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<AdminComplaintRow[]>([]);

  useEffect(() => {
    mockGetAdminComplaints().then(setComplaints);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-textPrimary mb-1">Complaints</h1>
      <p className="text-xs text-textSecondary mb-5">
        Submissions from users. This is a read-only log — no status workflow, per current scope.
      </p>

      <DataTable
        rows={complaints}
        rowKey={(c) => c.id}
        columns={[
          { header: 'From', render: (c) => c.userName },
          { header: 'Subject', render: (c) => <span className="font-semibold">{c.subject}</span> },
          { header: 'Message', render: (c) => <span className="text-xs">{c.message}</span> },
          { header: 'Submitted', render: (c) => formatDate(c.createdAt) },
        ]}
      />
    </div>
  );
}
