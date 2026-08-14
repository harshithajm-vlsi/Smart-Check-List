import React from 'react';

export default function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`toggle-track ${isDark ? 'dark' : ''}`}>
        <div className="toggle-icons">
          <span className="icon-sun">☀️</span>
          <span className="icon-moon">🌙</span>
        </div>
        <div className="toggle-thumb" />
      </div>
    </button>
  );
}
