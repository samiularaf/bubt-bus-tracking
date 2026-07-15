import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hero?: boolean;
}

/** Standard white card with soft shadow, per UI_UX_PLANNING.md §6. */
export function Card({ children, hero = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border shadow-sm p-4 ${
        hero ? 'rounded-hero' : 'rounded-card'
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
