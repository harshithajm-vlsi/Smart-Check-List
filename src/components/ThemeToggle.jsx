import React from 'react';

export default function ThemeToggle({ theme, setTheme }) {
  const THEME_OPTIONS = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark-blue', label: 'Dark Blue', icon: '🌌' },
    { id: 'black', label: 'Black', icon: '🖤' },
  ];

  return (
    <div className="theme-3mode-selector">
      {THEME_OPTIONS.map((opt) => {
        const isActive = theme === opt.id || (opt.id === 'dark-blue' && theme === 'dark');
        return (
          <button
            key={opt.id}
            className={`theme-mode-btn ${isActive ? 'active' : ''}`}
            onClick={() => setTheme(opt.id)}
            title={`Switch to ${opt.label} Mode`}
          >
            <span className="theme-mode-icon">{opt.icon}</span>
            <span className="theme-mode-label">{opt.label}</span>
          </button>
        );
      })}

      <style jsx>{`
        .theme-3mode-selector {
          display: inline-flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 3px;
          gap: 2px;
        }

        .theme-mode-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 16px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-mode-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .theme-mode-btn.active {
          background: var(--bg-surface);
          color: var(--color-primary);
          box-shadow: var(--shadow-xs);
          font-weight: 700;
        }

        .theme-mode-icon {
          font-size: 0.85rem;
        }

        @media (max-width: 640px) {
          .theme-mode-label {
            display: none;
          }
          .theme-mode-btn {
            padding: 5px 8px;
          }
        }
      `}</style>
    </div>
  );
}
