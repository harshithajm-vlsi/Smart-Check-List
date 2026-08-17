import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveFirebaseCredentials } from '../config/firebase';

export default function AdminPortal() {
  const { 
    currentUser, 
    allUsers, 
    isAdmin, 
    grantSelfAdmin,
    toggleUserRole, 
    deleteUserAccount,
    isFirebaseConfigured,
    switchDemoUser,
    addSimulatedGoogleUser 
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [newSimEmail, setNewSimEmail] = useState('');

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="denied-card">
          <div className="denied-icon">🔒</div>
          <h2>Admin Access Required</h2>
          <p>Sign in with an Administrator account or grant admin privileges to access the User Activity page.</p>
          <div className="denied-hint">
            Current account: <strong>{currentUser?.email || 'Not logged in'}</strong>
          </div>
          {currentUser && (
            <button 
              className="btn btn-warning full-width" 
              style={{ marginTop: 16 }}
              onClick={grantSelfAdmin}
            >
              👑 Grant Admin Role to {currentUser.displayName || currentUser.email}
            </button>
          )}
        </div>

        <style>{`
          .admin-access-denied {
            display: flex; align-items: center; justify-content: center;
            min-height: 60vh; padding: 24px;
          }
          .denied-card {
            background: var(--bg-surface); border: 1px solid var(--border-color);
            border-radius: 16px; padding: 40px; text-align: center;
            max-width: 440px; width: 100%; box-shadow: var(--shadow-lg);
          }
          .denied-icon { font-size: 3rem; margin-bottom: 12px; }
          .denied-card h2 { color: var(--text-primary); font-size: 1.4rem; margin-bottom: 8px; }
          .denied-card p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; }
          .denied-hint { font-size: 0.8rem; background: var(--bg-input); padding: 8px 12px; border-radius: 8px; color: var(--text-muted); }
        `}</style>
      </div>
    );
  }

  // Deduplicate users strictly by email
  const uniqueUsersMap = new Map();
  allUsers.forEach(u => {
    if (u.email) {
      const clean = u.email.toLowerCase();
      if (clean === 'harshithajm70@gmail.com') {
        uniqueUsersMap.set(clean, { ...u, displayName: 'Harshitha', role: 'owner' });
      } else if (!uniqueUsersMap.has(clean)) {
        uniqueUsersMap.set(clean, u);
      }
    }
  });
  const deduplicatedUsers = Array.from(uniqueUsersMap.values());

  // Filter users
  const filteredUsers = deduplicatedUsers.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const isOnline = user.isOnline && (new Date() - new Date(user.lastActiveAt) < 5 * 60 * 1000);
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'online' && isOnline) ||
      (statusFilter === 'offline' && !isOnline);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const totalUsers = allUsers.length;
  const onlineUsers = allUsers.filter(u => u.isOnline && (new Date() - new Date(u.lastActiveAt) < 5 * 60 * 1000)).length;
  const activeToday = allUsers.filter(u => {
    const lastActive = new Date(u.lastActiveAt);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;
  const adminCount = allUsers.filter(u => u.role === 'admin').length;

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const diff = Math.floor((new Date() - new Date(isoString)) / 1000); // in seconds
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleCreateSimUser = (e) => {
    e.preventDefault();
    if (!newSimName || !newSimEmail) return;
    addSimulatedGoogleUser(newSimName, newSimEmail);
    setNewSimName('');
    setNewSimEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="admin-portal-container">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <h1 className="admin-title">
            👑 User Activity & Administration Portal
          </h1>
          <p className="admin-subtitle">
            Real-time tracking of signed-in Google accounts, active user sessions, and permission management.
          </p>
        </div>

        <div className="banner-actions">
          {!isFirebaseConfigured && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Simulate Google Sign-In
            </button>
          )}
          <div className={`mode-indicator ${isFirebaseConfigured ? 'live' : 'demo'}`}>
            {isFirebaseConfigured ? '⚡ Firebase Realtime Sync' : '💡 Demo Mode Simulator'}
          </div>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper blue">👥</div>
          <div className="stat-details">
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-label">Total Signed-In Users</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <span className="live-ping" />
            🟢
          </div>
          <div className="stat-details">
            <span className="stat-value">{onlineUsers}</span>
            <span className="stat-label">Currently Online</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper purple">📅</div>
          <div className="stat-details">
            <span className="stat-value">{activeToday}</span>
            <span className="stat-label">Active Today</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper amber">👑</div>
          <div className="stat-details">
            <span className="stat-value">{adminCount}</span>
            <span className="stat-label">Admin Accounts</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-layout">
        {/* User Directory Table Section */}
        <div className="admin-card table-card">
          <div className="card-header-bar">
            <h3>Registered Users & Live Activity</h3>
            
            {/* Filters */}
            <div className="filter-group">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search name or email..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)}
                className="select-filter"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="user">Users Only</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="select-filter"
              >
                <option value="all">All Status</option>
                <option value="online">Online Now</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>First Joined</th>
                  <th>Device / Client</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-cell">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isUserOnline = user.isOnline && (new Date() - new Date(user.lastActiveAt) < 5 * 60 * 1000);
                    const isSelf = currentUser?.uid === user.uid;

                    return (
                      <tr key={user.uid} className={isSelf ? 'current-user-row' : ''}>
                        <td className="user-cell">
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName} 
                            className="avatar-img"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=6366f1&color=fff`; }}
                          />
                          <div className="user-meta">
                            <div className="user-display-name">
                              {user.displayName}
                              {isSelf && <span className="you-tag">(You)</span>}
                            </div>
                            <div className="user-email-text">{user.email}</div>
                          </div>
                        </td>

                        <td>
                          <span className={`role-badge ${user.role === 'owner' || user.email === 'harshithajm70@gmail.com' ? 'admin' : user.role}`}>
                            {user.role === 'owner' || user.email === 'harshithajm70@gmail.com' ? '👑 Owner (Main Admin)' : user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>

                        <td>
                          <div className="status-pill-cell">
                            <span className={`status-indicator-dot ${isUserOnline ? 'online' : 'offline'}`} />
                            <span className="status-label-text">
                              {isUserOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>

                        <td className="time-cell">
                          {formatRelativeTime(user.lastActiveAt)}
                        </td>

                        <td className="time-cell">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>

                        <td className="device-cell">
                          <span className="device-tag">
                            {user.deviceInfo || 'Web App Client'}
                          </span>
                        </td>

                        <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {user.role !== 'owner' && user.email !== 'harshithajm70@gmail.com' && (
                            <button
                              className={`btn btn-xs ${user.role === 'admin' ? 'btn-warning' : 'btn-outline'}`}
                              onClick={() => toggleUserRole(user.uid)}
                              title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                            >
                              {user.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                          )}

                          {!isSelf && user.role !== 'owner' && user.email !== 'harshithajm70@gmail.com' ? (
                            <button
                              type="button"
                              className="btn btn-xs btn-danger"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                if (window.confirm(`⚠️ Are you sure you want to PERMANENTLY delete user account "${user.displayName}" (${user.email})?`)) {
                                  deleteUserAccount(user.uid);
                                }
                              }}
                              title="Delete unwanted user account"
                            >
                              🗑️ Delete
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {isSelf ? '(Active Account)' : '👑 System Owner'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Activity Stream & Quick Info */}
        <div className="admin-sidebar-widgets">
          <div className="admin-card widget-card">
            <h3>⚡ Live Login Activity</h3>
            <p className="widget-subtitle">Recent user sign-ins and session heartbeats</p>
            
            <div className="activity-feed">
              {allUsers.slice(0, 6).map(u => (
                <div key={`act-${u.uid}`} className="feed-item">
                  <img src={u.photoURL} alt={u.displayName} className="feed-avatar" />
                  <div className="feed-info">
                    <div className="feed-title">
                      <strong>{u.displayName}</strong> {u.isOnline ? 'is active' : 'signed in'}
                    </div>
                    <div className="feed-time">{formatRelativeTime(u.lastActiveAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card widget-card info-box">
            <h3>ℹ️ Admin Quick Note</h3>
            <p>
              Signed-in users will automatically appear here. Their active status is updated via an online heartbeat protocol every 30 seconds.
            </p>
            <div className="info-divider" />
            <div className="info-stat-row">
              <span>Firebase Database:</span>
              <strong>{isFirebaseConfigured ? '🟢 Connected' : '🟡 Demo Mode'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Simulate User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content sim-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            <h3>Add Simulated Google User</h3>
            <p>Create a test user account to see multi-user behavior in real-time.</p>
            
            <form onSubmit={handleCreateSimUser} className="sim-modal-form">
              <input 
                type="text" 
                placeholder="User Full Name" 
                value={newSimName} 
                onChange={e => setNewSimName(e.target.value)} 
                className="input" 
                required 
              />
              <input 
                type="email" 
                placeholder="Google Email Address" 
                value={newSimEmail} 
                onChange={e => setNewSimEmail(e.target.value)} 
                className="input" 
                required 
              />
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-portal-container {
          padding: 24px;
          display: flex; flex-direction: column; gap: 24px;
          max-width: 1400px; margin: 0 auto;
        }

        .admin-header-banner {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
          border: 1px solid var(--border-color);
          border-radius: 16px; padding: 24px 28px;
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; flex-wrap: wrap;
        }
        .admin-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
        .admin-subtitle { font-size: 0.88rem; color: var(--text-secondary); }

        .banner-actions { display: flex; align-items: center; gap: 12px; }
        .mode-indicator {
          font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 20px;
        }
        .mode-indicator.live { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .mode-indicator.demo { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;
        }
        .admin-stat-card {
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 16px;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon-wrapper {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; position: relative; flex-shrink: 0;
        }
        .stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.12); }
        .stat-icon-wrapper.green { background: rgba(16, 185, 129, 0.12); }
        .stat-icon-wrapper.purple { background: rgba(168, 85, 247, 0.12); }
        .stat-icon-wrapper.amber { background: rgba(245, 158, 11, 0.12); }

        .live-ping {
          position: absolute; top: 6px; right: 6px;
          width: 8px; height: 8px; border-radius: 50%; background: #10b981;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .stat-value { display: block; font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
        .stat-label { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; }

        .admin-main-layout {
          display: grid; grid-template-columns: 1fr 320px; gap: 24px;
        }
        @media (max-width: 1100px) {
          .admin-main-layout { grid-template-columns: 1fr; }
        }

        .admin-card {
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: 16px; padding: 24px; box-shadow: var(--shadow-sm);
        }

        .card-header-bar {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .card-header-bar h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }

        .filter-group { display: flex; gap: 10px; flex-wrap: wrap; }
        .search-box {
          position: relative; display: flex; align-items: center;
        }
        .search-icon { position: absolute; left: 10px; font-size: 0.85rem; color: var(--text-muted); }
        .search-input {
          padding: 8px 12px 8px 32px; font-size: 0.82rem;
          border-radius: 8px; border: 1px solid var(--border-color);
          background: var(--bg-input); color: var(--text-primary); width: 220px;
        }
        .select-filter {
          padding: 8px 12px; font-size: 0.82rem;
          border-radius: 8px; border: 1px solid var(--border-color);
          background: var(--bg-input); color: var(--text-primary);
        }

        .table-responsive { overflow-x: auto; }
        .user-table { width: 100%; border-collapse: collapse; text-align: left; }
        .user-table th {
          padding: 12px 14px; font-size: 0.75rem; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border-color);
        }
        .user-table td {
          padding: 14px; font-size: 0.85rem; border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }
        .user-table tr:last-child td { border-bottom: none; }
        .current-user-row { background: rgba(99, 102, 241, 0.04); }

        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
        .user-display-name { font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
        .you-tag { font-size: 0.7rem; color: var(--color-primary); font-weight: 600; }
        .user-email-text { font-size: 0.78rem; color: var(--text-muted); }

        .role-badge {
          display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;
        }
        .role-badge.admin { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .role-badge.user { background: var(--bg-input); color: var(--text-secondary); }

        .status-pill-cell { display: flex; align-items: center; gap: 6px; }
        .status-indicator-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-indicator-dot.online { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.6); }
        .status-indicator-dot.offline { background: var(--text-muted); opacity: 0.5; }
        .status-label-text { font-weight: 600; font-size: 0.8rem; color: var(--text-secondary); }

        .time-cell { font-size: 0.8rem; color: var(--text-secondary); }
        .device-tag { font-size: 0.75rem; background: var(--bg-input); padding: 4px 8px; border-radius: 6px; color: var(--text-muted); }

        .empty-table-cell { text-align: center; padding: 32px !important; color: var(--text-muted); }

        .admin-sidebar-widgets { display: flex; flex-direction: column; gap: 20px; }
        .widget-card h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .widget-subtitle { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 16px; }

        .activity-feed { display: flex; flex-direction: column; gap: 12px; }
        .feed-item { display: flex; align-items: center; gap: 10px; }
        .feed-avatar { width: 32px; height: 32px; border-radius: 50%; }
        .feed-title { font-size: 0.8rem; color: var(--text-secondary); }
        .feed-time { font-size: 0.72rem; color: var(--text-muted); }

        .info-box { background: rgba(99, 102, 241, 0.05); }
        .info-box p { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
        .info-divider { height: 1px; background: var(--border-color); margin: 12px 0; }
        .info-stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-primary); }

        .sim-modal { max-width: 400px; width: 100%; padding: 24px; border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); }
        .sim-modal-form { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .sim-modal-form input { padding: 10px; font-size: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

        .btn-xs { padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; }
        .btn-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
        .btn-warning:hover { background: rgba(245, 158, 11, 0.25); }
      `}</style>
    </div>
  );
}
