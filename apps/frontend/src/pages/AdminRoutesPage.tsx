import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { mockGetAdminRoutes, mockCreateRoute, type AdminRouteRow } from '../features/admin/api';

export default function AdminRoutesPage() {
  const { showToast } = useToast();
  const [routes, setRoutes] = useState<AdminRouteRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    setRoutes(await mockGetAdminRoutes());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockCreateRoute(name);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    showToast('Route created. Add stops from the route detail view.', 'success');
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-textPrimary">Routes &amp; Stops</h1>
        <Button className="w-auto px-4" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add route
        </Button>
      </div>

      <DataTable
        rows={routes}
        rowKey={(r) => r.id}
        columns={[
          { header: 'Route', render: (r) => <span className="font-semibold">{r.name}</span> },
          { header: 'Stops', render: (r) => `${r.stopCount} stops` },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a new route">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField
            label="Route name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Uttara - Airport - BUBT"
            hint="Individual stops can be added once the route is created."
          />
          <Button type="submit" isLoading={isSubmitting}>
            Create route
          </Button>
        </form>
      </Modal>
    </div>
  );
}
