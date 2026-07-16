import { useState } from 'react';
import { Share, X, Smartphone } from 'lucide-react';
import { Card } from './Card';

/**
 * iOS Web Push requires the site to be added to the home screen first.
 * Session-only dismissal for now (mock/Phase 7) — persisting "already
 * dismissed" across visits is a Phase 10 (Notification System) concern.
 */
export function InstallAppPrompt() {
  const [isDismissed, setIsDismissed] = useState(false);
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isDismissed || !isIos) return null;

  return (
    <Card className="flex items-start gap-3 mb-5 bg-primary/5 border-primary/20">
      <Smartphone size={20} className="text-primary shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-textPrimary">Install this app</h3>
        <p className="text-xs text-textSecondary mt-1">
          Add BUBT Transit to your home screen to get trip notifications. Tap{' '}
          <Share size={12} className="inline" /> then "Add to Home Screen".
        </p>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss"
        className="text-textSecondary shrink-0"
      >
        <X size={16} />
      </button>
    </Card>
  );
}
