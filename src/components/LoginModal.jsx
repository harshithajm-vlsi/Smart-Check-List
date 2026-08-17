import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveFirebaseCredentials, clearFirebaseCredentials } from '../config/firebase';

export default function LoginModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    loginWithGoogle, 
    logoutUser, 
    switchDemoUser, 
    addSimulatedGoogleUser, 
    allUsers, 
    isFirebaseConfigured,
    authError 
  } = useAuth();

  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Firebase config input state
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbAppId, setFbAppId] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    if (!simName || !simEmail) return;
    addSimulatedGoogleUser(simName, simEmail);
    setSimName('');
    setSimEmail('');
    onClose();
  };

  const [fbSnippet, setFbSnippet] = useState('');

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (fbSnippet.trim()) {
      saveFirebaseCredentials(fbSnippet.trim());
      return;
    }
    if (!fbApiKey || !fbProjectId) return;
    saveFirebaseCredentials({
      apiKey: fbApiKey,
      authDomain: fbAuthDomain || `${fbProjectId}.firebaseapp.com`,
      projectId: fbProjectId,
      storageBucket: `${fbProjectId}.appspot.com`,
      messagingSenderId: '1234567890',
      appId: fbAppId || '1:1234567890:web:abcdef'
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <div className="auth-icon">🔑</div>
          <h2>Google Account Authentication</h2>
          <p>Sign in to access your multi-user Smart Alarm space and sync across devices.</p>
        </div>

        {authError && (
          <div className="auth-alert error">
            ⚠️ {authError}
          </div>
        )}

        {/* Current User Card */}
        {currentUser ? (
          <div className="current-user-card">
            <div className="user-info-row">
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName} 
                className="user-avatar-lg"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=6366f1&color=fff`; }}
              />
              <div className="user-details">
                <div className="user-name">
                  {currentUser.displayName}
                  {currentUser.isAdmin && <span className="badge-admin">👑 Admin</span>}
                </div>
                <div className="user-email">{currentUser.email}</div>
                {currentUser.bio && (
                  <div style={{ fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    💬 "{currentUser.bio}"
                  </div>
                )}
                <div className="user-status-text">
                  <span className="status-dot online" /> Connected with Google
                </div>
              </div>
            </div>

            <div className="user-actions">
              <button className="btn btn-outline full-width" onClick={logoutUser}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-body">
            <button 
              className="btn btn-google full-width" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        )}

        {/* Demo Account Switcher / Simulator Section */}
        {!isFirebaseConfigured && (
          <div className="demo-section">
            <div className="demo-badge">
              <span>💡 Interactive Multi-User Demo Mode Active</span>
            </div>
            <p className="demo-sub">
              You can instantly simulate signing in with different Google user accounts to test live tracking and Admin page features!
            </p>

            <div className="demo-accounts-list">
              <span className="section-label">Switch Current Account:</span>
              {allUsers.map(u => (
                <button
                  key={u.uid}
                  className={`demo-user-chip ${currentUser?.uid === u.uid ? 'active' : ''}`}
                  onClick={() => { switchDemoUser(u.uid); onClose(); }}
                >
                  <img src={u.photoURL} alt={u.displayName} className="chip-avatar" />
                  <span className="chip-name">{u.displayName}</span>
                  {u.role === 'admin' && <span className="chip-role">👑</span>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSimulatedSubmit} className="sim-form">
              <span className="section-label">Sign in as new Google user:</span>
              <div className="sim-inputs">
                <input 
                  type="text" 
                  placeholder="Full Name (e.g. John Doe)" 
                  value={simName} 
                  onChange={e => setSimName(e.target.value)} 
                  className="input" 
                  required
                />
                <input 
                  type="email" 
                  placeholder="Google Email (e.g. john@gmail.com)" 
                  value={simEmail} 
                  onChange={e => setSimEmail(e.target.value)} 
                  className="input" 
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  + Add User
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Firebase Config Toggle */}
        <div className="firebase-setup-footer">
          <button 
            className="btn-text-link" 
            onClick={() => setShowFirebaseSetup(!showFirebaseSetup)}
          >
            {showFirebaseSetup ? '▲ Hide Firebase Settings' : '⚙️ Configure Firebase Credentials'}
          </button>

          {showFirebaseSetup && (
            <form onSubmit={handleSaveFirebaseConfig} className="firebase-config-form">
              <p className="hint">
                Paste your Firebase Config object snippet below OR enter API Key and Project ID.
              </p>
              <textarea 
                placeholder='Paste Firebase Config snippet here, e.g.:&#10;const firebaseConfig = {&#10;  apiKey: "AIzaSy...",&#10;  projectId: "my-app"&#10;};'
                value={fbSnippet}
                onChange={e => setFbSnippet(e.target.value)}
                className="input-textarea"
                rows={4}
              />
              <div className="auth-divider"><span>OR ENTER KEYS</span></div>
              <input 
                type="text" 
                placeholder="Firebase API Key" 
                value={fbApiKey} 
                onChange={e => setFbApiKey(e.target.value)} 
                className="input"
              />
              <input 
                type="text" 
                placeholder="Firebase Project ID" 
                value={fbProjectId} 
                onChange={e => setFbProjectId(e.target.value)} 
                className="input"
              />
              <input 
                type="text" 
                placeholder="Firebase Auth Domain (Optional)" 
                value={fbAuthDomain} 
                onChange={e => setFbAuthDomain(e.target.value)} 
                className="input" 
              />
              <input 
                type="text" 
                placeholder="Firebase App ID (Optional)" 
                value={fbAppId} 
                onChange={e => setFbAppId(e.target.value)} 
                className="input" 
              />

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Credentials & Connect
                </button>
                {isFirebaseConfigured && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={clearFirebaseCredentials}>
                    Reset Credentials
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal-content.auth-modal {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          width: 100%; max-width: 480px;
          padding: 28px;
          position: relative;
          box-shadow: var(--shadow-xl);
          display: flex; flex-direction: column; gap: 20px;
          max-height: 90vh; overflow-y: auto;
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none; font-size: 1.2rem;
          color: var(--text-muted); cursor: pointer;
        }
        .auth-header { text-align: center; }
        .auth-icon { font-size: 2.2rem; margin-bottom: 8px; }
        .auth-header h2 { font-size: 1.3rem; font-weight: 800; margin-bottom: 6px; color: var(--text-primary); }
        .auth-header p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }
        
        .auth-alert.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem;
        }

        .btn-google {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: #ffffff; color: #3c4043;
          border: 1px solid #dadce0; border-radius: 10px;
          padding: 12px 20px; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .btn-google:hover { background: #f8f9fa; border-color: #d2e3fc; box-shadow: 0 2px 6px rgba(60,64,67,0.15); }

        .current-user-card {
          background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 14px;
        }
        .user-info-row { display: flex; align-items: center; gap: 14px; }
        .user-avatar-lg { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
        .user-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
        .badge-admin { background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
        .user-email { font-size: 0.8rem; color: var(--text-muted); }
        .user-status-text { font-size: 0.75rem; color: var(--color-success, #10b981); display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .status-dot.online { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }

        .full-width { width: 100%; }

        .demo-section {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
        }
        .demo-badge { font-size: 0.8rem; font-weight: 700; color: var(--color-primary); }
        .demo-sub { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; }
        .section-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px; }
        .demo-accounts-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .demo-user-chip {
          display: flex; align-items: center; gap: 6px; padding: 6px 10px;
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: 20px; font-size: 0.8rem; cursor: pointer; color: var(--text-primary);
          transition: all 0.15s ease;
        }
        .demo-user-chip:hover { border-color: var(--color-primary); }
        .demo-user-chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
        .chip-avatar { width: 20px; height: 20px; border-radius: 50%; }

        .sim-form { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
        .sim-inputs { display: flex; gap: 6px; }
        .sim-inputs input { flex: 1; padding: 8px; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); }

        .firebase-setup-footer { border-top: 1px solid var(--border-color); pt-3; text-align: center; }
        .btn-text-link { background: none; border: none; color: var(--color-primary); font-size: 0.8rem; cursor: pointer; font-weight: 600; }
        .firebase-config-form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; text-align: left; }
        .firebase-config-form input, .firebase-config-form textarea { padding: 8px 12px; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); font-family: monospace; }
        .input-textarea { width: 100%; resize: vertical; }
        .hint { font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; }
        .form-buttons { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
      `}</style>
    </div>
  );
}
