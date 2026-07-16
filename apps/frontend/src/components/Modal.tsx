import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-textPrimary/40 px-4">
      <div className="w-full max-w-app bg-surface rounded-hero p-5 mb-0 sm:mb-auto">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto text-textSecondary hover:text-textPrimary"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
