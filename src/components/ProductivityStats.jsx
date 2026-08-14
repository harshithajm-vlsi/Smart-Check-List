import React, { useMemo } from 'react';

function getTasks() {
  try { return JSON.parse(localStorage.getItem('sa_tasks') || '[]'); }
  catch { return []; }
}

const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProductivityStats() {
  const tasks = getTasks();

  const today = new Date();
  const todayISO = today.toLocaleDateString('en-CA');

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const todayTasks = tasks.filter(t => t.dueDate === todayISO);
  const todayCompleted = todayTasks.filter(t => t.completed).length;

  // Weekly stats (last 7 days)
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toLocaleDateString('en-CA');
      const dayTasks = tasks.filter(t => t.dueDate === iso);
      const doneTasks = dayTasks.filter(t => t.completed);
      return {
        label: WEEKDAY_ABBR[d.getDay()],
        total: dayTasks.length,
        done: doneTasks.length,
        isToday: iso === todayISO,
      };
    });
  }, [tasks, todayISO]);

  const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1);

  // Streak counter
  const streak = useMemo(() => {
    let count = 0;
    let d = new Date(today);
    while (true) {
      const iso = d.toLocaleDateString('en-CA');
      const dayTasks = tasks.filter(t => t.dueDate === iso);
      if (dayTasks.length === 0) break;
      const allDone = dayTasks.every(t => t.completed);
      if (!allDone) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [tasks]);

  // Priority distribution
  const highCount = tasks.filter(t => t.priority === 'High' && !t.completed).length;
  const medCount  = tasks.filter(t => t.priority === 'Medium' && !t.completed).length;
  const lowCount  = tasks.filter(t => t.priority === 'Low' && !t.completed).length;

  // Category distribution
  const catMap = {};
  tasks.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Productivity Score (0-100)
  const score = useMemo(() => {
    if (total === 0) return 0;
    const completionScore = completionPct * 0.6;
    const streakScore = Math.min(streak * 5, 20);
    const todayScore = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 20 : 10;
    return Math.min(100, Math.round(completionScore + streakScore + todayScore));
  }, [completionPct, streak, todayTasks, todayCompleted, total]);

  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="stats-page animate-fadeIn">
      {/* Overview Cards */}
      <div className="stat-grid">
        <StatCard icon="📋" label="Total Tasks" value={total} color="#3B82F6" />
        <StatCard icon="✅" label="Completed" value={completed} color="#10B981" />
        <StatCard icon="⏳" label="Pending" value={pending} color="#F59E0B" />
        <StatCard icon="📅" label="Today's Tasks" value={todayTasks.length} color="#8B5CF6" />
        <StatCard icon="🔥" label="Day Streak" value={`${streak}d`} color="#EF4444" />
        <div className="stat-card" style={{ borderTop: `3px solid ${scoreColor}` }}>
          <div className="stat-card-icon" style={{ background: `${scoreColor}22` }}>
            <span style={{ fontSize: '1.3rem' }}>⚡</span>
          </div>
          <div className="stat-card-value" style={{ color: scoreColor }}>{score}</div>
          <div className="stat-card-label">Productivity Score</div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}><span>📊</span> Overall Completion</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="completion-ring-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--bg-input)" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="48" fill="none"
                stroke="var(--color-primary)" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - completionPct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800">{completionPct}%</text>
              <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="10">done</text>
            </svg>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressRow label="Completed" value={completed} max={total} color="#10B981" />
            <ProgressRow label="Pending" value={pending} max={total} color="#F59E0B" />
            <ProgressRow label="Today Done" value={todayCompleted} max={Math.max(todayTasks.length, 1)} color="#3B82F6" />
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}><span>📈</span> Weekly Progress</div>
        <div className="weekly-chart">
          {weeklyData.map((d, i) => (
            <div key={i} className={`week-bar-col ${d.isToday ? 'today' : ''}`}>
              <div className="week-bar-wrap">
                <div className="week-bar-bg">
                  <div className="week-bar-done" style={{ height: `${d.total ? (d.done / maxWeekly) * 100 : 0}%`, background: d.isToday ? 'var(--color-primary)' : 'var(--color-primary-light)' }} />
                  <div className="week-bar-total" style={{ height: `${(d.total / maxWeekly) * 100}%`, opacity: 0.2 }} />
                </div>
              </div>
              <div className="week-bar-label">{d.label}</div>
              <div className="week-bar-val">{d.done}/{d.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="grid-2" style={{ marginTop: 20, gap: 20 }}>
        <div className="section-card">
          <div className="section-title" style={{ marginBottom: 14 }}><span>🎯</span> Priority Breakdown</div>
          {[['🔴 High', highCount, '#EF4444'], ['🟡 Medium', medCount, '#F59E0B'], ['🟢 Low', lowCount, '#10B981']].map(([label, count, color]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pending > 0 ? (count / pending) * 100 : 0}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="section-card">
          <div className="section-title" style={{ marginBottom: 14 }}><span>🏷️</span> By Category</div>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks yet</p>
          ) : categories.map(([cat, count]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-page { display: flex; flex-direction: column; }
        .completion-ring-wrap { flex-shrink: 0; }
        .weekly-chart { display: flex; gap: 8px; align-items: flex-end; height: 140px; }
        .week-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
        .week-bar-col.today .week-bar-label { color: var(--color-primary); font-weight: 700; }
        .week-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
        .week-bar-bg { width: 100%; position: relative; height: 100%; border-radius: 6px; background: var(--bg-input); overflow: hidden; display: flex; flex-direction: column-reverse; }
        .week-bar-done { width: 100%; border-radius: 6px; transition: height 0.6s ease; }
        .week-bar-total { width: 100%; position: absolute; bottom: 0; background: var(--color-primary); }
        .week-bar-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 500; }
        .week-bar-val { font-size: 0.65rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-card-icon" style={{ background: `${color}22` }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function ProgressRow({ label, value, max, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
    </div>
  );
}
