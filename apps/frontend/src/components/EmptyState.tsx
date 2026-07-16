import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center text-textSecondary mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      {description && <p className="text-sm text-textSecondary mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
