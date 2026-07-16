import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge, type BadgeStatus } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import {
  mockGetAdminBuses,
  mockCreateBus,
  mockToggleBusStatus,
  type AdminBusRow,
} from '../features/admin/api';

export default function AdminBusesPage() {
  const { showToast } = useToast();
  const [buses, setBuses] = useState<AdminBusRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busNumber, setBusNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    setBuses(await mockGetAdminBuses());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockCreateBus(busNumber, routeName);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setBusNumber('');
    setRouteName('');
    showToast('Bus created.', 'success');
    refresh();
  }

  async function handleToggle(busId: string) {
    await mockToggleBusStatus(busId);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-textPrimary">Buses</h1>
        <Button className="w-auto px-4" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add bus
        </Button>
      </div>

      <DataTable
        rows={buses}
        rowKey={(b) => b.id}
        columns={[
          { header: 'Bus', render: (b) => <span className="font-semibold">{b.busNumber}</span> },
          { header: 'Route', render: (b) => b.routeName },
          { header: 'Status', render: (b) => <StatusBadge status={b.status as BadgeStatus} /> },
          {
            header: '',
            render: (b) => (
              <button
                onClick={() => handleToggle(b.id)}
                className="text-xs font-medium text-primary"
              >
                {b.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            ),
          },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a new bus">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField
            label="Bus name"
            required
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            placeholder="e.g. Turag"
          />
          <FormField
            label="Route"
            required
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g. Uttara - Airport - BUBT"
          />
          <Button type="submit" isLoading={isSubmitting}>
            Create bus
          </Button>
        </form>
      </Modal>
    </div>
  );
}
