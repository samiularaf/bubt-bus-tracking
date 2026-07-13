import { Routes, Route } from 'react-router-dom';
import { Bus } from 'lucide-react';

/**
 * Phase 6 setup-verification shell only. Phase 7 replaces this with the real
 * role-based routes (/user/*, /driver/*, /admin/*) per ARCHITECTURE.md §2 and
 * the screen list in UI_UX_PLANNING.md §1.
 */
function SetupCheck() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-app w-full bg-surface border border-border rounded-hero shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Bus className="text-primary" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-textPrimary">BUBT Transit</h1>
        <p className="text-textSecondary text-sm mt-2">
          Project scaffold is set up. Frontend, backend, and shared types are wired together —
          feature screens land in Phase 7.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupCheck />} />
    </Routes>
  );
}
