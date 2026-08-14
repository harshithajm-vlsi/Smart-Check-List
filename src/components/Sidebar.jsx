import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⚡' },
  { id: 'tasks',        label: 'Tasks',        icon: '✅' },
  { id: 'alarms',       label: 'Alarms',       icon: '🔔' },
  { id: 'scheduler',   label: 'Scheduler',    icon: '🗓️' },
  { id: 'calendar',    label: 'Calendar',     icon: '📅' },
  { id: 'stats',       label: 'Analytics',    icon: '📊' },
  { id: 'login',       label: 'Login / Account', icon: '🔑' },
];

export default function Sidebar({ activeSection, setActiveSection, onOpenAuthModal }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  const navItemsToRender = [...NAV_ITEMS];
  if (isAdmin) {
    navItemsToRender.push({ id: 'admin', label: 'User Activity', icon: '👑' });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⏰</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">Smart Alarm</span>
              <span className="sidebar-logo-sub">Productivity Hub</span>
            </div>
          )}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '→' : '←'}
          </button>
          <button
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {navItemsToRender.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''} ${item.id === 'admin' ? 'admin-nav-item' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setMobileOpen(false);
              }}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {activeSection === item.id && !collapsed && (
                <span className="nav-active-dot" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar-footer" onClick={onOpenAuthModal} title="Click to manage account">
            <div className="sidebar-user">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName} 
                  className="sidebar-avatar-img"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=6366f1&color=fff`; }}
                />
              ) : (
                <div className="sidebar-avatar">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div className="user-text-meta">
                <div className="sidebar-username">
                  {currentUser?.displayName || 'Sign In'}
                </div>
                <div className="sidebar-user-role">
                  {currentUser?.isAdmin ? '👑 Admin' : currentUser ? 'Google Account' : 'Click to Sign In'}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: var(--sidebar-width);
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 200;
          transition: width 0.25s ease, transform 0.3s ease;
          overflow: hidden;
        }
        .sidebar.collapsed { width: 68px; }
        .sidebar-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: var(--bg-overlay);
          z-index: 199;
        }
        .sidebar-hamburger {
          display: none;
          position: fixed; top: 16px; left: 16px;
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: 8px; padding: 8px 10px; font-size: 1.1rem;
          z-index: 198; box-shadow: var(--shadow-sm);
          cursor: pointer; color: var(--text-primary);
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 16px 16px; border-bottom: 1px solid var(--border-color);
          min-height: 72px;
        }
        .sidebar-logo-icon { font-size: 1.8rem; flex-shrink: 0; }
        .sidebar-logo-text { flex: 1; min-width: 0; }
        .sidebar-logo-title { display: block; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
        .sidebar-logo-sub { display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: 600; }
        .sidebar-collapse-btn, .sidebar-close-btn {
          background: none; border: 1px solid var(--border-color); border-radius: 6px;
          padding: 4px 8px; color: var(--text-muted); cursor: pointer; flex-shrink: 0; font-size: 0.8rem;
        }
        .sidebar-collapse-btn:hover, .sidebar-close-btn:hover { background: var(--bg-input); }
        .mobile-only { display: none; }
        .sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .sidebar-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
          transition: all 0.15s ease; text-align: left; width: 100%;
          position: relative;
        }
        .sidebar-nav-item:hover { background: var(--bg-input); color: var(--text-primary); }
        .sidebar-nav-item.active {
          background: rgba(var(--color-primary-rgb), 0.12);
          color: var(--color-primary); font-weight: 700;
        }
        .sidebar-nav-item.admin-nav-item.active {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-active-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-primary); flex-shrink: 0;
        }
        .sidebar-footer {
          padding: 16px; border-top: 1px solid var(--border-color); cursor: pointer;
          transition: background 0.15s ease;
        }
        .sidebar-footer:hover { background: var(--bg-input); }
        .sidebar-user { display: flex; align-items: center; gap: 10px; }
        .sidebar-avatar-img {
          width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
        }
        .sidebar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
        }
        .user-text-meta { overflow: hidden; }
        .sidebar-username { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .sidebar-user-role { font-size: 0.7rem; color: var(--color-primary); font-weight: 600; }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); width: 260px !important; box-shadow: var(--shadow-xl); }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-backdrop { display: block; }
          .sidebar-hamburger { display: block; }
          .desktop-only { display: none; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </>
  );
}

