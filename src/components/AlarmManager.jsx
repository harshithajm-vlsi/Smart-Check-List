import React, { useState, useEffect, useRef } from 'react';
import { SOUND_NAMES, previewSound, playAlarm, stopAlarm, showNotification } from '../utils/notifications';
import { formatTime12 } from '../utils/timeUtils';

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const REPEAT_OPTIONS = ['One Time', 'Daily', 'Weekly', 'Custom'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getInitial() {
  try { return JSON.parse(localStorage.getItem('sa_alarms') || '[]'); }
  catch { return []; }
}

export default function AlarmManager() {
  const [alarms, setAlarms] = useState(getInitial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null); // firing alarm
  const [snoozed, setSnoozed] = useState({});
  const tickRef = useRef(null);

  const emptyForm = {
    label: '', time: '', repeat: 'One Time', days: [],
    sound: 'Classic Alarm', volume: 0.7, enabled: true, uploadedSrc: null,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem('sa_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Alarm tick — check every 5s
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const now = new Date();
      const hhmm = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const dayIdx = now.getDay();

      alarms.forEach(alarm => {
        if (!alarm.enabled) return;
        if (alarm.time !== hhmm) return;
        if (now.getSeconds() > 10) return; // only trigger in first 10s of minute

        // Check snooze
        if (snoozed[alarm.id] && Date.now() < snoozed[alarm.id]) return;

        // Check repeat
        if (alarm.repeat === 'Weekly' && !alarm.days.includes(dayIdx)) return;

        // Fire!
        setActiveAlarm(alarm);
        playAlarm(alarm.sound, alarm.volume);
        showNotification(`⏰ Alarm: ${alarm.label || alarm.time}`, `Your alarm is ringing!`, { tag: alarm.id });

        // Disable one-time alarms
        if (alarm.repeat === 'One Time') {
          setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled: false } : a));
        }
      });
    }, 5000);
    return () => clearInterval(tickRef.current);
  }, [alarms, snoozed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.time) return;
    if (editId) {
      setAlarms(prev => prev.map(a => a.id === editId ? { ...form, id: editId } : a));
      setEditId(null);
    } else {
      setAlarms(prev => [...prev, { ...form, id: generateId() }]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (alarm) => {
    setForm({ ...alarm });
    setEditId(alarm.id);
    setShowForm(true);
  };

  const deleteAlarm = (id) => setAlarms(prev => prev.filter(a => a.id !== id));
  const toggleAlarm = (id) => setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));

  const handleSnooze = () => {
    if (!activeAlarm) return;
    stopAlarm();
    setSnoozed(prev => ({ ...prev, [activeAlarm.id]: Date.now() + 5 * 60 * 1000 }));
    setActiveAlarm(null);
  };

  const handleStopAlarm = () => {
    stopAlarm();
    setActiveAlarm(null);
  };

  const toggleDay = (idx) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(idx)
        ? prev.days.filter(d => d !== idx)
        : [...prev.days, idx],
    }));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, uploadedSrc: url, sound: file.name }));
  };

  return (
    <div className="alarm-page animate-fadeIn">
      {/* Firing Alarm Modal */}
      {activeAlarm && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="alarm-firing modal-box animate-bounceIn" style={{ textAlign: 'center', maxWidth: 360 }}>
            <div className="alarm-ring-icon">⏰</div>
            <h2 style={{ fontSize: '1.5rem', margin: '12px 0 6px' }}>{activeAlarm.label || 'Alarm'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{formatTime12(activeAlarm.time)}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={handleSnooze}>💤 Snooze 5m</button>
              <button className="btn btn-danger" onClick={handleStopAlarm}>⏹ Stop</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <div className="section-title"><span>🔔</span> Alarms</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
            + New Alarm
          </button>
        </div>

        {alarms.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🔕</span>
            <h3>No alarms set</h3>
            <p>Add an alarm to get reminders</p>
          </div>
        ) : (
          <div className="alarm-list">
            {alarms.map(alarm => (
              <div key={alarm.id} className={`alarm-item ${!alarm.enabled ? 'alarm-disabled' : ''}`}>
                <div className="alarm-time-block">
                  <div className="alarm-time">{formatTime12(alarm.time)}</div>
                  <div className="alarm-repeat">
                    {alarm.repeat === 'Weekly'
                      ? alarm.days.map(d => WEEKDAYS[d]).join(', ')
                      : alarm.repeat}
                  </div>
                </div>
                <div className="alarm-body">
                  <div className="alarm-label">{alarm.label || 'Alarm'}</div>
                  <div className="alarm-sound">🎵 {alarm.sound}</div>
                </div>
                <div className="alarm-controls">
                  <button
                    className={`alarm-toggle ${alarm.enabled ? 'on' : 'off'}`}
                    onClick={() => toggleAlarm(alarm.id)}
                  >
                    <div className="alarm-toggle-thumb" />
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(alarm)}>✏️</button>
                  <button className="btn btn-danger btn-xs" onClick={() => deleteAlarm(alarm.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Alarm Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box animate-slideUp" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? '✏️ Edit Alarm' : '🔔 New Alarm'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Label</label>
                <input className="form-input" placeholder="Wake up, Study, Meeting..." value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Time * {form.time && <span style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.85rem' }}>({formatTime12(form.time)})</span>}</label>
                <input type="time" className="form-input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Repeat</label>
                <select className="form-select" value={form.repeat} onChange={e => setForm(p => ({ ...p, repeat: e.target.value, days: [] }))}>
                  {REPEAT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {(form.repeat === 'Weekly' || form.repeat === 'Custom') && (
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <div className="days-picker">
                    {WEEKDAYS.map((d, i) => (
                      <button key={i} type="button"
                        className={`day-btn ${form.days.includes(i) ? 'active' : ''}`}
                        onClick={() => toggleDay(i)}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Sound</label>
                <div className="sound-grid">
                  {SOUND_NAMES.map(s => (
                    <button key={s} type="button"
                      className={`sound-btn ${form.sound === s ? 'active' : ''}`}
                      onClick={() => { setForm(p => ({ ...p, sound: s, uploadedSrc: null })); previewSound(s, form.volume); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Upload MP3</label>
                <input type="file" accept=".mp3,audio/*" className="form-input" onChange={handleUpload} style={{ padding: '8px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Volume: {Math.round(form.volume * 100)}%</label>
                <input type="range" min={0} max={1} step={0.05} value={form.volume}
                  onChange={e => setForm(p => ({ ...p, volume: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Set Alarm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .alarm-list { display: flex; flex-direction: column; gap: 10px; }
        .alarm-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 20px; border-radius: 14px;
          background: var(--bg-surface-2); border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .alarm-item:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .alarm-disabled { opacity: 0.5; }
        .alarm-time-block { min-width: 90px; }
        .alarm-time { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); font-variant-numeric: tabular-nums; }
        .alarm-repeat { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .alarm-body { flex: 1; }
        .alarm-label { font-weight: 600; color: var(--text-primary); }
        .alarm-sound { font-size: 0.78rem; color: var(--text-muted); margin-top: 3px; }
        .alarm-controls { display: flex; align-items: center; gap: 8px; }
        .alarm-toggle {
          width: 44px; height: 24px; border-radius: 9999px; border: none; cursor: pointer;
          position: relative; transition: background 0.3s; flex-shrink: 0;
        }
        .alarm-toggle.on { background: var(--color-primary); }
        .alarm-toggle.off { background: var(--border-color-strong); }
        .alarm-toggle-thumb {
          position: absolute; top: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: white; transition: left 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .alarm-toggle.on .alarm-toggle-thumb { left: 23px; }
        .alarm-toggle.off .alarm-toggle-thumb { left: 3px; }
        .alarm-ring-icon { font-size: 4rem; animation: spin 0.5s linear infinite; }
        .sound-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
        .sound-btn {
          padding: 7px 10px; border-radius: 8px; font-size: 0.78rem;
          background: var(--bg-input); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
          text-align: left;
        }
        .sound-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .sound-btn.active { background: rgba(var(--color-primary-rgb),0.12); border-color: var(--color-primary); color: var(--color-primary); font-weight: 600; }
        .days-picker { display: flex; gap: 6px; flex-wrap: wrap; }
        .day-btn {
          padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          background: var(--bg-input); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .day-btn.active { background: var(--color-primary); border-color: var(--color-primary); color: white; }
        @media (max-width: 600px) {
          .alarm-item { flex-wrap: wrap; gap: 10px; }
          .sound-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
