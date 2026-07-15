import type { ReactNode } from 'react';
import { Bus } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-app">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Bus className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">{title}</h1>
          {subtitle && <p className="text-sm text-textSecondary mt-1 text-center">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
