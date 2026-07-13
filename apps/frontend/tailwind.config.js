/** @type {import('tailwindcss').Config} */
// Tokens mirror UI_UX_PLANNING.md §5-§8 — keep in sync.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        success: '#16A34A', // Running
        warning: '#D97706', // Upcoming
        neutral: '#64748B', // Completed
        danger: '#DC2626', // Emergency / Urgent
        surface: '#FFFFFF',
        background: '#F8FAFC',
        border: '#E2E8F0',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        hero: '20px',
      },
      maxWidth: {
        app: '480px', // User/Driver screens stay phone-width even on desktop, per §9
      },
    },
  },
  plugins: [],
};
