import React, { useState } from 'react';
import { 
  getTamilDateDetails, 
  MASTER_FESTIVAL_DATABASE, 
  TAMIL_MONTHS,
  TAMIL_WEEKDAYS,
  getFestivalsForISO,
  getUpcomingFestivals,
  getHolidayStatus 
} from '../utils/tamilCalendarUtils';
import { useUserData } from '../context/DataContext';

export default function TamilCalendarView() {
  const today = new Date();
  const [selectedDateObj, setSelectedDateObj] = useState(today);
  const [activeCategory, setActiveCategory] = useState('all'); // all, tamil, national, hindu, islamic, christian, un_international
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [langMode, setLangMode] = useState('both'); // both, ta, en

  // User preferences state (Persisted in localStorage)
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_tamil_cal_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      enableReligious: true,
      enableGovtHolidays: true,
      enableInternational: true,
      enableReminders: true
    };
  });

  const savePrefs = (newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('sa_tamil_cal_prefs', JSON.stringify(newPrefs));
  };

  const { addTask, addAlarm } = useUserData();

  // Current details
  const currentPanchangam = getTamilDateDetails(selectedDateObj);
  const year = selectedDateObj.getFullYear();
  const month = selectedDateObj.getMonth();

  const prevMonth = () => setSelectedDateObj(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedDateObj(new Date(year, month + 1, 1));

  // Build grid days for month
  const numDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: numDays }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);
  const totalRows = Math.ceil(cells.length / 7);

  // Filtered master festival list
  const filteredFestivals = MASTER_FESTIVAL_DATABASE.filter(f => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.titleTa && f.titleTa.includes(searchTerm));
    const matchesPrefs = 
      (f.category === 'national' || f.category === 'tamil' && prefs.enableGovtHolidays) ||
      (f.category === 'un_international' && prefs.enableInternational) ||
      (prefs.enableReligious);

    return matchesCat && matchesSearch && matchesPrefs;
  });

  // Upcoming 5 festivals with countdowns
  const upcomingList = getUpcomingFestivals(
    `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDateObj.getDate()).padStart(2, '0')}`,
    8
  );

  // Quick Action: Set Festival Reminder Alarm
  const handleSetReminder = (fest) => {
    const festDate = fest.dateStr || fest.iso;
    addTask({
      title: `🔔 Festival Reminder: ${fest.titleTa || fest.title}`,
      dueDate: festDate,
      dueTime: '08:00',
      category: 'Festival',
      priority: 'high',
      notes: `Celebrate ${fest.title}! ${fest.desc}`
    });

    addAlarm({
      title: `🎉 ${fest.title}`,
      time: '07:30',
      days: ['Everyday'],
      enabled: true
    });

    alert(`✅ Alarm & Task Reminder set for ${fest.title} on ${festDate}!`);
  };

  return (
    <div className="tamil-calendar-page animate-fadeIn">
      {/* Page Header Bar */}
      <div className="section-card page-header-card">
        <div className="header-left">
          <span className="page-logo">🗓️</span>
          <div>
            <h2>தமிழ் நாட்காட்டி & பஞ்சாங்கம்</h2>
            <p>Tamil Panchangam, Indian National Holidays & Festival Hub</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPrefModal(true)}
          >
            ⚙️ Calendar Preferences
          </button>
        </div>
      </div>

      {/* Main Grid: Left Panchangam & Grid, Right Festival Explorer */}
      <div className="tamil-page-layout">
        <div className="left-panchangam-column">
          {/* Panchangam Hero Card */}
          <div className="section-card panchangam-hero">
            <div className="hero-top-bar">
              <div className="tamil-month-large">
                <span className="ta-month">{currentPanchangam.tamilMonth.ta}</span>
                <span className="en-month">({currentPanchangam.tamilMonth.en})</span>
                <span className="date-number">{currentPanchangam.tamilDateNum}</span>
              </div>
              <div className="tamil-year-badge">
                <span>தமிழ் ஆண்டு: <strong>{currentPanchangam.tamilYear.ta}</strong> ({currentPanchangam.tamilYear.en})</span>
                <span className="weekday-tag">· {currentPanchangam.weekday.ta} ({currentPanchangam.weekday.en})</span>
              </div>
            </div>

            {/* Panchangam Attributes Grid */}
            <div className="attributes-grid">
              <div className="attr-card">
                <span className="attr-icon">✨</span>
                <div className="attr-meta">
                  <span className="attr-label">நட்சத்திரம் (Nakshatra)</span>
                  <span className="attr-val">{currentPanchangam.nakshatra.ta} ({currentPanchangam.nakshatra.en})</span>
                </div>
              </div>

              <div className="attr-card">
                <span className="attr-icon">🌙</span>
                <div className="attr-meta">
                  <span className="attr-label">திதி (Tithi)</span>
                  <span className="attr-val">{currentPanchangam.tithi.ta} ({currentPanchangam.tithi.en})</span>
                </div>
              </div>

              <div className="attr-card warning">
                <span className="attr-icon">⏳</span>
                <div className="attr-meta">
                  <span className="attr-label">ராகு காலம் (Rahu Kalam)</span>
                  <span className="attr-val">{currentPanchangam.timings.rahu}</span>
                </div>
              </div>

              <div className="attr-card success">
                <span className="attr-icon">⭐</span>
                <div className="attr-meta">
                  <span className="attr-label">நல்ல நேரம் (Nalla Neram)</span>
                  <span className="attr-val">{currentPanchangam.timings.nallaMorning}</span>
                </div>
              </div>

              <div className="attr-card info">
                <span className="attr-icon">☸️</span>
                <div className="attr-meta">
                  <span className="attr-label">எமகண்டம் (Yamagandam)</span>
                  <span className="attr-val">{currentPanchangam.timings.yama}</span>
                </div>
              </div>

              <div className="attr-card info">
                <span className="attr-icon">🕒</span>
                <div className="attr-meta">
                  <span className="attr-label">குளிகை (Kuligai)</span>
                  <span className="attr-val">{currentPanchangam.timings.kuli}</span>
                </div>
              </div>
            </div>
          </div>

          {/* XO Monthly Calendar Grid */}
          <div className="section-card cal-grid-card">
            <div className="cal-nav-bar">
              <button className="btn btn-ghost btn-icon" onClick={prevMonth}>‹</button>
              <div className="cal-title-box">
                <span className="greg-month">{selectedDateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <span className="tamil-month-sub">{currentPanchangam.tamilMonth.ta} ({currentPanchangam.tamilMonth.en})</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={nextMonth}>›</button>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDateObj(today)}
              >
                Today
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="category-pills-bar">
              {[
                { id: 'all', label: 'All Festivals' },
                { id: 'tamil', label: '🌾 Tamil Nadu' },
                { id: 'national', label: '🇮🇳 National' },
                { id: 'hindu', label: '🪔 Hindu' },
                { id: 'islamic', label: '🌙 Islamic' },
                { id: 'christian', label: '✝️ Christian' },
                { id: 'un_international', label: '🌏 UN International' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="xo-calendar-wrapper">
              <div className="cal-xo-grid">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((d, idx) => (
                  <div key={d} className={`day-name-cell ${idx === 6 ? 'last-col' : ''}`}>{d}</div>
                ))}

                {cells.map((dayNum, i) => {
                  const rowIndex = Math.floor(i / 7);
                  const colIndex = i % 7;
                  const isLastRow = rowIndex === totalRows - 1;
                  const isLastCol = colIndex === 6;

                  if (!dayNum) {
                    return <div key={`empty-${i}`} className={`grid-cell empty ${isLastCol ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`} />;
                  }

                  const cellDate = new Date(year, month, dayNum);
                  const cellIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = cellIso === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  const isSelected = cellIso === currentPanchangam.isoDate;

                  const cellTamil = getTamilDateDetails(cellDate);
                  const dayFests = getFestivalsForISO(cellIso);

                  return (
                    <button
                      key={cellIso}
                      className={`grid-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isLastCol ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`}
                      onClick={() => setSelectedDateObj(cellDate)}
                    >
                      <div className="cell-top">
                        <span className="greg-num">{dayNum}</span>
                        <span className="ta-num">{cellTamil.tamilDateNum} {cellTamil.tamilMonth.ta.substring(0, 3)}</span>
                      </div>

                      {dayFests.length > 0 && (
                        <div className="cell-fest-box">
                          <span className="fest-icon">{dayFests[0].icon}</span>
                          <span className="fest-title-sm">{dayFests[0].titleTa || dayFests[0].title}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Festival Explorer & Countdown */}
        <div className="right-explorer-column">
          {/* Upcoming Festival Countdowns Card */}
          <div className="section-card countdowns-card">
            <h3>🎉 Upcoming Festival Countdowns</h3>
            <div className="countdowns-list">
              {upcomingList.map(fest => (
                <div key={fest.title + fest.dateStr} className="countdown-item">
                  <div className="item-top">
                    <span className="item-icon">{fest.icon}</span>
                    <div className="item-details">
                      <h4>{fest.titleTa || fest.title}</h4>
                      <span className="item-date">📅 {fest.dateStr}</span>
                    </div>
                    <div className="item-badge">
                      {fest.daysLeft === 0 ? 'TODAY!' : `${fest.daysLeft} Days Left`}
                    </div>
                  </div>
                  <p className="item-desc">{fest.desc}</p>
                  <button
                    className="btn btn-ghost btn-xs reminder-btn"
                    onClick={() => handleSetReminder(fest)}
                  >
                    ⏰ Set Reminder Alarm
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Master Search & All Festivals List */}
          <div className="section-card master-festivals-card">
            <div className="card-search-header">
              <h3>📚 Festival & Holiday Directory</h3>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search festival in Tamil/English..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="directory-list">
              {filteredFestivals.map((fest, idx) => (
                <div key={fest.title + idx} className="dir-item">
                  <div className="dir-icon-box">{fest.icon}</div>
                  <div className="dir-info">
                    <div className="dir-title-row">
                      <span className="dir-title">{fest.titleTa ? `${fest.titleTa} (${fest.title})` : fest.title}</span>
                      {fest.isPublicHoliday && <span className="public-tag">Govt Holiday</span>}
                    </div>
                    <span className="dir-date">📅 {fest.iso2026 || fest.iso}</span>
                  </div>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => handleSetReminder(fest)}
                  >
                    + Alarm
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPrefModal && (
        <div className="modal-overlay" onClick={() => setShowPrefModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Tamil Calendar & Festival Preferences</h3>
              <button className="close-btn" onClick={() => setShowPrefModal(false)}>✕</button>
            </div>

            <div className="pref-body">
              <div className="pref-option">
                <div>
                  <label>🪔 Religious Festivals</label>
                  <p className="text-muted">Display Hindu, Islamic, Christian & other religious observances.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableReligious}
                  onChange={e => savePrefs({ ...prefs, enableReligious: e.target.checked })}
                />
              </div>

              <div className="pref-option">
                <div>
                  <label>🏛️ Government Public Holidays</label>
                  <p className="text-muted">Display official Indian & Tamil Nadu government holidays.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableGovtHolidays}
                  onChange={e => savePrefs({ ...prefs, enableGovtHolidays: e.target.checked })}
                />
              </div>

              <div className="pref-option">
                <div>
                  <label>🌏 International & UN Days</label>
                  <p className="text-muted">Display UN awareness days, Earth Day, Yoga Day, etc.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableInternational}
                  onChange={e => savePrefs({ ...prefs, enableInternational: e.target.checked })}
                />
              </div>

              <div className="pref-option">
                <div>
                  <label>🔔 Auto Festival Reminders</label>
                  <p className="text-muted">Automatically notify 1 day before major festivals.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableReminders}
                  onChange={e => savePrefs({ ...prefs, enableReminders: e.target.checked })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowPrefModal(false)}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tamil-calendar-page { display: flex; flex-direction: column; gap: 20px; }
        .page-header-card { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .page-logo { font-size: 2.2rem; }
        .header-left h2 { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0; }
        .header-left p { font-size: 0.85rem; color: var(--text-muted); margin: 2px 0 0; }

        .tamil-page-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }
        .left-panchangam-column, .right-explorer-column { display: flex; flex-direction: column; gap: 20px; }

        /* Panchangam Hero Card */
        .panchangam-hero { padding: 20px 24px; background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.08); border: 1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.25); }
        .hero-top-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; }
        .tamil-month-large { display: flex; align-items: baseline; gap: 8px; }
        .ta-month { font-size: 1.8rem; font-weight: 900; color: var(--text-primary); }
        .en-month { font-size: 1rem; color: var(--color-primary); font-weight: 700; }
        .date-number { font-size: 2.2rem; font-weight: 900; color: var(--color-primary); margin-left: 10px; }
        .tamil-year-badge { text-align: right; font-size: 0.88rem; color: var(--text-secondary); }

        .attributes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .attr-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); }
        .attr-icon { font-size: 1.3rem; }
        .attr-meta { display: flex; flex-direction: column; }
        .attr-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
        .attr-val { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }

        /* XO Monthly Calendar */
        .cal-grid-card { padding: 20px 24px; }
        .cal-nav-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .cal-title-box { text-align: center; }
        .greg-month { display: block; font-size: 1.2rem; font-weight: 800; color: var(--text-primary); }
        .tamil-month-sub { font-size: 0.8rem; color: var(--color-primary); font-weight: 700; }

        .category-pills-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 12px; }
        .cat-pill { font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: var(--bg-input); color: var(--text-secondary); border: 1px solid var(--border-color); cursor: pointer; white-space: nowrap; }
        .cat-pill.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

        .xo-calendar-wrapper { width: 100%; overflow-x: auto; }
        .cal-xo-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; }
        .day-name-cell { text-align: center; font-size: 0.72rem; font-weight: 800; color: var(--text-muted); padding: 8px 4px; border-bottom: 2px solid var(--border-color-strong); border-right: 2px solid var(--border-color-strong); }
        .day-name-cell.last-col { border-right: none; }

        .grid-cell { position: relative; min-height: 64px; padding: 6px; display: flex; flex-direction: column; justify-content: space-between; background: transparent; cursor: pointer; border-right: 2px solid var(--border-color-strong); border-bottom: 2px solid var(--border-color-strong); border-top: none; border-left: none; }
        .grid-cell.last-col { border-right: none; }
        .grid-cell.last-row { border-bottom: none; }
        .grid-cell.empty { pointer-events: none; }
        .grid-cell:hover { background: var(--bg-input); }
        .grid-cell.today { background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.12); }
        .grid-cell.selected { background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.25) !important; box-shadow: inset 0 0 0 2px var(--color-primary); }

        .cell-top { display: flex; justify-content: space-between; align-items: baseline; }
        .greg-num { font-size: 0.9rem; font-weight: 800; color: var(--text-primary); }
        .ta-num { font-size: 0.62rem; color: var(--text-muted); font-weight: 600; }
        .cell-fest-box { display: flex; align-items: center; gap: 3px; font-size: 0.62rem; font-weight: 700; background: rgba(245, 158, 11, 0.18); color: #D97706; padding: 2px 4px; border-radius: 4px; overflow: hidden; white-space: nowrap; }

        /* Right Column Explorer */
        .countdowns-card, .master-festivals-card { padding: 20px 24px; }
        .countdowns-list { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; max-height: 420px; overflow-y: auto; }
        .countdown-item { padding: 12px 14px; background: var(--bg-surface-2); border-radius: 12px; border: 1px solid var(--border-color); }
        .item-top { display: flex; align-items: center; gap: 10px; }
        .item-icon { font-size: 1.5rem; }
        .item-details { flex: 1; }
        .item-details h4 { font-size: 0.9rem; font-weight: 800; margin: 0; color: var(--text-primary); }
        .item-date { font-size: 0.74rem; color: var(--text-muted); }
        .item-badge { font-size: 0.72rem; font-weight: 800; background: var(--color-primary); color: white; padding: 3px 8px; border-radius: 12px; }
        .item-desc { font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 8px; }
        .reminder-btn { color: var(--color-primary); font-weight: 700; }

        .card-search-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .search-input { width: 100%; }
        .directory-list { display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; }
        .dir-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-surface-2); border-radius: 10px; border: 1px solid var(--border-color); }
        .dir-icon-box { font-size: 1.2rem; }
        .dir-info { flex: 1; }
        .dir-title-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .dir-title { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
        .public-tag { font-size: 0.62rem; background: rgba(239, 68, 68, 0.15); color: #EF4444; padding: 1px 6px; border-radius: 10px; font-weight: 700; }
        .dir-date { font-size: 0.72rem; color: var(--text-muted); }

        /* Preferences Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { max-width: 480px; width: 100%; padding: 24px; border-radius: 20px; background: var(--bg-surface); border: 1px solid var(--border-color); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); }
        .pref-body { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
        .pref-option { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .pref-option label { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
        .pref-option p { font-size: 0.76rem; color: var(--text-muted); margin: 2px 0 0; }

        @media (max-width: 900px) {
          .tamil-page-layout { grid-template-columns: 1fr; }
          .attributes-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
