import React, { useState, useEffect, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TasksPage from './components/TasksPage';
import AlarmManager from './components/AlarmManager';
import Scheduler from './components/Scheduler';
import TamilCalendarView from './components/TamilCalendarView';
import ProductivityStats from './components/ProductivityStats';
import AdminPortal from './components/AdminPortal';
import LoginModal from './components/LoginModal';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import './styles/theme.css';
import './styles/global.css';

// Error Boundary Fallback to prevent blank white screens
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⏰</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Smart Alarm Hub</h2>
          <p style={{ color: '#94A3B8', maxWidth: '420px', fontSize: '0.9rem', marginBottom: '20px' }}>
            The application encountered a transient issue. Click below to reload your dashboard.
          </p>
          <button 
            style={{
              background: '#3EADA0',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(62,173,160,0.4)'
            }}
            onClick={() => window.location.reload()}
          >
            🔄 Reload Smart Alarm App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { currentUser, loading } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('sa_theme') || 'light');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sa_theme', theme);
  }, [theme]);

  // Loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ fontSize: '3.2rem', marginBottom: '12px', animation: 'spin 3s infinite linear' }}>⏰</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Smart Alarm Hub</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Securing authentication session...</p>
      </div>
    );
  }

  // Unauthenticated users -> Redirect directly to Sign Up / Login Page
  if (!currentUser) {
    return (
      <div className="unauth-app-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
        <LoginPage onLoginSuccess={() => setActiveSection('dashboard')} />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard setActiveSection={setActiveSection} />;
      case 'tasks':
        return <TasksPage />;
      case 'alarms':
        return <AlarmManager />;
      case 'scheduler':
        return <Scheduler />;
      case 'calendar':
      case 'tamil-calendar':
        return <TamilCalendarView />;
      case 'stats':
        return <ProductivityStats />;
      case 'admin':
        return <AdminPortal />;
      case 'login':
        return <LoginPage onLoginSuccess={() => setActiveSection('dashboard')} />;
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />
      <div className="app-content">
        <Header 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          theme={theme} 
          setTheme={setTheme}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <main className="app-main">
          {renderSection()}
        </main>
      </div>

      <LoginModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
