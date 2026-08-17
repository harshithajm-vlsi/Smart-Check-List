import React from 'react';
import { getTamilDateDetails, getUpcomingFestivals, getHolidayStatus } from '../utils/tamilCalendarUtils';

export default function TamilDashboardWidget({ onOpenFullCalendar }) {
  const now = new Date();
  const tamilDetails = getTamilDateDetails(now);
  const upcoming = getUpcomingFestivals(tamilDetails.isoDate, 2);
  const holidayStatus = getHolidayStatus(now);

  const nextFest = upcoming[0];

  return (
    <div className="tamil-dashboard-card glass-card animate-fadeIn">
      {/* Header Banner */}
      <div className="tamil-widget-header">
        <div className="header-title-box">
          <span className="calendar-icon">🗓️</span>
          <div>
            <h3>தமிழ் நாட்காட்டி</h3>
            <span className="subtitle">Tamil Panchangam & Festival Hub</span>
          </div>
        </div>
        <button 
          className="btn btn-ghost btn-sm view-all-btn"
          onClick={onOpenFullCalendar}
        >
          Full Calendar →
        </button>
      </div>

      {/* Main Grid: Panchangam + Festival Countdown */}
      <div className="tamil-widget-content">
        {/* Panchangam Hero Box */}
        <div className="panchangam-hero-box">
          <div className="hero-top">
            <span className="hero-label">தமிழ் தேதி</span>
            <h2 className="hero-tamil-date">
              {tamilDetails.tamilMonth.ta} {tamilDetails.tamilDateNum}
            </h2>
            <span className="hero-year-tag">
              {tamilDetails.tamilYear.ta} ({tamilDetails.tamilYear.en}) · {tamilDetails.weekday.ta}
            </span>
          </div>

          <div className="panchangam-pills-row">
            <div className="panchangam-pill">
              <span className="pill-icon">✨</span>
              <div>
                <span className="pill-label">நட்சத்திரம்</span>
                <span className="pill-val">{tamilDetails.nakshatra.ta} ({tamilDetails.nakshatra.en})</span>
              </div>
            </div>

            <div className="panchangam-pill warning">
              <span className="pill-icon">⏳</span>
              <div>
                <span className="pill-label">ராகு காலம்</span>
                <span className="pill-val">{tamilDetails.timings.rahu}</span>
              </div>
            </div>

            <div className="panchangam-pill success">
              <span className="pill-icon">⭐</span>
              <div>
                <span className="pill-label">நல்ல நேரம்</span>
                <span className="pill-val">{tamilDetails.timings.nallaMorning}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Festival & Holiday Status Box */}
        <div className="festival-status-box">
          {/* Upcoming Festival Countdown */}
          {nextFest && (
            <div className="upcoming-fest-card">
              <div className="fest-header">
                <span className="fest-icon">{nextFest.icon}</span>
                <div className="fest-titles">
                  <span className="fest-cat">🎉 UPCOMING FESTIVAL</span>
                  <h4 className="fest-name">{nextFest.titleTa || nextFest.title}</h4>
                </div>
                <div className="countdown-pill">
                  {nextFest.daysLeft === 0 ? (
                    <span className="today-badge">TODAY! 🎉</span>
                  ) : (
                    <span className="days-badge">In {nextFest.daysLeft} Day{nextFest.daysLeft > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <p className="fest-desc">{nextFest.desc}</p>
            </div>
          )}

          {/* Today & Tomorrow Holiday Status */}
          <div className="holiday-status-row">
            <div className={`status-box ${holidayStatus.today.isHoliday ? 'holiday' : 'work'}`}>
              <span className="status-title">TODAY:</span>
              <span className="status-val">{holidayStatus.today.icon} {holidayStatus.today.title}</span>
            </div>

            <div className={`status-box ${holidayStatus.tomorrow.isHoliday ? 'holiday' : 'work'}`}>
              <span className="status-title">TOMORROW:</span>
              <span className="status-val">{holidayStatus.tomorrow.icon} {holidayStatus.tomorrow.title}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tamil-dashboard-card {
          padding: 20px 24px;
          border-radius: 20px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .tamil-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .header-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .calendar-icon {
          font-size: 1.8rem;
        }

        .header-title-box h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .header-title-box .subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .view-all-btn {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .tamil-widget-content {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
        }

        .panchangam-hero-box {
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.08);
          border: 1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.2);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-top {
          margin-bottom: 12px;
        }

        .hero-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-tamil-date {
          font-size: 1.7rem;
          font-weight: 900;
          color: var(--text-primary);
          margin: 4px 0;
        }

        .hero-year-tag {
          font-size: 0.82rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .panchangam-pills-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .panchangam-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-surface);
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
        }

        .panchangam-pill .pill-icon {
          font-size: 1.1rem;
        }

        .panchangam-pill .pill-label {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .panchangam-pill .pill-val {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .festival-status-box {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
        }

        .upcoming-fest-card {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .fest-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .fest-icon {
          font-size: 1.6rem;
        }

        .fest-titles {
          flex: 1;
        }

        .fest-cat {
          font-size: 0.68rem;
          font-weight: 800;
          color: #D97706;
          letter-spacing: 0.05em;
        }

        .fest-name {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 2px 0 0;
        }

        .countdown-pill {
          font-size: 0.75rem;
          font-weight: 800;
          background: #F59E0B;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .fest-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 4px 0 0;
          line-height: 1.35;
        }

        .holiday-status-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .status-box {
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .status-box.work {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
        }

        .status-box.holiday {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #059669;
        }

        .status-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .status-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (max-width: 850px) {
          .tamil-widget-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
