import React, { useState } from 'react';
import { formatTime12 } from '../utils/timeUtils';

/* ─── Indian Calendar Data ──────────────────────────────────
   Tamil months, Amavasya/Pournami dates, major Indian festivals
   Data covers 2025-2026
─────────────────────────────────────────────────────────── */

const TAMIL_MONTHS = [
  'Margazhi', 'Thai', 'Maasi', 'Panguni', 'Chithirai', 'Vaigasi',
  'Aani', 'Aadi', 'Aavani', 'Purattasi', 'Aippasi', 'Karthigai',
];

// Approximate Tamil month for Gregorian month (mid-month shifts)
function getTamilMonth(month /* 0-based */) {
  // Tamil month starts ~mid-April and runs ~1 month
  // Approximation: Tamil month index ≈ (Gregorian month + 9) % 12
  return TAMIL_MONTHS[(month + 9) % 12];
}

function getTamilDate(date) {
  // Simplified: Tamil date ≈ Gregorian date shifted by ~14 days within month
  const d = date.getDate();
  return d <= 14 ? d + 16 : d - 14;
}

// Amavasya (New Moon) and Pournami (Full Moon) approximate dates 2025-2026
const AMAVASYA_DATES = new Set([
  '2025-01-29','2025-02-28','2025-03-29','2025-04-27','2025-05-26',
  '2025-06-25','2025-07-24','2025-08-23','2025-09-21','2025-10-21',
  '2025-11-20','2025-12-20','2026-01-18','2026-02-17','2026-03-18',
  '2026-04-17','2026-05-16','2026-06-15','2026-07-14','2026-08-12',
]);
const POURNAMI_DATES = new Set([
  '2025-01-13','2025-02-12','2025-03-14','2025-04-13','2025-05-12',
  '2025-06-11','2025-07-10','2025-08-09','2025-09-07','2025-10-07',
  '2025-11-05','2025-12-04','2026-01-03','2026-02-01','2026-03-03',
  '2026-04-02','2026-05-01','2026-05-31','2026-06-29','2026-07-29',
  '2026-08-27',
]);
const EKADASHI_DATES = new Set([
  '2025-01-10','2025-01-25','2025-02-08','2025-02-24','2025-03-10',
  '2025-03-25','2025-04-08','2025-04-24','2025-05-08','2025-05-23',
  '2025-06-06','2025-06-21','2025-07-06','2025-07-20','2025-08-05',
  '2025-08-19','2025-09-03','2025-09-18','2025-10-03','2025-10-17',
  '2025-11-01','2025-11-16','2025-12-01','2025-12-15','2025-12-31',
]);

const FESTIVALS = {
  '2025-01-14': '🎊 Pongal / Makar Sankranti',
  '2025-01-15': '🐄 Mattu Pongal',
  '2025-01-26': '🇮🇳 Republic Day',
  '2025-02-26': '🌸 Maha Shivaratri',
  '2025-03-14': '🌈 Holi',
  '2025-03-30': '🌙 Eid al-Fitr',
  '2025-04-06': '🌺 Ugadi / Gudi Padwa',
  '2025-04-14': '🌟 Tamil New Year / Vishu',
  '2025-04-15': '🕌 Dr. B.R. Ambedkar Jayanti',
  '2025-04-18': '✝️ Good Friday',
  '2025-05-01': '👷 Labour Day',
  '2025-05-12': '🪷 Buddha Purnima',
  '2025-06-07': '🕌 Eid al-Adha',
  '2025-07-06': '🏔️ Guru Purnima',
  '2025-08-15': '🇮🇳 Independence Day',
  '2025-08-16': '🐘 Vinayaka Chaturthi',
  '2025-09-05': '🍎 Teachers\' Day',
  '2025-10-02': '🕊️ Gandhi Jayanti & 🏹 Navratri begins',
  '2025-10-13': '🎆 Dussehra',
  '2025-10-20': '🪔 Diwali',
  '2025-11-01': '🌺 Karthigai Deepam',
  '2025-12-25': '🎄 Christmas',
  '2026-01-14': '🎊 Pongal',
  '2026-01-26': '🇮🇳 Republic Day',
  '2026-08-15': '🇮🇳 Independence Day',
};

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(toISO(today.getFullYear(), today.getMonth(), today.getDate()));
  const [view, setView] = useState('monthly'); // monthly | weekly

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: numDays }, (_, i) => i + 1)
  );

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedISO = selected;
  const selectedDate = selected ? new Date(selected + 'T00:00') : null;
  const festival = selectedDate ? FESTIVALS[toISO(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())] : null;
  const isAmavasya = AMAVASYA_DATES.has(selected);
  const isPournami = POURNAMI_DATES.has(selected);
  const isEkadashi = EKADASHI_DATES.has(selected);

  const selectedTasks = (() => {
    try {
      const all = JSON.parse(localStorage.getItem('sa_tasks') || '[]');
      return all.filter(t => t.dueDate === selected);
    } catch { return []; }
  })();

  const getMarkers = (iso) => {
    const marks = [];
    if (FESTIVALS[iso]) marks.push('festival');
    if (AMAVASYA_DATES.has(iso)) marks.push('amavasya');
    if (POURNAMI_DATES.has(iso)) marks.push('pournami');
    if (EKADASHI_DATES.has(iso)) marks.push('ekadashi');
    return marks;
  };

  return (
    <div className="calendar-page animate-fadeIn">
      {/* Header */}
      <div className="section-card">
        <div className="cal-header">
          <button className="btn btn-ghost btn-icon" onClick={prevMonth}>‹</button>
          <div className="cal-month-title">
            <span className="cal-month-name">{MONTH_NAMES[month]} {year}</span>
            <span className="cal-tamil">{getTamilMonth(month)} (Tamil)</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth}>›</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(toISO(today.getFullYear(), today.getMonth(), today.getDate())); }}>
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="cal-legend">
          <span><span className="dot festival" />Festival</span>
          <span><span className="dot amavasya" />Amavasya</span>
          <span><span className="dot pournami" />Pournami</span>
          <span><span className="dot ekadashi" />Ekadashi</span>
        </div>

        {/* Calendar Grid */}
        <div className="cal-grid">
          {DAY_NAMES.map(d => <div key={d} className="cal-day-name">{d}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />;
            const iso = toISO(year, month, day);
            const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
            const isSel = iso === selectedISO;
            const markers = getMarkers(iso);
            return (
              <button key={iso} className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`} onClick={() => setSelected(iso)}>
                <span className="cal-day-num">{day}</span>
                <span className="cal-tamil-day">{getTamilDate(new Date(iso + 'T00:00'))}</span>
                <div className="cal-dots">
                  {markers.includes('festival') && <span className="dot festival" />}
                  {markers.includes('amavasya') && <span className="dot amavasya" />}
                  {markers.includes('pournami') && <span className="dot pournami" />}
                  {markers.includes('ekadashi') && <span className="dot ekadashi" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panel */}
      {selected && (
        <div className="section-card cal-detail animate-fadeIn" style={{ marginTop: 16 }}>
          <h3 className="cal-detail-date">
            {new Date(selected + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <div className="cal-detail-tamil">
            📅 Tamil Date: {getTamilDate(new Date(selected + 'T00:00'))} {getTamilMonth(new Date(selected + 'T00:00').getMonth())}
          </div>
          <div className="cal-observances">
            {festival && <div className="observance festival-tag">🎊 {festival}</div>}
            {isAmavasya && <div className="observance amavasya-tag">🌑 Amavasya (New Moon)</div>}
            {isPournami && <div className="observance pournami-tag">🌕 Pournami (Full Moon)</div>}
            {isEkadashi && <div className="observance ekadashi-tag">🙏 Ekadashi</div>}
            {!festival && !isAmavasya && !isPournami && !isEkadashi && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No special observances</div>
            )}
          </div>

          {selectedTasks.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                📋 Tasks Due ({selectedTasks.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedTasks.map(t => (
                  <div key={t.id} style={{ padding: '8px 12px', background: 'var(--bg-surface-2)', borderRadius: 8, fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textDecoration: t.completed ? 'line-through' : 'none', color: 'var(--text-primary)' }}>{t.title}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {t.dueTime ? `⏰ ${formatTime12(t.dueTime)}` : t.preferredTime ? `⏰ ${formatTime12(t.preferredTime)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .cal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .cal-month-title { flex: 1; text-align: center; }
        .cal-month-name { display: block; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }
        .cal-tamil { display: block; font-size: 0.75rem; color: var(--color-primary); font-weight: 600; }
        .cal-legend { display: flex; gap: 14px; margin-bottom: 12px; flex-wrap: wrap; font-size: 0.76rem; color: var(--text-muted); align-items: center; }
        .cal-legend span { display: flex; align-items: center; gap: 5px; }
        .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
        .dot.festival { background: #F59E0B; }
        .dot.amavasya { background: #6366F1; }
        .dot.pournami { background: #F97316; }
        .dot.ekadashi { background: #10B981; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .cal-day-name { text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); padding: 6px 0; text-transform: uppercase; letter-spacing: 0.06em; }
        .cal-cell {
          aspect-ratio: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
          border-radius: 10px; border: 1px solid transparent; cursor: pointer;
          background: none; transition: all 0.15s;
          position: relative; padding: 4px 2px;
        }
        .cal-cell:hover { background: var(--bg-input); border-color: var(--border-color); }
        .cal-cell.today { background: rgba(var(--color-primary-rgb),0.12); border-color: var(--color-primary) !important; }
        .cal-cell.selected { background: var(--color-primary) !important; border-color: var(--color-primary) !important; }
        .cal-cell.selected .cal-day-num { color: white !important; }
        .cal-cell.selected .cal-tamil-day { color: rgba(255,255,255,0.7) !important; }
        .cal-cell.empty { pointer-events: none; }
        .cal-day-num { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
        .cal-cell.today .cal-day-num { color: var(--color-primary); }
        .cal-tamil-day { font-size: 0.62rem; color: var(--text-muted); }
        .cal-dots { display: flex; gap: 2px; flex-wrap: wrap; justify-content: center; margin-top: 2px; }
        .cal-detail { }
        .cal-detail-date { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .cal-detail-tamil { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
        .cal-observances { display: flex; flex-direction: column; gap: 8px; }
        .observance { padding: 10px 14px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; }
        .festival-tag { background: rgba(245,158,11,0.12); color: #D97706; }
        .amavasya-tag { background: rgba(99,102,241,0.12); color: #4F46E5; }
        .pournami-tag { background: rgba(249,115,22,0.12); color: #EA580C; }
        .ekadashi-tag { background: rgba(16,185,129,0.12); color: #059669; }
        @media (max-width: 500px) {
          .cal-day-num { font-size: 0.75rem; }
          .cal-tamil-day { display: none; }
        }
      `}</style>
    </div>
  );
}
