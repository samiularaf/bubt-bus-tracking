import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import {
  mockGetAdminSchedules,
  mockActivateSchedule,
  mockCreateSchedule,
  type AdminScheduleRow,
} from '../features/admin/api';
import type { ScheduleType } from '@bubt/shared-types';

const SCHEDULE_TYPES: ScheduleType[] = ['regular', 'ramadan', 'exam', 'holiday', 'special'];

export default function AdminSchedulesPage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<AdminScheduleRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ScheduleType>('special');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  async function refresh() {
    setSchedules(await mockGetAdminSchedules());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockCreateSchedule(name, type);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    showToast('Schedule created. Add trip templates before activating it.', 'success');
    refresh();
  }

  async function handleActivate(scheduleId: string) {
    setActivatingId(scheduleId);
    await mockActivateSchedule(scheduleId);
    setActivatingId(null);
    showToast('Schedule activated. Trips have been regenerated.', 'success');
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-textPrimary">Schedules</h1>
        <Button className="w-auto px-4" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add schedule
        </Button>
      </div>

      <p className="text-xs text-textSecondary mb-4">
        Only one schedule can be active at a time. Activating a schedule regenerates all upcoming
        trips from its templates.
      </p>

      <DataTable
        rows={schedules}
        rowKey={(s) => s.id}
        columns={[
          { header: 'Name', render: (s) => <span className="font-semibold">{s.name}</span> },
          { header: 'Type', render: (s) => <span className="capitalize">{s.type}</span> },
          { header: 'Templates', render: (s) => s.templateCount },
          {
            header: '',
            render: (s) =>
              s.isActive ? (
                <span className="text-xs font-semibold text-success">Active</span>
              ) : (
                <button
                  onClick={() => handleActivate(s.id)}
                  disabled={activatingId === s.id}
                  className="text-xs font-medium text-primary disabled:opacity-50"
                >
                  {activatingId === s.id ? 'Activating...' : 'Activate'}
                </button>
              ),
          },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a new schedule">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField
            label="Schedule name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mid-term Exam Week"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="scheduleType" className="text-sm font-medium text-textPrimary">
              Type
            </label>
            <select
              id="scheduleType"
              value={type}
              onChange={(e) => setType(e.target.value as ScheduleType)}
              className="h-12 rounded-card border border-border px-4 text-sm text-textPrimary capitalize focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              {SCHEDULE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Create schedule
          </Button>
        </form>
      </Modal>
    </div>
  );
}
