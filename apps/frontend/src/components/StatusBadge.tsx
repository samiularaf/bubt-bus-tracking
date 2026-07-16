export type BadgeStatus = 'running' | 'upcoming' | 'completed' | 'active' | 'inactive';

const STATUS_CONFIG: Record<BadgeStatus, { label: string; className: string }> = {
  running: { label: 'Running', className: 'bg-success/10 text-success' },
  upcoming: { label: 'Upcoming', className: 'bg-warning/10 text-warning' },
  completed: { label: 'Completed', className: 'bg-neutral/10 text-neutral' },
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  inactive: { label: 'Inactive', className: 'bg-neutral/10 text-neutral' },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
