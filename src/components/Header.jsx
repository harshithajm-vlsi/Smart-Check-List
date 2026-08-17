import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ activeSection, setActiveSection, theme, setTheme, onOpenAuthModal }) {
  const [now, setNow] = useState(new Date());
  const [notifStatus, setNotifStatus] = useState(Notification.permission);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser, logoutUser } = useAuth();

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
    scheduler: 'Scheduler', calendar: 'தமிழ் நாட்காட்டி (Tamil Calendar)', 'tamil-calendar': 'தமிழ் நாட்காட்டி (Tamil Calendar)', stats: 'Analytics',
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
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const link = window.location.origin.includes('localhost')
              ? 'https://smart-check-list-xxtu.vercel.app'
              : window.location.href;
            navigator.clipboard.writeText(link);
            alert(`🔗 Shareable App Link Copied!\n\n${link}`);
          }}
          title="Copy shareable link"
        >
          🔗 Share App
        </button>

        {notifStatus !== 'granted' && (
          <button className="btn btn-ghost btn-sm" onClick={handleNotifRequest} title="Enable notifications">
            🔔 Enable Notifications
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button 
            className="header-auth-btn" 
            onClick={() => {
              if (currentUser) {
                setShowDropdown(!showDropdown);
              } else if (setActiveSection) {
                setActiveSection('login');
              }
            }}
            title="Account Settings & Profile"
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

          {/* Interactive User Dropdown Menu */}
          {showDropdown && currentUser && (
            <div className="header-user-dropdown animate-fadeIn">
              <div className="dropdown-user-header">
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName} 
                  className="dropdown-avatar" 
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=6366f1&color=fff`; }}
                />
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{currentUser.displayName}</div>
                  <div className="dropdown-email">{currentUser.email}</div>
                  {currentUser.bio && (
                    <div className="dropdown-bio">💬 "{currentUser.bio}"</div>
                  )}
                </div>
              </div>

              <div className="dropdown-divider" />

              <button 
                className="dropdown-item-btn"
                onClick={() => {
                  setShowDropdown(false);
                  const link = window.location.origin.includes('localhost')
                    ? 'https://smart-check-list-xxtu.vercel.app'
                    : window.location.href;
                  navigator.clipboard.writeText(link);
                  alert(`📋 Shareable App Link Copied!\n\n${link}`);
                }}
              >
                🔗 Copy Shareable Link
              </button>

              <button 
                className="dropdown-item-btn"
                onClick={() => {
                  setShowDropdown(false);
                  if (setActiveSection) setActiveSection('login');
                }}
              >
                ⚙️ Edit Profile & Account Settings
              </button>

              <button 
                className="dropdown-item-btn red-btn"
                onClick={() => {
                  setShowDropdown(false);
                  logoutUser();
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        <ThemeToggle theme={theme} setTheme={setTheme} />
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

        .header-user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 14px;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 200;
        }

        .dropdown-user-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-primary);
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .dropdown-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-bio {
          font-size: 0.74rem;
          font-style: italic;
          color: var(--text-secondary);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
        }

        .dropdown-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .dropdown-item-btn:hover {
          background: rgba(99, 102, 241, 0.12);
          color: var(--color-primary);
        }

        .dropdown-item-btn.red-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

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

