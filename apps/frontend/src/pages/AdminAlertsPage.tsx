import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { mockGetAdminAlerts, type AdminAlertRow } from '../features/admin/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AdminAlertRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockGetAdminAlerts().then((result) => {
      setAlerts(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-textPrimary mb-5">Emergency Alerts</h1>

      {!isLoading && alerts.length === 0 && (
        <EmptyState
          icon={<ShieldAlert size={22} />}
          title="No emergency alerts"
          description="Good news — nothing to see here."
        />
      )}

      {alerts.length > 0 && (
        <DataTable
          rows={alerts}
          rowKey={(a) => a.id}
          columns={[
            { header: 'Bus', render: (a) => <span className="font-semibold">{a.busNumber}</span> },
            { header: 'Driver', render: (a) => a.driverName },
            { header: 'Message', render: (a) => <span className="text-xs">{a.message}</span> },
            { header: 'Time', render: (a) => formatDate(a.createdAt) },
          ]}
        />
      )}
    </div>
  );
}
