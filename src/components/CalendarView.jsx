import React, { useState } from 'react';
import { formatTime12 } from '../utils/timeUtils';
import { useUserData } from '../context/DataContext';

/* ─── Indian Calendar Data ──────────────────────────────────
   Tamil months, Amavasya/Pournami dates, major Indian festivals
─────────────────────────────────────────────────────────── */

const TAMIL_MONTHS = [
  'Margazhi', 'Thai', 'Maasi', 'Panguni', 'Chithirai', 'Vaigasi',
  'Aani', 'Aadi', 'Aavani', 'Purattasi', 'Aippasi', 'Karthigai',
];

function getTamilMonth(month) {
  return TAMIL_MONTHS[(month + 9) % 12];
}

function getTamilDate(date) {
  const d = date.getDate();
  return d <= 14 ? d + 16 : d - 14;
}

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
  '2025-01-14': 'Pongal / Makar Sankranti',
  '2025-01-15': 'Mattu Pongal',
  '2025-01-26': 'Republic Day',
  '2025-02-26': 'Maha Shivaratri',
  '2025-03-14': 'Holi',
  '2025-03-30': 'Eid al-Fitr',
  '2025-04-06': 'Ugadi / Gudi Padwa',
  '2025-04-14': 'Tamil New Year / Vishu',
  '2025-04-15': 'Ambedkar Jayanti',
  '2025-04-18': 'Good Friday',
  '2025-05-01': 'Labour Day',
  '2025-05-12': 'Buddha Purnima',
  '2025-06-07': 'Eid al-Adha',
  '2025-07-06': 'Guru Purnima',
  '2025-08-15': 'Independence Day',
  '2025-08-16': 'Vinayaka Chaturthi',
  '2025-09-05': 'Teachers\' Day',
  '2025-10-02': 'Gandhi Jayanti',
  '2025-10-13': 'Dussehra',
  '2025-10-20': 'Diwali',
  '2025-11-01': 'Karthigai Deepam',
  '2025-12-25': 'Christmas',
  '2026-01-14': 'Pongal',
  '2026-01-26': 'Republic Day',
  '2026-08-15': 'Independence Day',
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
const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(toISO(today.getFullYear(), today.getMonth(), today.getDate()));

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: numDays }, (_, i) => i + 1)
  );

  while (cells.length % 7 !== 0) cells.push(null);
  const totalRows = Math.ceil(cells.length / 7);

  const selectedISO = selected;
  const selectedDate = selected ? new Date(selected + 'T00:00') : null;
  const festival = selectedDate ? FESTIVALS[toISO(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())] : null;
  const isAmavasya = AMAVASYA_DATES.has(selected);
  const isPournami = POURNAMI_DATES.has(selected);
  const isEkadashi = EKADASHI_DATES.has(selected);

  const { tasks = [] } = useUserData();
  const selectedTasks = tasks.filter(t => t.dueDate === selected);

  return (
    <div className="calendar-page animate-fadeIn">
      {/* Header Controls */}
      <div className="section-card" style={{ padding: '20px 24px' }}>
        <div className="cal-header">
          <button className="btn btn-ghost btn-icon" onClick={prevMonth}>‹</button>
          <div className="cal-month-title">
            <span className="cal-month-name">{MONTH_NAMES[month]} {year}</span>
            <span className="cal-tamil">{getTamilMonth(month)} (Tamil)</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth}>›</button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => { 
              setYear(today.getFullYear()); 
              setMonth(today.getMonth()); 
              setSelected(toISO(today.getFullYear(), today.getMonth(), today.getDate())); 
            }}
          >
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="cal-legend">
          <span><span className="dot festival" /> Festival</span>
          <span><span className="dot amavasya" /> Amavasya</span>
          <span><span className="dot pournami" /> Pournami</span>
          <span><span className="dot ekadashi" /> Ekadashi</span>
        </div>

        {/* XO Game Grid - Bold Intersection lines only, no outer border */}
        <div className="cal-xo-wrapper">
          <div className="cal-grid">
            {DAY_NAMES.map((d, idx) => (
              <div key={d} className={`cal-day-name ${idx === 6 ? 'last-col' : ''}`}>{d}</div>
            ))}
            {cells.map((day, i) => {
              const rowIndex = Math.floor(i / 7);
              const colIndex = i % 7;
              const isLastRow = rowIndex === totalRows - 1;
              const isLastCol = colIndex === 6;

              if (!day) {
                return (
                  <div 
                    key={`empty-${i}`} 
                    className={`cal-cell empty ${isLastCol ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`} 
                  />
                );
              }

              const iso = toISO(year, month, day);
              const dayDate = new Date(iso + 'T00:00');
              const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
              const isSel = iso === selectedISO;
              
              const dayFest = FESTIVALS[iso];
              const dayAmav = AMAVASYA_DATES.has(iso);
              const dayPour = POURNAMI_DATES.has(iso);
              const dayEka = EKADASHI_DATES.has(iso);
              const dayTamilDate = getTamilDate(dayDate);
              const dayTamilMonth = getTamilMonth(dayDate.getMonth());
              const dayTaskCount = tasks.filter(t => t.dueDate === iso).length;

              return (
                <button 
                  key={iso} 
                  className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''} ${isLastCol ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`} 
                  onClick={() => setSelected(iso)}
                >
                  {/* Top row inside box: Gregorian Date (Left) & Tamil Date (Right) */}
                  <div className="cell-top-row">
                    <span className="cal-day-num">{day}</span>
                    <span className="cal-tamil-date">{dayTamilDate} {dayTamilMonth.substring(0, 4)}</span>
                  </div>

                  {/* Observances mentioned directly INSIDE the box */}
                  <div className="cell-observances-inline">
                    {dayFest && <span className="inline-tag festival" title={dayFest}>🎊 {dayFest}</span>}
                    {dayAmav && <span className="inline-tag amavasya">🌑 Amavasya</span>}
                    {dayPour && <span className="inline-tag pournami">🌕 Pournami</span>}
                    {dayEka && <span className="inline-tag ekadashi">🙏 Ekadashi</span>}
                  </div>

                  {/* Tasks count inside box */}
                  {dayTaskCount > 0 && (
                    <div className="cell-tasks-badge">
                      📋 {dayTaskCount} task{dayTaskCount > 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Details Card */}
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
        .cal-tamil { display: block; font-size: 0.78rem; color: var(--color-primary); font-weight: 700; }
        .cal-legend { display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted); align-items: center; justify-content: center; }
        .cal-legend span { display: flex; align-items: center; gap: 5px; font-weight: 600; }
        .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
        .dot.festival { background: #F59E0B; }
        .dot.amavasya { background: #6366F1; }
        .dot.pournami { background: #F97316; }
        .dot.ekadashi { background: #10B981; }

        /* XO Game Grid Layout - Bold Intersection Lines Only */
        .cal-xo-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 8px;
        }

        .cal-grid { 
          display: grid; 
          grid-template-columns: repeat(7, 1fr); 
          gap: 0;
          border: none;
          background: transparent;
        }

        .cal-day-name { 
          text-align: center; 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: var(--text-muted); 
          padding: 10px 4px; 
          text-transform: uppercase; 
          letter-spacing: 0.08em;
          border-bottom: 2.5px solid var(--border-color-strong);
          border-right: 2.5px solid var(--border-color-strong);
        }
        .cal-day-name.last-col {
          border-right: none;
        }

        /* Compact Day Cell Box */
        .cal-cell {
          position: relative;
          min-height: 66px;
          padding: 6px 6px;
          display: flex; 
          flex-direction: column; 
          align-items: stretch;
          justify-content: flex-start;
          gap: 3px;
          background: transparent;
          cursor: pointer; 
          transition: background 0.15s ease;
          text-align: left;
          /* XO Game Bold Intersection Lines */
          border-right: 2.5px solid var(--border-color-strong);
          border-bottom: 2.5px solid var(--border-color-strong);
          border-top: none;
          border-left: none;
          border-radius: 0;
        }

        /* Remove borders on outer perimeter for XO grid style */
        .cal-cell.last-col {
          border-right: none;
        }
        .cal-cell.last-row {
          border-bottom: none;
        }

        .cal-cell.empty {
          background: transparent;
          pointer-events: none;
        }

        .cal-cell:hover { 
          background: var(--bg-input); 
        }

        .cal-cell.today { 
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.1); 
        }

        .cal-cell.selected { 
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.25) !important; 
          box-shadow: inset 0 0 0 2px var(--color-primary);
        }

        .cell-top-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          width: 100%;
        }

        .cal-day-num { 
          font-size: 0.95rem; 
          font-weight: 800; 
          color: var(--text-primary); 
          line-height: 1;
        }

        .cal-cell.today .cal-day-num { 
          color: var(--color-primary); 
        }

        .cal-tamil-date { 
          font-size: 0.68rem; 
          color: var(--text-muted); 
          font-weight: 600;
        }

        .cell-observances-inline {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          margin-top: 2px;
        }

        .inline-tag {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .inline-tag.festival { background: rgba(245, 158, 11, 0.18); color: #D97706; }
        .inline-tag.amavasya { background: rgba(99, 102, 241, 0.18); color: #4F46E5; }
        .inline-tag.pournami { background: rgba(249, 115, 22, 0.18); color: #EA580C; }
        .inline-tag.ekadashi { background: rgba(16, 185, 129, 0.18); color: #059669; }

        .cell-tasks-badge {
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--color-primary);
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.12);
          padding: 1px 4px;
          border-radius: 4px;
          margin-top: auto;
        }

        .cal-detail-date { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .cal-detail-tamil { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
        .cal-observances { display: flex; flex-direction: column; gap: 8px; }
        .observance { padding: 10px 14px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; }
        .festival-tag { background: rgba(245,158,11,0.12); color: #D97706; }
        .amavasya-tag { background: rgba(99,102,241,0.12); color: #4F46E5; }
        .pournami-tag { background: rgba(249,115,22,0.12); color: #EA580C; }
        .ekadashi-tag { background: rgba(16,185,129,0.12); color: #059669; }

        @media (max-width: 600px) {
          .cal-cell { min-height: 56px; padding: 4px; }
          .cal-day-num { font-size: 0.82rem; }
          .cal-tamil-date { font-size: 0.6rem; }
          .inline-tag { font-size: 0.6rem; padding: 0 2px; }
        }
      `}</style>
    </div>
  );
}
