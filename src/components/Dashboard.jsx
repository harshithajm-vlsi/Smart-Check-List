import React, { useState, useEffect, useMemo } from 'react';
import { showNotification } from '../utils/notifications';
import { formatTime12, formatDueDateTime } from '../utils/timeUtils';
import { useUserData } from '../context/DataContext';

const MOTIVATIONAL_QUOTES = [
  "Believe in yourself and all that you are. 🌟",
  "Small steps every day lead to big results. 🚀",
  "You are capable of amazing things. 💪",
  "Focus on progress, not perfection. ✨",
  "Your future self is proud of you. 🌈",
  "Make today so awesome that yesterday gets jealous. 🔥",
  "Dream big, work hard, stay humble. 🌙",
  "One task at a time, one day at a time. 🕐",
];

export default function Dashboard({ setActiveSection }) {
  const { tasks = [], alarms = [], toggleTaskCompleted, toggleAlarm } = useUserData();
  const [now, setNow] = useState(new Date());
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  
  // Smart Intelligence state
  const [weather, setWeather] = useState('Sunny'); // Sunny, Rainy, Cold, Busy

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayStr = now.toLocaleDateString('en-CA');
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const activeAlarms = alarms.filter(a => a.enabled);

  // Smart recommendations calculation
  const smartRecommendation = useMemo(() => {
    const hour = now.getHours();
    const isMorning = hour >= 5 && hour < 12;
    const isEvening = hour >= 17 && hour < 22;
    const highPriorityTasks = todayTasks.filter(t => t.priority === 'High' && !t.completed);

    let advice = [];
    let recommendedSound = 'Classic Alarm';

    if (weather === 'Rainy') {
      advice.push('🌧️ Rainy day detected: Ideal for indoor study, coding, and reading tasks.');
      recommendedSound = 'Rain Sound / Soft Bell';
    } else if (weather === 'Sunny') {
      advice.push('☀️ Great sunny weather! Excellent window for exercise and outdoor tasks.');
      recommendedSound = 'Focus Alert';
    } else if (weather === 'Cold') {
      advice.push('❄️ Chilly weather: Enjoy warm focus sessions with steady time slots.');
      recommendedSound = 'Temple Bell';
    } else if (weather === 'Busy') {
      advice.push('📅 High schedule density today: 15-minute advance notifications recommended.');
      recommendedSound = 'Emergency Alert';
    }

    if (isMorning) {
      advice.push('🌅 Morning focus period: Softer alarms like Gentle Wake Up recommended.');
    } else if (isEvening) {
      advice.push('🌙 Evening wind-down: Wrap up pending items and review tomorrow\'s schedule.');
    }

    if (highPriorityTasks.length > 0) {
      advice.push(`⚠️ ${highPriorityTasks.length} High-priority task(s) remaining today.`);
    }

    return { advice, recommendedSound };
  }, [now, weather, todayTasks]);

  return (
    <div className="dashboard-page animate-fadeIn">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-card">
        <div className="welcome-main">
          <div className="welcome-greeting">
            <h2>Hi Harshitha 👋</h2>
            <p>Ready to conquer today?</p>
          </div>
          <div className="welcome-datetime">
            <div className="welcome-date">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="welcome-time">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          </div>
        </div>

        <div className="welcome-quote">💡 {quote}</div>

        {todayTasks.length > 0 && (
          <div className="today-progress">
            <div className="today-progress-label">
              <span>Today's Task Completion</span>
              <span>{completedToday}/{todayTasks.length} tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${todayTasks.length ? (completedToday / todayTasks.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Overview Grid */}
      <div className="stat-grid" style={{ marginTop: 20 }}>
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-primary)', cursor: 'pointer' }} onClick={() => setActiveSection('tasks')}>
          <div className="stat-card-icon" style={{ background: 'rgba(var(--color-primary-rgb),0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
          </div>
          <div className="stat-card-value">{tasks.filter(t => !t.completed).length}</div>
          <div className="stat-card-label">Active Tasks</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #8B5CF6', cursor: 'pointer' }} onClick={() => setActiveSection('tasks')}>
          <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
          </div>
          <div className="stat-card-value">{todayTasks.length}</div>
          <div className="stat-card-label">Today's Tasks</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #F59E0B', cursor: 'pointer' }} onClick={() => setActiveSection('alarms')}>
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
          </div>
          <div className="stat-card-value">{activeAlarms.length}</div>
          <div className="stat-card-label">Active Alarms</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #10B981', cursor: 'pointer' }} onClick={() => setActiveSection('stats')}>
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
          </div>
          <div className="stat-card-value">{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</div>
          <div className="stat-card-label">Completion Score</div>
        </div>
      </div>

      {/* Smart Intelligence Widget */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-header">
          <div className="section-title">
            <span>🧠</span> Smart Alarm & Schedule Intelligence
          </div>
          <div className="weather-selector">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weather:</span>
            {['Sunny', 'Rainy', 'Cold', 'Busy'].map(w => (
              <button
                key={w}
                className={`weather-btn ${weather === w ? 'active' : ''}`}
                onClick={() => setWeather(w)}
              >
                {w === 'Sunny' ? '☀️ Sunny' : w === 'Rainy' ? '🌧️ Rainy' : w === 'Cold' ? '❄️ Cold' : '📅 Busy'}
              </button>
            ))}
          </div>
        </div>

        <div className="smart-card-content">
          <div className="smart-advice-list">
            {smartRecommendation.advice.map((item, idx) => (
              <div key={idx} className="smart-advice-item">
                {item}
              </div>
            ))}
          </div>
          <div className="smart-tone-box">
            <span className="smart-tone-label">Suggested Alarm Sound:</span>
            <span className="smart-tone-val">🎵 {smartRecommendation.recommendedSound}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Tasks & Active Alarms */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        {/* Today's Tasks Preview */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <span>📅</span> Today's Checklist
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setActiveSection('tasks')}>
              View All →
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <h3>No tasks scheduled for today</h3>
              <button className="btn btn-primary btn-xs" onClick={() => setActiveSection('tasks')}>
                + Add Today's Task
              </button>
            </div>
          ) : (
            <div className="dash-task-list">
              {todayTasks.map(task => (
                <div key={task.id} className="dash-task-item">
                  <button
                    className={`task-check ${task.completed ? 'checked' : ''}`}
                    onClick={() => toggleTaskCompleted(task.id)}
                  >
                    {task.completed ? '✓' : ''}
                  </button>
                  <div className="dash-task-info">
                    <span className={`dash-task-title ${task.completed ? 'line-through opacity-60' : ''}`}>
                      {task.title}
                    </span>
                    <span className="dash-task-sub">
                      {task.dueTime ? `⏰ Due: ${formatTime12(task.dueTime)}` : task.preferredTime ? `⏰ Slot: ${formatTime12(task.preferredTime)}` : task.startTime ? `🕐 ${formatTime12(task.startTime)}` : ''}
                      {(task.dueTime || task.preferredTime || task.startTime) ? ' • ' : ''}
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Alarms Preview */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <span>🔔</span> Alarms Overview
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setActiveSection('alarms')}>
              Manage Alarms →
            </button>
          </div>

          {alarms.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <span style={{ fontSize: '2rem' }}>🔕</span>
              <h3>No alarms created</h3>
              <button className="btn btn-primary btn-xs" onClick={() => setActiveSection('alarms')}>
                + Set Alarm
              </button>
            </div>
          ) : (
            <div className="dash-alarm-list">
              {alarms.slice(0, 4).map(alarm => (
                <div key={alarm.id} className={`dash-alarm-item ${!alarm.enabled ? 'disabled' : ''}`}>
                  <div className="dash-alarm-time">{formatTime12(alarm.time)}</div>
                  <div className="dash-alarm-info">
                    <div className="dash-alarm-label">{alarm.label || 'Alarm'}</div>
                    <div className="dash-alarm-repeat">{alarm.repeat}</div>
                  </div>
                  <button
                    className={`alarm-toggle ${alarm.enabled ? 'on' : 'off'}`}
                    onClick={() => toggleAlarm(alarm.id)}
                  >
                    <div className="alarm-toggle-thumb" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-page { display: flex; flex-direction: column; }
        .welcome-banner {
          padding: 28px 32px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(46,139,125,0.15) 0%, rgba(46,139,125,0.05) 100%);
          border: 1px solid rgba(46,139,125,0.2);
        }
        .welcome-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .welcome-greeting h2 { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); }
        .welcome-greeting p { color: var(--text-secondary); margin-top: 4px; }
        .welcome-datetime { text-align: right; }
        .welcome-date { color: var(--text-secondary); font-size: 0.9rem; }
        .welcome-time { font-size: 2rem; font-weight: 800; color: var(--color-primary); font-variant-numeric: tabular-nums; }
        .welcome-quote { margin-top: 16px; padding: 10px 14px; background: var(--bg-glass); border-radius: 10px; border: var(--glass-border); font-size: 0.875rem; color: var(--text-secondary); font-style: italic; }
        .today-progress { margin-top: 16px; }
        .today-progress-label { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
        
        .weather-selector { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .weather-btn {
          padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;
          background: var(--bg-input); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .weather-btn.active {
          background: var(--color-primary); color: white; border-color: var(--color-primary);
        }

        .smart-card-content { display: flex; flex-direction: column; gap: 12px; }
        .smart-advice-list { display: flex; flex-direction: column; gap: 6px; }
        .smart-advice-item {
          padding: 10px 14px; border-radius: 10px;
          background: var(--bg-surface-2); border-left: 3px solid var(--color-primary);
          font-size: 0.85rem; color: var(--text-primary); font-weight: 500;
        }
        .smart-tone-box {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(var(--color-primary-rgb), 0.1); border: 1px dashed var(--color-primary);
          font-size: 0.85rem;
        }
        .smart-tone-label { color: var(--text-secondary); font-weight: 600; }
        .smart-tone-val { color: var(--color-primary); font-weight: 700; }

        .dash-task-list, .dash-alarm-list { display: flex; flex-direction: column; gap: 8px; }
        .dash-task-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
        }
        .dash-task-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .dash-task-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
        .dash-task-sub { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

        .dash-alarm-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 10px; background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
        }
        .dash-alarm-item.disabled { opacity: 0.5; }
        .dash-alarm-time { font-size: 1.2rem; font-weight: 800; color: var(--color-primary); font-variant-numeric: tabular-nums; }
        .dash-alarm-info { flex: 1; }
        .dash-alarm-label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
        .dash-alarm-repeat { font-size: 0.72rem; color: var(--text-muted); }

        .task-check {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--color-primary);
          background: none; cursor: pointer; flex-shrink: 0;
          color: white; font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .task-check.checked { background: var(--color-primary); }

        .alarm-toggle {
          width: 40px; height: 22px; border-radius: 9999px; border: none; cursor: pointer;
          position: relative; transition: background 0.3s; flex-shrink: 0;
        }
        .alarm-toggle.on { background: var(--color-primary); }
        .alarm-toggle.off { background: var(--border-color-strong); }
        .alarm-toggle-thumb {
          position: absolute; top: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: white; transition: left 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .alarm-toggle.on .alarm-toggle-thumb { left: 21px; }
        .alarm-toggle.off .alarm-toggle-thumb { left: 3px; }

        @media (max-width: 600px) {
          .welcome-banner { padding: 20px; }
          .welcome-time { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

