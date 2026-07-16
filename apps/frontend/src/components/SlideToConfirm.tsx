import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ChevronsRight } from 'lucide-react';

interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
}

const TRACK_HEIGHT = 56;
const THUMB_SIZE = 48;
const COMPLETE_THRESHOLD = 0.85;

export function SlideToConfirm({
  label,
  onConfirm,
  variant = 'primary',
  disabled = false,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const bgClass = variant === 'danger' ? 'bg-danger/10' : 'bg-primary/10';
  const thumbClass = variant === 'danger' ? 'bg-danger' : 'bg-primary';

  function getMaxDrag() {
    return (trackRef.current?.clientWidth ?? 0) - THUMB_SIZE - 8;
  }

  function handlePointerMove(e: ReactPointerEvent) {
    if (!isDragging || disabled) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(e.clientX - rect.left - THUMB_SIZE / 2, 0), getMaxDrag());
    setDragX(x);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    const max = getMaxDrag();
    if (max > 0 && dragX / max >= COMPLETE_THRESHOLD) {
      setDragX(max);
      setIsConfirmed(true);
      onConfirm();
    } else {
      setDragX(0);
    }
  }

  return (
    <div
      ref={trackRef}
      className={`relative w-full rounded-full ${bgClass} select-none touch-none`}
      style={{ height: TRACK_HEIGHT }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-textPrimary pointer-events-none">
        {isConfirmed ? 'Confirmed' : label}
      </span>
      <div
        role="slider"
        aria-label={label}
        aria-valuenow={Math.round((dragX / (getMaxDrag() || 1)) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={disabled ? -1 : 0}
        className={`absolute top-1 left-1 rounded-full ${thumbClass} flex items-center justify-center text-white cursor-grab active:cursor-grabbing ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onPointerDown={() => !disabled && !isConfirmed && setIsDragging(true)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isConfirmed) {
            setDragX(getMaxDrag());
            setIsConfirmed(true);
            onConfirm();
          }
        }}
      >
        <ChevronsRight size={22} />
      </div>
    </div>
  );
}
