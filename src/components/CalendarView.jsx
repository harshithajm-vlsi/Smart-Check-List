import React, { useState } from 'react';
import { formatTime12 } from '../utils/timeUtils';
import { useUserData } from '../context/DataContext';

/* ─── Indian Calendar Data ──────────────────────────────────
   Tamil months, Amavasya/Pournami dates, complete Indian festivals (2025-2026)
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
  '2026-09-11','2026-10-10','2026-11-09','2026-12-09'
]);
const POURNAMI_DATES = new Set([
  '2025-01-13','2025-02-12','2025-03-14','2025-04-13','2025-05-12',
  '2025-06-11','2025-07-10','2025-08-09','2025-09-07','2025-10-07',
  '2025-11-05','2025-12-04','2026-01-03','2026-02-01','2026-03-03',
  '2026-04-02','2026-05-01','2026-05-31','2026-06-29','2026-07-29',
  '2026-08-27','2026-09-25','2026-10-25','2026-11-24','2026-12-23'
]);
const EKADASHI_DATES = new Set([
  '2025-01-10','2025-01-25','2025-02-08','2025-02-24','2025-03-10',
  '2025-03-25','2025-04-08','2025-04-24','2025-05-08','2025-05-23',
  '2025-06-06','2025-06-21','2025-07-06','2025-07-20','2025-08-05',
  '2025-08-19','2025-09-03','2025-09-18','2025-10-03','2025-10-17',
  '2025-11-01','2025-11-16','2025-12-01','2025-12-15','2025-12-31',
  '2026-01-14','2026-01-29','2026-02-13','2026-02-27','2026-03-14',
  '2026-03-29','2026-04-13','2026-04-28','2026-05-13','2026-05-27',
  '2026-06-11','2026-06-26','2026-07-10','2026-07-25','2026-08-09',
  '2026-08-23','2026-09-07','2026-09-22','2026-10-07','2026-10-21'
]);

const FESTIVALS = {
  // 2025 Major Indian Festivals
  '2025-01-01': '🎆 New Year\'s Day',
  '2025-01-14': '🌾 Pongal / Makar Sankranti',
  '2025-01-15': '🐄 Mattu Pongal / Thiruvalluvar Day',
  '2025-01-16': '🌾 Kaanum Pongal',
  '2025-01-26': '🇮🇳 Republic Day',
  '2025-02-02': '🌸 Saraswati Puja / Vasant Panchami',
  '2025-02-26': '🕉️ Maha Shivaratri',
  '2025-03-13': '🔥 Holika Dahan',
  '2025-03-14': '🎨 Holi',
  '2025-03-30': '🌙 Eid al-Fitr',
  '2025-03-31': '🌺 Ugadi / Gudi Padwa',
  '2025-04-06': '🏹 Ram Navami',
  '2025-04-10': '🪷 Mahavir Jayanti',
  '2025-04-14': '🌟 Tamil New Year / Vishu / Baisakhi',
  '2025-04-15': '📜 Ambedkar Jayanti',
  '2025-04-18': '✝️ Good Friday',
  '2025-04-20': '🐣 Easter Sunday',
  '2025-05-01': '👷 Labour Day / Maharashtra Day',
  '2025-05-12': '🪷 Buddha Purnima',
  '2025-06-07': '🕌 Bakrid / Eid al-Adha',
  '2025-07-06': '🕌 Muharram',
  '2025-07-10': '🪷 Guru Purnima',
  '2025-08-09': '🪢 Raksha Bandhan',
  '2025-08-15': '🇮🇳 Independence Day',
  '2025-08-16': '🪈 Krishna Janmashtami',
  '2025-08-27': '🐘 Ganesh Chaturthi',
  '2025-09-05': '🌺 Onam & 🍎 Teachers\' Day',
  '2025-09-22': '💃 Navratri Begins',
  '2025-10-01': '⚔️ Ayudha Puja / Maha Navami',
  '2025-10-02': '🏹 Vijayadashami / Dussehra & 🕊️ Gandhi Jayanti',
  '2025-10-09': '🌕 Karwa Chauth',
  '2025-10-20': '🪔 Diwali / Lakshmi Puja',
  '2025-10-22': '🎁 Govardhan Puja / Bhai Dooj',
  '2025-11-01': '🪔 Karthigai Deepam & 🚩 Kannada Rajyotsava',
  '2025-11-05': '🪯 Guru Nanak Jayanti',
  '2025-12-25': '🎄 Christmas',

  // 2026 Major Indian Festivals
  '2026-01-01': '🎆 New Year\'s Day',
  '2026-01-14': '🌾 Pongal / Makar Sankranti',
  '2026-01-15': '🐄 Mattu Pongal / Thiruvalluvar Day',
  '2026-01-16': '🌾 Kaanum Pongal',
  '2026-01-23': '🌸 Saraswati Puja / Vasant Panchami',
  '2026-01-26': '🇮🇳 Republic Day',
  '2026-02-15': '🕉️ Maha Shivaratri',
  '2026-03-03': '🔥 Holika Dahan',
  '2026-03-04': '🎨 Holi',
  '2026-03-20': '🌙 Eid al-Fitr',
  '2026-03-21': '🌺 Ugadi / Gudi Padwa',
  '2026-03-27': '🏹 Ram Navami',
  '2026-03-31': '🪷 Mahavir Jayanti',
  '2026-04-03': '✝️ Good Friday',
  '2026-04-05': '🐣 Easter Sunday',
  '2026-04-14': '🌟 Tamil New Year / Vishu / Baisakhi',
  '2026-04-15': '📜 Ambedkar Jayanti',
  '2026-05-01': '👷 Labour Day / Maharashtra Day',
  '2026-05-27': '🕌 Bakrid / Eid al-Adha',
  '2026-05-31': '🪷 Buddha Purnima',
  '2026-06-25': '🕌 Muharram',
  '2026-07-29': '🪷 Guru Purnima',
  '2026-08-15': '🇮🇳 Independence Day',
  '2026-08-26': '🌺 Onam',
  '2026-08-28': '🪢 Raksha Bandhan',
  '2026-09-04': '🪈 Krishna Janmashtami',
  '2026-09-05': '🍎 Teachers\' Day',
  '2026-09-14': '🐘 Ganesh Chaturthi',
  '2026-10-02': '🕊️ Gandhi Jayanti',
  '2026-10-11': '💃 Navratri Begins',
  '2026-10-19': '⚔️ Ayudha Puja / Maha Navami',
  '2026-10-20': '🏹 Vijayadashami / Dussehra',
  '2026-10-28': '🌕 Karwa Chauth',
  '2026-11-01': '🚩 Kannada Rajyotsava',
  '2026-11-08': '🪔 Diwali / Lakshmi Puja',
  '2026-11-10': '🎁 Govardhan Puja / Bhai Dooj',
  '2026-11-20': '🪔 Karthigai Deepam',
  '2026-11-24': '🪯 Guru Nanak Jayanti',
  '2026-12-25': '🎄 Christmas',
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

// Get Animated Icon Class for Special Dates
function getAnimatedBadge(fest, isAmav, isPour, isEka) {
  if (fest) {
    if (fest.includes('Diwali') || fest.includes('Deepam')) return { icon: '🪔', animClass: 'diya-flame', title: fest };
    if (fest.includes('Holi')) return { icon: '🎨', animClass: 'holi-sparkle', title: fest };
    if (fest.includes('Pongal') || fest.includes('Sankranti') || fest.includes('Onam')) return { icon: '🌾', animClass: 'harvest-bounce', title: fest };
    if (fest.includes('Independence') || fest.includes('Republic')) return { icon: '🇮🇳', animClass: 'flag-wave', title: fest };
    if (fest.includes('Ganesh') || fest.includes('Vinayaka')) return { icon: '🐘', animClass: 'ganesha-glow', title: fest };
    if (fest.includes('Shivaratri')) return { icon: '🕉️', animClass: 'shiva-om', title: fest };
    if (fest.includes('Raksha')) return { icon: '🪢', animClass: 'rakhi-spin', title: fest };
    if (fest.includes('Janmashtami')) return { icon: '🪈', animClass: 'krishna-sway', title: fest };
    if (fest.includes('Navratri') || fest.includes('Dussehra') || fest.includes('Vijayadashami')) return { icon: '🏹', animClass: 'navratri-flash', title: fest };
    if (fest.includes('Christmas')) return { icon: '🎄', animClass: 'xmas-twinkle', title: fest };
    if (fest.includes('Eid') || fest.includes('Bakrid')) return { icon: '🌙', animClass: 'eid-crescent', title: fest };
    return { icon: fest.split(' ')[0] || '🎉', animClass: 'fest-pulse', title: fest };
  }
  if (isPour) return { icon: '🌕', animClass: 'pournami-halo', title: 'Pournami (Full Moon)' };
  if (isAmav) return { icon: '🌑', animClass: 'amavasya-pulse', title: 'Amavasya (New Moon)' };
  if (isEka) return { icon: '🪷', animClass: 'ekadashi-float', title: 'Ekadashi' };
  return null;
}

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
          <span><span className="dot festival" /> Festival (Animated)</span>
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

              const animBadge = getAnimatedBadge(dayFest, dayAmav, dayPour, dayEka);

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

                  {/* Animated Visual Image / Icon for Special Dates */}
                  {animBadge && (
                    <div className="cell-animated-wrapper" title={animBadge.title}>
                      <span className={`anim-icon ${animBadge.animClass}`}>{animBadge.icon}</span>
                    </div>
                  )}

                  {/* Observances mentioned directly INSIDE the box */}
                  <div className="cell-observances-inline">
                    {dayFest && <span className="inline-tag festival" title={dayFest}>{dayFest}</span>}
                    {dayAmav && !dayFest && <span className="inline-tag amavasya">🌑 Amavasya</span>}
                    {dayPour && !dayFest && <span className="inline-tag pournami">🌕 Pournami</span>}
                    {dayEka && !dayFest && <span className="inline-tag ekadashi">🙏 Ekadashi</span>}
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
          min-height: 72px;
          padding: 6px 6px;
          display: flex; 
          flex-direction: column; 
          align-items: stretch;
          justify-content: flex-start;
          gap: 2px;
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
          font-size: 0.65rem; 
          color: var(--text-muted); 
          font-weight: 600;
        }

        /* Animated Icon Wrapper inside Date Box */
        .cell-animated-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1px 0;
        }

        .anim-icon {
          display: inline-block;
          font-size: 1.25rem;
          line-height: 1;
        }

        /* ─── Keyframe Animations for Special Date Icons ─── */
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 4px #F59E0B); }
          50% { transform: scale(1.2) rotate(4deg); filter: drop-shadow(0 0 10px #EF4444); }
        }
        @keyframes holiSparkle {
          0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 3px #EC4899); }
          50% { transform: rotate(20deg) scale(1.25); filter: drop-shadow(0 0 9px #8B5CF6); }
        }
        @keyframes harvestBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px) scale(1.12); }
        }
        @keyframes flagWave {
          0%, 100% { transform: skewY(0deg) scale(1); }
          50% { transform: skewY(-5deg) scale(1.1); }
        }
        @keyframes ganeshaGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px #F59E0B); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 10px #EAB308); }
        }
        @keyframes omGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px #6366F1); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 10px #A855F7); }
        }
        @keyframes rakhiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes krishnaSway {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes navratriFlash {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px #EF4444); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 10px #F59E0B); }
        }
        @keyframes pournamiHalo {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #F97316); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 11px #FBBF24); }
        }
        @keyframes amavasyaPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 3px #6366F1); }
          50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 9px #818CF8); }
        }
        @keyframes ekadashiFloat {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 3px #10B981); }
          50% { transform: translateY(-4px) scale(1.12); filter: drop-shadow(0 0 9px #34D399); }
        }
        @keyframes xmasTwinkle {
          0%, 100% { transform: scale(1) rotate(-4deg); }
          50% { transform: scale(1.14) rotate(4deg); filter: drop-shadow(0 0 9px #22C55E); }
        }
        @keyframes crescentGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px #10B981); }
          50% { transform: scale(1.16); filter: drop-shadow(0 0 9px #F59E0B); }
        }
        @keyframes festPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }

        .diya-flame { animation: flameFlicker 1.4s infinite ease-in-out; }
        .holi-sparkle { animation: holiSparkle 1.6s infinite ease-in-out; }
        .harvest-bounce { animation: harvestBounce 1.5s infinite ease-in-out; }
        .flag-wave { animation: flagWave 2s infinite ease-in-out; }
        .ganesha-glow { animation: ganeshaGlow 1.8s infinite ease-in-out; }
        .shiva-om { animation: omGlow 1.8s infinite ease-in-out; }
        .rakhi-spin { animation: rakhiSpin 7s infinite linear; }
        .krishna-sway { animation: krishnaSway 2s infinite ease-in-out; }
        .navratri-flash { animation: navratriFlash 1.4s infinite ease-in-out; }
        .pournami-halo { animation: pournamiHalo 2s infinite ease-in-out; }
        .amavasya-pulse { animation: amavasyaPulse 2s infinite ease-in-out; }
        .ekadashi-float { animation: ekadashiFloat 1.8s infinite ease-in-out; }
        .xmas-twinkle { animation: xmasTwinkle 1.6s infinite ease-in-out; }
        .eid-crescent { animation: crescentGlow 2s infinite ease-in-out; }
        .fest-pulse { animation: festPulse 1.8s infinite ease-in-out; }

        .cell-observances-inline {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          margin-top: 1px;
        }

        .inline-tag {
          font-size: 0.64rem;
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
          font-size: 0.65rem;
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
          .cal-cell { min-height: 60px; padding: 4px; }
          .cal-day-num { font-size: 0.82rem; }
          .cal-tamil-date { font-size: 0.58rem; }
          .inline-tag { font-size: 0.58rem; padding: 0 2px; }
          .anim-icon { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
}
