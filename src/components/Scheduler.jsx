import React, { useState } from 'react';
import { formatTime12 } from '../utils/timeUtils';
import { useUserData } from '../context/DataContext';

const CATEGORIES = ['Study', 'Work', 'Personal', 'Health'];

export default function Scheduler() {
  const { schedules: slots = [], tasks = [], addSchedule, deleteSchedule } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', category: 'Study', startTime: '', endTime: '', days: [] });
  const [editId, setEditId] = useState(null);

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.startTime || !form.endTime) return;
    await addSchedule(form);
    setForm({ label: '', category: 'Study', startTime: '', endTime: '', days: [] });
    setShowForm(false);
  };

  const handleDeleteSlot = (id) => deleteSchedule(id);
  const startEdit = (s) => { setForm({ ...s }); setEditId(s.id); setShowForm(true); };

  const toggleDay = (idx) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(idx) ? prev.days.filter(d => d !== idx) : [...prev.days, idx],
    }));
  };

  // Auto-schedule: match tasks with preferred time slots
  const scheduledTasks = (() => {
    const today = new Date().getDay();
    return tasks
      .filter(t => !t.completed && t.preferredTime)
      .map(task => {
        const matched = slots.find(s => {
          const taskTime = task.preferredTime;
          const inRange = taskTime >= s.startTime && taskTime <= s.endTime;
          const inDay = s.days.length === 0 || s.days.includes(today);
          return inRange && inDay;
        });
        return { task, slot: matched };
      });
  })();

  // Build timeline blocks (hours 0-24)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToPct = (m) => (m / (24 * 60)) * 100;

  return (
    <div className="scheduler-page animate-fadeIn">
      {/* Preferred Time Slots */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><span>⏱️</span> Preferred Time Slots</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ label: '', category: 'Study', startTime: '', endTime: '', days: [] }); setEditId(null); setShowForm(true); }}>
            + Add Slot
          </button>
        </div>
        {slots.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>⏰</span>
            <h3>No time slots defined</h3>
            <p>Add your preferred working hours and we'll schedule tasks accordingly.</p>
          </div>
        ) : (
          <div className="slots-list">
            {slots.map(s => (
              <div key={s.id} className="slot-item">
                <div className="slot-time">
                  <span>{formatTime12(s.startTime)}</span><span className="slot-dash">→</span><span>{formatTime12(s.endTime)}</span>
                </div>
                <div className="slot-body">
                  <span className="slot-label">{s.label}</span>
                  <span className="badge badge-primary">{s.category}</span>
                  {s.days.length > 0 && (
                    <span className="slot-days">{s.days.map(d => WEEKDAYS[d]).join(', ')}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(s)}>✏️</button>
                  <button className="btn btn-danger btn-xs" onClick={() => deleteSlot(s.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Timeline */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}><span>📆</span> Today's Schedule</div>
        <div className="timeline-container">
          {/* Hour labels */}
          <div className="timeline-labels">
            {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
              <div key={h} className="timeline-label" style={{ left: `${minutesToPct(h * 60)}%` }}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </div>
            ))}
          </div>
          {/* Slot blocks */}
          <div className="timeline-track">
            {slots.map(s => {
              const left = minutesToPct(timeToMinutes(s.startTime));
              const width = minutesToPct(timeToMinutes(s.endTime) - timeToMinutes(s.startTime));
              return (
                <div key={s.id} className="timeline-block" style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                  title={`${s.label}: ${formatTime12(s.startTime)}–${formatTime12(s.endTime)}`}
                >
                  <span className="timeline-block-label">{s.label}</span>
                </div>
              );
            })}
            {/* Current time marker */}
            <div className="timeline-now" style={{ left: `${minutesToPct(new Date().getHours() * 60 + new Date().getMinutes())}%` }} />
          </div>
        </div>
      </div>

      {/* Auto-Scheduled Tasks */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}><span>🤖</span> Auto-Scheduled Tasks</div>
        {scheduledTasks.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2rem' }}>📋</span>
            <h3>No tasks with preferred times</h3>
            <p>Add tasks with a preferred time to see them matched to your time slots.</p>
          </div>
        ) : (
          <div className="scheduled-tasks">
            {scheduledTasks.map(({ task, slot }) => (
              <div key={task.id} className={`sched-item ${slot ? 'matched' : 'unmatched'}`}>
                <div className="sched-task">{task.title}</div>
                <div className="sched-time">⏰ {formatTime12(task.dueTime || task.preferredTime)}</div>
                {slot ? (
                  <div className="sched-slot">✅ Matched: {slot.label} ({formatTime12(slot.startTime)}–{formatTime12(slot.endTime)})</div>
                ) : (
                  <div className="sched-slot" style={{ color: 'var(--color-warning)' }}>⚠️ No matching slot found</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box animate-slideUp">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? '✏️ Edit Time Slot' : '⏱️ New Time Slot'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Label *</label>
                <input className="form-input" placeholder="e.g. Study Time, Exercise..." value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time * {form.startTime && <span style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.8rem' }}>({formatTime12(form.startTime)})</span>}</label>
                  <input type="time" className="form-input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time * {form.endTime && <span style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.8rem' }}>({formatTime12(form.endTime)})</span>}</label>
                  <input type="time" className="form-input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Active Days (leave blank for every day)</label>
                <div className="days-picker">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                    <button key={i} type="button"
                      className={`day-btn ${form.days.includes(i) ? 'active' : ''}`}
                      onClick={() => toggleDay(i)}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add Slot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .slots-list { display: flex; flex-direction: column; gap: 8px; }
        .slot-item {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 16px; border-radius: 12px;
          background: var(--bg-surface-2); border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .slot-item:hover { border-color: var(--color-primary); }
        .slot-time { display: flex; align-items: center; gap: 6px; font-size: 1rem; font-weight: 700; color: var(--color-primary); min-width: 140px; font-variant-numeric: tabular-nums; }
        .slot-dash { color: var(--text-muted); }
        .slot-body { flex: 1; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .slot-label { font-weight: 600; color: var(--text-primary); }
        .slot-days { font-size: 0.75rem; color: var(--text-muted); }
        .timeline-container { position: relative; height: 60px; margin: 20px 0 8px; }
        .timeline-labels { position: relative; height: 20px; }
        .timeline-label { position: absolute; transform: translateX(-50%); font-size: 0.7rem; color: var(--text-muted); }
        .timeline-track { position: relative; height: 36px; background: var(--bg-input); border-radius: 8px; overflow: visible; margin-top: 4px; }
        .timeline-block {
          position: absolute; top: 4px; bottom: 4px;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
          border-radius: 6px; opacity: 0.85;
          display: flex; align-items: center; padding: 0 6px; overflow: hidden;
          cursor: default;
        }
        .timeline-block-label { font-size: 0.68rem; color: white; font-weight: 600; white-space: nowrap; }
        .timeline-now { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--color-danger); border-radius: 2px; }
        .scheduled-tasks { display: flex; flex-direction: column; gap: 8px; }
        .sched-item {
          padding: 12px 16px; border-radius: 12px;
          background: var(--bg-surface-2); border: 1px solid var(--border-color);
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
        }
        .sched-item.matched { border-color: rgba(16,185,129,0.3); }
        .sched-item.unmatched { border-color: rgba(245,158,11,0.3); }
        .sched-task { font-weight: 600; color: var(--text-primary); flex: 1; }
        .sched-time { font-size: 0.82rem; color: var(--text-muted); }
        .sched-slot { font-size: 0.82rem; }
        .days-picker { display: flex; gap: 6px; flex-wrap: wrap; }
        .day-btn {
          padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          background: var(--bg-input); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .day-btn.active { background: var(--color-primary); border-color: var(--color-primary); color: white; }
        @media (max-width: 600px) {
          .slot-item { flex-wrap: wrap; }
          .slot-time { min-width: auto; }
        }
      `}</style>
    </div>
  );
}
