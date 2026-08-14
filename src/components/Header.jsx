import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeSection, theme, setTheme, onOpenAuthModal }) {
  const [now, setNow] = useState(new Date());
  const [notifStatus, setNotifStatus] = useState(Notification.permission);
  const { currentUser } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleNotifRequest = async () => {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  };

  const isDark = theme === 'dark';

  const SECTION_LABELS = {
    dashboard: 'Dashboard', tasks: 'Tasks', alarms: 'Alarms',
    scheduler: 'Scheduler', calendar: 'Calendar', stats: 'Analytics',
    admin: 'User Activity & Admin Portal',
    login: 'Login & Account Portal'
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="header-section">{SECTION_LABELS[activeSection] || 'Dashboard'}</span>
        </div>
        <div className="header-datetime">
          {now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          <span className="header-time">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      <div className="header-right">
        {notifStatus !== 'granted' && (
          <button className="btn btn-ghost btn-sm" onClick={handleNotifRequest} title="Enable notifications">
            🔔 Enable Notifications
          </button>
        )}

        <button 
          className="header-auth-btn" 
          onClick={onOpenAuthModal}
          title="Account Settings & Google Sign-In"
        >
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName} 
              className="header-user-avatar" 
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=6366f1&color=fff`; }}
            />
          ) : (
            <span className="auth-btn-icon">👤</span>
          )}
          <span className="auth-btn-name">
            {currentUser ? currentUser.displayName.split(' ')[0] : 'Sign In'}
          </span>
        </button>

        <button
          className="theme-toggle"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          <div className={`toggle-track ${isDark ? 'active' : ''}`}>
            <span className="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
            <div className="toggle-thumb" />
          </div>
        </button>
      </div>

      <style>{`
        .app-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--bg-header);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 16px;
        }
        .header-left { display: flex; flex-direction: column; gap: 2px; }
        .header-breadcrumb { display: flex; align-items: center; gap: 6px; }
        .header-section { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
        .header-datetime { font-size: 0.75rem; color: var(--text-muted); }
        .header-time { font-weight: 600; color: var(--text-secondary); }
        .header-right { display: flex; align-items: center; gap: 12px; }
        
        .header-auth-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 20px;
          background: var(--bg-surface); border: 1px solid var(--border-color);
          color: var(--text-primary); font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
        }
        .header-auth-btn:hover { border-color: var(--color-primary); background: var(--bg-input); }
        .header-user-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
        .auth-btn-icon { font-size: 0.9rem; }

        .theme-toggle { background: none; border: none; cursor: pointer; padding: 4px; }
        .toggle-track {
          width: 52px; height: 28px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          position: relative;
          display: flex; align-items: center;
          padding: 0 4px;
          transition: background 0.3s ease;
        }
        .toggle-track.active { background: rgba(var(--color-primary-rgb), 0.2); border-color: var(--color-primary); }
        .toggle-icon { font-size: 0.85rem; position: absolute; left: 6px; transition: opacity 0.2s; }
        .toggle-thumb {
          position: absolute;
          right: 4px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          transition: right 0.3s ease;
          box-shadow: var(--shadow-sm);
        }
        .toggle-track:not(.active) .toggle-thumb { right: 28px; }
        @media (max-width: 768px) {
          .app-header { padding: 0 16px 0 60px; }
          .header-datetime { display: none; }
          .auth-btn-name { display: none; }
        }
      `}</style>
    </header>
  );
}

