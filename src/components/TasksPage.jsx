import React, { useState, useEffect, useMemo } from 'react';
import { showNotification, playAlarm } from '../utils/notifications';
import { formatTime12, formatDueDateTime, formatDateReadable, getMonthDate, getDayOfWeek, getMonthName } from '../utils/timeUtils';
import { useUserData } from '../context/DataContext';

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const CATEGORIES = ['All', 'Study', 'Work', 'Personal', 'Health', 'Custom'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function TasksPage() {
  const { tasks = [], addTask, updateTask, deleteTask, toggleTaskCompleted } = useUserData();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // All / Active / Completed
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate / priority / title
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const emptyForm = {
    title: '',
    description: '',
    category: 'Work',
    priority: 'Medium',
    startDate: todayStr,
    startTime: '',
    dueDate: '',
    dueTime: '',
    hasAlarm: false,
    alarmTime: '',
  };
  const [form, setForm] = useState(emptyForm);

  // Task Alarm background trigger (checks every 5 sec)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      if (now.getSeconds() > 10) return;

      tasks.forEach(t => {
        if (t.completed || !t.hasAlarm || !t.alarmTime) return;
        if (t.alarmTime === hhmm) {
          playAlarm('Focus Alert', 0.7);
          showNotification(`⏰ Task Alarm: ${t.title}`, t.description || 'Your task alarm is ringing!');
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const finalAlarmTime = form.alarmTime || form.dueTime || form.startTime || '09:00';
    const taskPayload = {
      ...form,
      alarmTime: finalAlarmTime,
    };

    if (editId) {
      await updateTask(editId, taskPayload);
      setEditId(null);
    } else {
      await addTask({ ...taskPayload, completed: false, createdAt: Date.now() });
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (task) => {
    setForm({
      ...task,
      startDate: task.startDate || (task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-CA') : todayStr),
    });
    setEditId(task.id);
    setShowForm(true);
  };

  const handleDeleteTask = (id) => deleteTask(id);
  const toggleComplete = (id) => toggleTaskCompleted(id);

  const toggleTaskAlarm = (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const newHasAlarm = !target.hasAlarm;
    const alarmTime = target.alarmTime || target.dueTime || target.startTime || '09:00';
    if (newHasAlarm) {
      showNotification(`🔔 Alarm Enabled: ${target.title}`, `Task alarm scheduled for ${formatTime12(alarmTime)}`);
    }
    updateTask(id, { hasAlarm: newHasAlarm, alarmTime });
  };

  // Filtered & sorted tasks
  const filtered = useMemo(() => {
    let result = tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchCategory = filterCategory === 'All' || t.category === filterCategory;
      const matchStatus = filterStatus === 'All' ||
        (filterStatus === 'Active' && !t.completed) ||
        (filterStatus === 'Completed' && t.completed);
      return matchSearch && matchPriority && matchCategory && matchStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !a.dueTime) return 1;
        if (!b.dueDate && !b.dueTime) return -1;
        const valA = (a.dueDate || '9999-99-99') + 'T' + (a.dueTime || '00:00');
        const valB = (b.dueDate || '9999-99-99') + 'T' + (b.dueTime || '00:00');
        return valA.localeCompare(valB);
      }
      if (sortBy === 'priority') {
        const pMap = { High: 1, Medium: 2, Low: 3 };
        return (pMap[a.priority] || 4) - (pMap[b.priority] || 4);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, search, filterPriority, filterCategory, filterStatus, sortBy]);

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="tasks-page animate-fadeIn">
      {/* Header Summary Cards */}
      <div className="task-summary-grid">
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-primary)' }}>
          <div className="stat-card-icon" style={{ background: 'rgba(var(--color-primary-rgb),0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
          </div>
          <div className="stat-card-value">{tasks.length}</div>
          <div className="stat-card-label">Total Work Items</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #F59E0B' }}>
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
          </div>
          <div className="stat-card-value">{activeCount}</div>
          <div className="stat-card-label">Pending Work</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #10B981' }}>
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          </div>
          <div className="stat-card-value">{completedCount}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      {/* Main Task Manager Card */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="section-header">
          <div className="section-title">
            <span>📊</span> To-Do Work Directory
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                📊 Table
              </button>
              <button
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Cards View"
              >
                🎴 Cards
              </button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
              + Add Work Item
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Tabs */}
        <div className="task-toolbar">
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search work items by title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p} Priority</option>)}
          </select>

          <select className="form-select" style={{ width: 'auto' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Work Title</option>
          </select>

          <div className="status-tabs">
            {['All', 'Active', 'Completed'].map(s => (
              <button key={s} className={`status-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks View: Table View or Cards View */}
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <span style={{ fontSize: '3rem' }}>📋</span>
            <h3>No work items found</h3>
            <p>Add a new task or adjust your search and filters.</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="table-responsive">
            <table className="task-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>Done</th>
                  <th>Month Date</th>
                  <th>Day</th>
                  <th>Work</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Due Day</th>
                  <th>Due Month</th>
                  <th>Alarm</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const startIso = task.startDate || (task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-CA') : todayStr);
                  const monthDate = getMonthDate(startIso);
                  const dayOfWeek = getDayOfWeek(startIso);
                  const dueDayOfWeek = getDayOfWeek(task.dueDate);
                  const dueMonthName = getMonthName(task.dueDate);
                  const startDateDisplay = startIso ? `${formatDateReadable(startIso)}${task.startTime ? `, ${formatTime12(task.startTime)}` : ''}` : '—';
                  const dueDateDisplay = task.dueDate ? `${formatDateReadable(task.dueDate)}${task.dueTime ? `, ${formatTime12(task.dueTime)}` : ''}` : '—';
                  const alarmTimeDisplay = formatTime12(task.alarmTime || task.dueTime || task.startTime || '09:00');

                  return (
                    <tr key={task.id} className={task.completed ? 'completed-row' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`task-check ${task.completed ? 'checked' : ''}`}
                          onClick={() => toggleComplete(task.id)}
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? '✓' : ''}
                        </button>
                      </td>
                      <td><span className="pill-badge">{monthDate}</span></td>
                      <td><span className="day-badge">{dayOfWeek}</span></td>
                      <td>
                        <div className="work-cell">
                          <span className={`work-title ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                          <div className="task-badges" style={{ marginTop: 2 }}>
                            <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                            <span className="badge-sub">{task.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="desc-cell">
                        {task.description ? (
                          <span>{task.description}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>
                        )}
                      </td>
                      <td className="date-cell">{startDateDisplay}</td>
                      <td className="date-cell">{dueDateDisplay}</td>
                      <td><span className="day-badge due-day">{dueDayOfWeek}</span></td>
                      <td><span className="pill-badge due-month">{dueMonthName}</span></td>
                      <td>
                        <button
                          className={`alarm-pill ${task.hasAlarm ? 'active' : ''}`}
                          onClick={() => toggleTaskAlarm(task.id)}
                          title={task.hasAlarm ? `Alarm active at ${alarmTimeDisplay}. Click to toggle off.` : 'Click to enable alarm for this work'}
                        >
                          {task.hasAlarm ? `🔔 ${alarmTimeDisplay}` : '🔕 Off'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="task-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-xs" onClick={() => startEdit(task)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-xs" onClick={() => deleteTask(task.id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="task-list" style={{ marginTop: 16 }}>
            {filtered.map((task, i) => (
              <div
                key={task.id}
                className={`task-item animate-slideIn ${task.completed ? 'task-completed' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <button
                  className={`task-check ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleComplete(task.id)}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? '✓' : ''}
                </button>

                <div className="task-body">
                  <div className="task-header-row">
                    <span className={`task-title ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                    <div className="task-badges">
                      <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                      <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{task.category}</span>
                    </div>
                  </div>

                  {task.description && <p className="task-desc">{task.description}</p>}

                  <div className="task-meta">
                    {(task.dueDate || task.dueTime) && <span>{formatDueDateTime(task.dueDate, task.dueTime)}</span>}
                    {task.dueDate && <span>🗓️ Due Day: {getDayOfWeek(task.dueDate)} ({getMonthName(task.dueDate)})</span>}
                    {task.hasAlarm && <span className="text-success">🔔 Alarm: {formatTime12(task.alarmTime)}</span>}
                  </div>
                </div>

                <div className="task-actions">
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(task)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-xs" onClick={() => deleteTask(task.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box animate-slideUp" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? '✏️ Edit Work Item' : '➕ Create New Work Item'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label className="form-label">Work Title *</label>
                <input name="title" className="form-input" placeholder="e.g. Complete React Project Specs & Documentation" value={form.title} onChange={handleFormChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input form-textarea" rows={3} placeholder="Provide details, scope, and specific work instructions..." value={form.description} onChange={handleFormChange} required style={{ resize: 'vertical' }} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-select" value={form.category} onChange={handleFormChange}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" className="form-select" value={form.priority} onChange={handleFormChange}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">🚀 Start Date</label>
                  <input name="startDate" type="date" className="form-input" value={form.startDate || ''} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time {form.startTime && <span style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.8rem' }}>({formatTime12(form.startTime)})</span>}</label>
                  <input name="startTime" type="time" className="form-input" value={form.startTime || ''} onChange={handleFormChange} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">📅 Due Date</label>
                  <input name="dueDate" type="date" className="form-input" value={form.dueDate || ''} onChange={handleFormChange} />
                  {form.dueDate && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: 4, fontWeight: 600 }}>
                      Due Day: {getDayOfWeek(form.dueDate)} • Month: {getMonthName(form.dueDate)}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">⏰ Due Time {form.dueTime && <span style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.8rem' }}>({formatTime12(form.dueTime)})</span>}</label>
                  <input name="dueTime" type="time" className="form-input" value={form.dueTime || ''} onChange={handleFormChange} />
                </div>
              </div>

              <div className="section-card" style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      name="hasAlarm"
                      type="checkbox"
                      checked={form.hasAlarm || false}
                      onChange={handleFormChange}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                    />
                    <span>🔔 Enable Alarm for this Work Item</span>
                  </label>
                  {form.hasAlarm && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Alarm Time:</span>
                      <input
                        name="alarmTime"
                        type="time"
                        className="form-input"
                        style={{ width: 'auto', padding: '4px 8px' }}
                        value={form.alarmTime || form.dueTime || form.startTime || '09:00'}
                        onChange={handleFormChange}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        ({formatTime12(form.alarmTime || form.dueTime || form.startTime || '09:00')})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Create Work Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .task-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .task-toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .status-tabs { display: flex; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
        .status-tab { padding: 8px 14px; background: none; border: none; color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .status-tab:hover { background: var(--bg-input); }
        .status-tab.active { background: var(--color-primary); color: white; font-weight: 600; }
        
        .view-toggle { display: flex; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
        .view-btn { padding: 6px 12px; background: none; border: none; color: var(--text-secondary); font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .view-btn.active { background: var(--bg-input); color: var(--color-primary); }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-2);
          margin-top: 16px;
        }
        .task-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }
        .task-table th {
          padding: 12px 14px;
          background: var(--bg-input);
          color: var(--text-secondary);
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }
        .task-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          vertical-align: middle;
        }
        .task-table tr:last-child td { border-bottom: none; }
        .task-table tr:hover { background: rgba(var(--color-primary-rgb), 0.04); }
        .completed-row { opacity: 0.55; }
        .pill-badge {
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(var(--color-primary-rgb), 0.1);
          color: var(--color-primary);
          font-weight: 700;
          font-size: 0.78rem;
          white-space: nowrap;
        }
        .day-badge {
          padding: 4px 10px;
          border-radius: 8px;
          background: var(--bg-input);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.78rem;
          white-space: nowrap;
        }
        .due-day {
          background: rgba(245, 158, 11, 0.12);
          color: #D97706;
          font-weight: 700;
        }
        .due-month {
          background: rgba(139, 92, 246, 0.12);
          color: #7C3AED;
          font-weight: 700;
        }
        .work-cell {
          display: flex; flex-direction: column; gap: 3px; min-width: 170px;
        }
        .work-title {
          font-weight: 700; color: var(--text-primary); font-size: 0.92rem;
        }
        .badge-sub {
          font-size: 0.7rem; color: var(--text-muted); padding: 2px 6px; border-radius: 4px; background: var(--bg-input); width: fit-content;
        }
        .desc-cell {
          max-width: 240px; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.4;
        }
        .date-cell {
          white-space: nowrap; font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;
        }
        .alarm-pill {
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .alarm-pill:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .alarm-pill.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10B981;
          color: #059669;
          font-weight: 700;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
        }

        .task-list { display: flex; flex-direction: column; gap: 10px; }
        .task-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          transition: all 0.2s ease;
        }
        .task-item:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
        .task-completed { opacity: 0.65; }
        .task-check {
          width: 24px; height: 24px; border-radius: 50%;
          border: 2px solid var(--color-primary);
          background: none; cursor: pointer; flex-shrink: 0;
          color: white; font-size: 0.8rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; margin-top: 2px;
        }
        .task-check.checked { background: var(--color-primary); }
        .task-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .task-header-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .task-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
        .task-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .task-desc { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; }
        .task-meta { display: flex; gap: 14px; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; }
        .task-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .task-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
        @media (max-width: 600px) {
          .task-toolbar { flex-direction: column; align-items: stretch; }
          .task-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
