import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, KeyRound } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge, type BadgeStatus } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import {
  mockGetAdminDrivers,
  mockCreateDriver,
  mockToggleDriverStatus,
  mockResetDriverPassword,
  type AdminDriverRow,
  type CreateDriverInput,
} from '../features/admin/api';
import { MOCK_BUSES } from '../features/buses/api';

const EMPTY_FORM: CreateDriverInput = {
  name: '',
  phone: '',
  bloodGroup: '',
  nidOrLicense: '',
  address: '',
  emergencyContact: '',
  assignedBusNumber: MOCK_BUSES[0]?.busNumber ?? '',
};

export default function AdminDriversPage() {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState<AdminDriverRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateDriverInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    driverId: string;
    password: string;
  } | null>(null);

  async function refresh() {
    setDrivers(await mockGetAdminDrivers());
  }

  useEffect(() => {
    refresh();
  }, []);

  function updateField<K extends keyof CreateDriverInput>(key: K, value: CreateDriverInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const { driver, temporaryPassword } = await mockCreateDriver(form);
    setIsSubmitting(false);
    setForm(EMPTY_FORM);
    setCreatedCredentials({ driverId: driver.driverId, password: temporaryPassword });
    refresh();
  }

  async function handleToggleStatus(driverId: string) {
    await mockToggleDriverStatus(driverId);
    refresh();
  }

  async function handleResetPassword(driverId: string) {
    const newPassword = await mockResetDriverPassword(driverId);
    showToast(`New temporary password: ${newPassword}`, 'info');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-textPrimary">Drivers</h1>
        <Button className="w-auto px-4" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add driver
        </Button>
      </div>

      <DataTable
        rows={drivers}
        rowKey={(d) => d.id}
        columns={[
          {
            header: 'Driver ID',
            render: (d) => <span className="font-mono text-xs">{d.driverId}</span>,
          },
          { header: 'Name', render: (d) => <span className="font-semibold">{d.name}</span> },
          { header: 'Phone', render: (d) => d.phone },
          { header: 'Bus', render: (d) => d.assignedBusNumber },
          { header: 'Status', render: (d) => <StatusBadge status={d.status as BadgeStatus} /> },
          {
            header: '',
            render: (d) => (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleResetPassword(d.id)}
                  className="text-xs font-medium text-primary flex items-center gap-1"
                >
                  <KeyRound size={12} /> Reset password
                </button>
                <button
                  onClick={() => handleToggleStatus(d.id)}
                  className="text-xs font-medium text-textSecondary"
                >
                  {d.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCreatedCredentials(null);
        }}
        title={createdCredentials ? 'Driver created' : 'Add a new driver'}
      >
        {createdCredentials ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-textSecondary">
              Share these credentials with the driver. The password is shown only once.
            </p>
            <div className="bg-background rounded-card p-3 text-sm font-mono">
              <p>Driver ID: {createdCredentials.driverId}</p>
              <p>Password: {createdCredentials.password}</p>
            </div>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setCreatedCredentials(null);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <FormField
              label="Full name"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <FormField
              label="Phone number"
              required
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <FormField
              label="Blood group"
              required
              value={form.bloodGroup}
              onChange={(e) => updateField('bloodGroup', e.target.value)}
              placeholder="e.g. O+"
            />
            <FormField
              label="NID / License number"
              required
              value={form.nidOrLicense}
              onChange={(e) => updateField('nidOrLicense', e.target.value)}
            />
            <FormField
              label="Address"
              required
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <FormField
              label="Emergency contact"
              required
              value={form.emergencyContact}
              onChange={(e) => updateField('emergencyContact', e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assignedBus" className="text-sm font-medium text-textPrimary">
                Assigned bus
              </label>
              <select
                id="assignedBus"
                required
                value={form.assignedBusNumber}
                onChange={(e) => updateField('assignedBusNumber', e.target.value)}
                className="h-12 rounded-card border border-border px-4 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                {MOCK_BUSES.map((bus) => (
                  <option key={bus.id} value={bus.busNumber}>
                    {bus.busNumber}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              Create driver
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
