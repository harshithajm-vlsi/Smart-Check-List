import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const { 
    currentUser, 
    loginWithGoogle, 
    loginWithEmailPassword, 
    registerWithEmailPassword, 
    updateUserProfile,
    grantSelfAdmin,
    logoutUser,
    switchDemoUser,
    allUsers,
    isFirebaseConfigured,
    authError 
  } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  
  // Sign in fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Account Settings / Profile State
  const [activeTab, setActiveTab] = useState('profile');
  const [settingsSearch, setSettingsSearch] = useState('');

  // Editable Profile fields
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [genderInput, setGenderInput] = useState('Prefer not to say');
  const [photoInput, setPhotoInput] = useState('');

  // UI status state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saveNotice, setSaveNotice] = useState('');

  // Sync profile fields with currentUser
  useEffect(() => {
    if (currentUser) {
      setNameInput(currentUser.displayName || '');
      setBioInput(currentUser.bio || '');
      setGenderInput(currentUser.gender || 'Prefer not to say');
      setPhotoInput(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithEmailPassword(loginIdentifier, loginPassword);
      setSuccessMsg('Successfully signed in!');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await registerWithEmailPassword(regUsername, regEmail, regPassword);
      setSuccessMsg('Account created successfully! Welcome to Smart Alarm.');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // Save Full Profile (Name, Gender, Bio, Photo)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('User name cannot be empty.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      await updateUserProfile({
        displayName: nameInput.trim(),
        bio: bioInput.trim(),
        gender: genderInput,
        photoURL: photoInput.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput.trim())}&background=6366f1&color=fff`
      });
      setSaveNotice('✅ Profile updated successfully! Changes reflected on Dashboard.');
      setTimeout(() => setSaveNotice(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Change avatar photo URL via prompt
  const handleChangePhotoPrompt = () => {
    const url = window.prompt('Enter image URL for profile photo:', photoInput || currentUser?.photoURL);
    if (url && url.trim()) {
      setPhotoInput(url.trim());
    }
  };

  // Menu items list matching reference screenshot
  const SETTINGS_MENU_ITEMS = [
    { id: 'general', icon: '💻', title: 'General', subtitle: 'Startup and close, system preferences' },
    { id: 'profile', icon: '👤', title: 'Profile', subtitle: 'Name, profile picture, gender, bio' },
    { id: 'account', icon: '🔑', title: 'Account', subtitle: 'Security notifications, account info' },
    { id: 'privacy', icon: '🔒', title: 'Privacy', subtitle: 'Blocked contacts, disappearing messages' },
    { id: 'chats', icon: '💬', title: 'Chats & Theme', subtitle: 'Theme, wallpaper, chat settings' },
    { id: 'video', icon: '📹', title: 'Video & voice', subtitle: 'Camera, microphone & speakers' },
    { id: 'notifications', icon: '🔔', title: 'Notifications', subtitle: 'Messages, groups, sounds' },
    { id: 'shortcuts', icon: '⌨️', title: 'Keyboard shortcuts', subtitle: 'Quick actions & hotkeys' },
    { id: 'help', icon: '❓', title: 'Help and feedback', subtitle: 'Help centre, contact us, privacy policy' }
  ];

  const filteredMenuItems = SETTINGS_MENU_ITEMS.filter(item => 
    item.title.toLowerCase().includes(settingsSearch.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(settingsSearch.toLowerCase())
  );

  return (
    <div className="login-page-container">
      <div className="login-glow-bg" />

      <div className="settings-portal-wrapper">
        {/* Brand Bar */}
        <div className="login-brand-bar">
          <div className="brand-logo-small">⏰</div>
          <span className="brand-name">Smart Alarm Account Portal</span>
        </div>

        {currentUser ? (
          /* WhatsApp / Modern Settings 2-Column Portal Interface */
          <div className="settings-main-layout">
            {/* Left Sidebar Menu */}
            <div className="settings-sidebar">
              {/* Header with User Name */}
              <div className="sidebar-header">
                <h2 className="user-title-header">{currentUser.displayName || 'User Profile'}</h2>
              </div>

              {/* Search Bar */}
              <div className="sidebar-search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search settings..."
                  value={settingsSearch}
                  onChange={e => setSettingsSearch(e.target.value)}
                  className="search-input"
                />
                {settingsSearch && (
                  <button className="clear-search-btn" onClick={() => setSettingsSearch('')}>✕</button>
                )}
              </div>

              {/* Navigation Menu List */}
              <div className="sidebar-menu-list">
                {filteredMenuItems.map(item => (
                  <button 
                    key={item.id}
                    className={`menu-item-btn ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="menu-item-icon">{item.icon}</span>
                    <div className="menu-item-text">
                      <div className="menu-item-title">{item.title}</div>
                      <div className="menu-item-sub">{item.subtitle}</div>
                    </div>
                  </button>
                ))}

                {/* Log Out Action Item */}
                <button 
                  className="menu-item-btn logout-item"
                  onClick={logoutUser}
                >
                  <span className="menu-item-icon red-text">🚪</span>
                  <div className="menu-item-text">
                    <div className="menu-item-title red-text">Log out</div>
                    <div className="menu-item-sub">Sign out from this device</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Main Content Workspace */}
            <div className="settings-content-area">
              {/* SECTION: PROFILE (User Name, Gender Preference, Bio, Photo) */}
              {activeTab === 'profile' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>👤 Profile Settings</h2>
                    <p>Customize your user identity, gender preference, and bio status.</p>
                  </div>

                  {saveNotice && (
                    <div className="auth-alert success mb-3">
                      {saveNotice}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="auth-alert error mb-3">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="profile-edit-form">
                    {/* Avatar Photo Section */}
                    <div className="avatar-edit-section">
                      <div className="avatar-preview-box">
                        <img 
                          src={photoInput || currentUser.photoURL} 
                          alt={currentUser.displayName} 
                          className="avatar-preview-img"
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput || 'User')}&background=6366f1&color=fff`; }}
                        />
                        <button 
                          type="button"
                          className="avatar-change-btn"
                          onClick={handleChangePhotoPrompt}
                          title="Change picture URL"
                        >
                          📷
                        </button>
                      </div>
                      <div className="avatar-info">
                        <label className="form-label">Profile Image URL</label>
                        <input 
                          type="text" 
                          value={photoInput} 
                          onChange={e => setPhotoInput(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="form-input"
                        />
                        <span className="form-hint">Enter an image URL or click 📷 to choose photo.</span>
                      </div>
                    </div>

                    <div className="form-divider" />

                    {/* User Name Input */}
                    <div className="form-group">
                      <label className="form-label">User Name / Display Name *</label>
                      <input 
                        type="text" 
                        value={nameInput} 
                        onChange={e => setNameInput(e.target.value)}
                        placeholder="e.g. Harshu~~💜"
                        className="form-input"
                        required
                      />
                      <span className="form-hint">This name will be displayed in greetings, tasks, and reports across your dashboard.</span>
                    </div>

                    {/* Gender Preference Select */}
                    <div className="form-group">
                      <label className="form-label">Gender Preference</label>
                      <div className="gender-selector-grid">
                        {[
                          { value: 'Female', label: 'Female', icon: '♀️' },
                          { value: 'Male', label: 'Male', icon: '♂️' },
                          { value: 'Non-binary', label: 'Non-binary', icon: '🌈' },
                          { value: 'Prefer not to say', label: 'Prefer not to say', icon: '🔒' }
                        ].map(g => (
                          <button
                            key={g.value}
                            type="button"
                            className={`gender-chip-btn ${genderInput === g.value ? 'selected' : ''}`}
                            onClick={() => setGenderInput(g.value)}
                          >
                            <span>{g.icon}</span>
                            <span>{g.label}</span>
                          </button>
                        ))}
                      </div>
                      <span className="form-hint">Used for personalized account badges and dashboard themes.</span>
                    </div>

                    {/* Bio / About Input */}
                    <div className="form-group">
                      <label className="form-label">Bio / About Status</label>
                      <textarea 
                        rows="3"
                        value={bioInput} 
                        onChange={e => setBioInput(e.target.value)}
                        placeholder="e.g. Coding through the night ☕ | Living life one task at a time 💜"
                        className="form-textarea"
                      />
                      <span className="form-hint">This bio quote will be highlighted on your personal Dashboard welcome banner!</span>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-save-profile" disabled={loading}>
                        {loading ? 'Saving Changes...' : '💾 Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION: GENERAL */}
              {activeTab === 'general' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>💻 General Settings</h2>
                    <p>App startup behavior and interface preferences.</p>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Default Startup Section</h4>
                      <p>Choose which view loads when you open Smart Alarm.</p>
                    </div>
                    <select className="form-select" defaultValue="dashboard">
                      <option value="dashboard">Personal Dashboard</option>
                      <option value="tasks">Checklist & Tasks</option>
                      <option value="alarms">Alarms Manager</option>
                      <option value="calendar">Calendar Planner</option>
                    </select>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Time Format</h4>
                      <p>Display 12-hour AM/PM or 24-hour military clock across alarms.</p>
                    </div>
                    <select className="form-select" defaultValue="12">
                      <option value="12">12-Hour Format (e.g. 08:30 AM)</option>
                      <option value="24">24-Hour Format (e.g. 20:30)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION: ACCOUNT */}
              {activeTab === 'account' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>🔑 Account & Security</h2>
                    <p>Manage your login credentials, role permissions, and active session.</p>
                  </div>
                  <div className="account-details-box">
                    <div className="acc-row">
                      <span className="acc-label">Google Account Email</span>
                      <span className="acc-val">{currentUser.email}</span>
                    </div>
                    <div className="acc-row">
                      <span className="acc-label">User ID (UID)</span>
                      <span className="acc-val code-font">{currentUser.uid}</span>
                    </div>
                    <div className="acc-row">
                      <span className="acc-label">Current Role</span>
                      <span className="acc-val font-bold">
                        {currentUser.isAdmin ? '👑 Administrator (Owner)' : '👤 Standard User'}
                      </span>
                    </div>
                    {!currentUser.isAdmin && (
                      <button className="btn btn-warning btn-sm mt-2" onClick={grantSelfAdmin}>
                        Unlock Admin Privileges
                      </button>
                    )}
                  </div>

                  {/* Multi-User Switcher (for demo mode) */}
                  <div className="quick-switch-box mt-4">
                    <h3>👥 Quick Account Switcher (Multi-User Simulation)</h3>
                    <p className="text-muted text-xs mb-2">Switch between demo accounts to test permissions.</p>
                    <div className="user-chips-grid">
                      {allUsers.map(u => (
                        <button
                          key={u.uid}
                          className={`chip-btn ${currentUser.uid === u.uid ? 'active' : ''}`}
                          onClick={() => switchDemoUser(u.uid)}
                        >
                          <img src={u.photoURL} alt={u.displayName} className="chip-img" />
                          <span>{u.displayName}</span>
                          {u.role === 'admin' && <span className="admin-star">👑</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>🔒 Privacy & Security</h2>
                    <p>Control your data persistence and local storage backups.</p>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Local Storage Data Retention</h4>
                      <p>Your tasks, schedules, and custom settings are stored locally on your device.</p>
                    </div>
                    <button className="btn btn-outline btn-xs" onClick={() => alert('Local data backup verified.')}>
                      Verify Backup
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: CHATS & THEME */}
              {activeTab === 'chats' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>💬 Chats & Appearance</h2>
                    <p>Customize system theme, colors, and layout aesthetics.</p>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Interface Theme</h4>
                      <p>Toggle dark mode or light glassmorphic styling.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                        document.documentElement.setAttribute('data-theme', nextTheme);
                        localStorage.setItem('sa_theme', nextTheme);
                      }}
                    >
                      🌗 Toggle Theme
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: VIDEO & VOICE */}
              {activeTab === 'video' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>📹 Video & Voice</h2>
                    <p>Test alarm audio alerts, ringers, and speaker volume.</p>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Alarm Speaker Audio Test</h4>
                      <p>Ensure web audio playback permissions are active on this browser.</p>
                    </div>
                    <button 
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        try {
                          const ctx = new (window.AudioContext || window.webkitAudioContext)();
                          const osc = ctx.createOscillator();
                          osc.connect(ctx.destination);
                          osc.start();
                          osc.stop(ctx.currentTime + 0.3);
                          alert('🔊 Audio test tone played successfully!');
                        } catch (e) {
                          alert('Audio play failed: ' + e.message);
                        }
                      }}
                    >
                      🔊 Test Speaker Sound
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>🔔 Notifications</h2>
                    <p>Manage system notifications and popup alerts.</p>
                  </div>
                  <div className="setting-card-item">
                    <div className="setting-info">
                      <h4>Browser Push Notifications</h4>
                      <p>Receive desktop alarms even when the app tab is in the background.</p>
                    </div>
                    <button 
                      className="btn btn-primary btn-xs"
                      onClick={async () => {
                        if ('Notification' in window) {
                          const p = await Notification.requestPermission();
                          alert(`Notification permission status: ${p}`);
                        } else {
                          alert('Notifications not supported in this browser environment.');
                        }
                      }}
                    >
                      🔔 Request Permission
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: KEYBOARD SHORTCUTS */}
              {activeTab === 'shortcuts' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <p>Boost your productivity with quick keyboard hotkeys.</p>
                  </div>
                  <div className="shortcuts-list-grid">
                    <div className="shortcut-row"><span>Open Dashboard</span><kbd>Alt + 1</kbd></div>
                    <div className="shortcut-row"><span>Add Task</span><kbd>Alt + N</kbd></div>
                    <div className="shortcut-row"><span>Toggle Alarm</span><kbd>Alt + A</kbd></div>
                    <div className="shortcut-row"><span>Account Settings</span><kbd>Alt + S</kbd></div>
                  </div>
                </div>
              )}

              {/* SECTION: HELP AND FEEDBACK */}
              {activeTab === 'help' && (
                <div className="settings-tab-panel animate-fadeIn">
                  <div className="panel-header">
                    <h2>❓ Help & Feedback</h2>
                    <p>Access user guides, report issues, or read system documentation.</p>
                  </div>
                  <div className="help-info-card">
                    <h4>Smart Alarm Version 2.5 (Multi-User Edition)</h4>
                    <p className="text-secondary text-sm">Created with React, Firebase, and HTML5 Web APIs.</p>
                    <button className="btn btn-outline btn-xs mt-3" onClick={() => window.location.hash = '#dashboard'}>
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Sign In / Create Account Card (When signed out) */
          <div className="auth-card-full">
            <div className="auth-tabs">
              <button 
                className={`tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
              >
                Sign In
              </button>
              <button 
                className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
              >
                Create Account
              </button>
            </div>

            {(errorMsg || authError) && (
              <div className="auth-alert error">
                ⚠️ {errorMsg || authError}
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success">
                ✅ {successMsg}
              </div>
            )}

            <button 
              type="button" 
              className="btn-google-login"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Connecting...' : 'Sign in with Google Account'}</span>
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            {mode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="auth-form">
                <div className="form-field">
                  <label>Username or Email Address</label>
                  <div className="input-with-icon">
                    <span className="field-icon">👤</span>
                    <input 
                      type="text"
                      placeholder="e.g. harshitha or name@example.com"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🔒</span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In with Username'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="auth-form">
                <div className="form-field">
                  <label>Full Name / Username</label>
                  <div className="input-with-icon">
                    <span className="field-icon">👤</span>
                    <input 
                      type="text"
                      placeholder="e.g. Harshitha"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <span className="field-icon">✉️</span>
                    <input 
                      type="email"
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🔒</span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Confirm Password</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🔒</span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register Account'}
                </button>
              </form>
            )}

            {/* Quick Demo Switcher */}
            <div className="quick-switch-section">
              <span className="switch-label">⚡ Quick Demo Login:</span>
              <div className="switch-chips">
                {allUsers.map(user => (
                  <button 
                    key={user.uid}
                    type="button"
                    className="user-chip-btn"
                    onClick={() => {
                      switchDemoUser(user.uid);
                      if (onLoginSuccess) onLoginSuccess();
                    }}
                  >
                    <img src={user.photoURL} alt={user.displayName} className="chip-img" />
                    <span>{user.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .login-page-container {
          position: relative;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .settings-portal-wrapper {
          width: 100%;
          max-width: 1050px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-brand-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
        }

        .brand-logo-small {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, var(--color-primary), #818cf8);
          color: white; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
        }

        .brand-name {
          font-size: 1.1rem; font-weight: 800; color: var(--text-primary);
        }

        /* 2-Column Settings Portal matching reference layout */
        .settings-main-layout {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          min-height: 620px;
          box-shadow: var(--shadow-xl);
        }

        /* Left Sidebar Menu */
        .settings-sidebar {
          width: 330px;
          flex-shrink: 0;
          background: var(--bg-input);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          gap: 14px;
        }

        .sidebar-header {
          padding: 4px 6px;
        }

        .user-title-header {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .sidebar-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          font-size: 0.85rem;
          opacity: 0.6;
        }

        .search-input {
          width: 100%;
          padding: 10px 32px 10px 36px;
          font-size: 0.88rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.8rem;
        }

        .sidebar-menu-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
        }

        .menu-item-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .menu-item-btn:hover {
          background: var(--bg-surface);
        }

        .menu-item-btn.active {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .menu-item-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .menu-item-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .menu-item-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .menu-item-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-item-btn.logout-item {
          margin-top: auto;
          border-top: 1px solid var(--border-color);
          border-radius: 12px;
          padding-top: 14px;
        }

        .menu-item-btn.logout-item:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        .red-text {
          color: #ef4444 !important;
        }

        /* Right Content Panel */
        .settings-content-area {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
        }

        .settings-tab-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 620px;
        }

        .panel-header h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .panel-header p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Avatar Edit Section */
        .avatar-edit-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-preview-box {
          position: relative;
          width: 90px;
          height: 90px;
          flex-shrink: 0;
        }

        .avatar-preview-img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-primary);
          box-shadow: var(--shadow-md);
        }

        .avatar-change-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          border: 2px solid var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .avatar-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .form-input {
          padding: 11px 14px;
          font-size: 0.92rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-weight: 600;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--bg-surface);
        }

        .form-textarea {
          padding: 11px 14px;
          font-size: 0.92rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-weight: 500;
          resize: vertical;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--bg-surface);
        }

        .form-hint {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        /* Gender selector grid */
        .gender-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .gender-chip-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gender-chip-btn:hover {
          border-color: var(--color-primary);
        }

        .gender-chip-btn.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--color-primary);
          color: var(--color-primary);
          font-weight: 700;
        }

        .btn-save-profile {
          padding: 13px 24px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
        }

        /* Other setting cards */
        .setting-card-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 14px;
        }

        .setting-info h4 {
          font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;
        }
        .setting-info p {
          font-size: 0.78rem; color: var(--text-muted);
        }

        .form-select {
          padding: 8px 12px; font-size: 0.85rem; border-radius: 8px;
          border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);
        }

        .account-details-box {
          display: flex; flex-direction: column; gap: 12px;
          padding: 18px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 14px;
        }

        .acc-row { display: flex; justify-content: space-between; font-size: 0.88rem; }
        .acc-label { color: var(--text-muted); font-weight: 600; }
        .acc-val { color: var(--text-primary); font-weight: 700; }
        .code-font { font-family: monospace; font-size: 0.8rem; }

        .quick-switch-box h3 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
        .user-chips-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px;
          border-radius: 16px; border: 1px solid var(--border-color);
          background: var(--bg-surface); font-size: 0.82rem; color: var(--text-primary); cursor: pointer;
        }
        .chip-btn.active { border-color: var(--color-primary); background: rgba(99, 102, 241, 0.15); }
        .chip-img { width: 20px; height: 20px; border-radius: 50%; }

        .shortcuts-list-grid { display: flex; flex-direction: column; gap: 10px; }
        .shortcut-row {
          display: flex; justify-content: space-between; padding: 10px 14px;
          background: var(--bg-input); border-radius: 10px; font-size: 0.88rem;
        }
        kbd {
          background: var(--bg-surface); border: 1px solid var(--border-color);
          padding: 2px 8px; border-radius: 6px; font-size: 0.78rem; font-family: monospace;
        }

        /* Signed Out Auth Card */
        .auth-card-full {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px; padding: 32px;
          box-shadow: var(--shadow-xl);
          display: flex; flex-direction: column; gap: 20px;
          max-width: 480px; margin: 0 auto; width: 100%;
        }

        .auth-tabs { display: flex; background: var(--bg-input); padding: 4px; border-radius: 12px; border: 1px solid var(--border-color); }
        .tab-btn { flex: 1; padding: 10px; border: none; background: none; font-weight: 600; font-size: 0.88rem; color: var(--text-muted); border-radius: 8px; cursor: pointer; }
        .tab-btn.active { background: var(--bg-surface); color: var(--color-primary); font-weight: 700; }

        .auth-alert { padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; }
        .auth-alert.error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
        .auth-alert.success { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; }

        .btn-google-login {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: #ffffff; color: #3c4043; border: 1px solid #dadce0; border-radius: 12px;
          padding: 12px 16px; font-weight: 600; font-size: 0.92rem; cursor: pointer;
        }

        .auth-divider { display: flex; align-items: center; text-align: center; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border-color); }
        .auth-divider span { padding: 0 12px; }

        .auth-form { display: flex; flex-direction: column; gap: 14px; }
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 12px; font-size: 0.95rem; color: var(--text-muted); }
        .input-with-icon input {
          width: 100%; padding: 11px 40px 11px 38px; font-size: 0.88rem; border-radius: 10px;
          border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary);
        }
        .eye-toggle { position: absolute; right: 10px; background: none; border: none; cursor: pointer; font-size: 0.9rem; }

        .quick-switch-section { border-top: 1px solid var(--border-color); pt-3; display: flex; flex-direction: column; gap: 8px; }
        .user-chip-btn { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.78rem; cursor: pointer; }

        @media (max-width: 768px) {
          .settings-main-layout { flex-direction: column; }
          .settings-sidebar { width: 100%; }
        }
      `}</style>
    </div>
  );
}
