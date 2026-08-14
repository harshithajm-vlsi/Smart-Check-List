import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TasksPage from './components/TasksPage';
import AlarmManager from './components/AlarmManager';
import Scheduler from './components/Scheduler';
import CalendarView from './components/CalendarView';
import ProductivityStats from './components/ProductivityStats';
import AdminPortal from './components/AdminPortal';
import LoginModal from './components/LoginModal';
import { AuthProvider } from './context/AuthContext';

import './styles/theme.css';
import './styles/global.css';

function MainApp() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sa_theme') || 'light');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sa_theme', theme);
  }, [theme]);

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
        return <CalendarView />;
      case 'stats':
        return <ProductivityStats />;
      case 'admin':
        return <AdminPortal />;
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
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}


