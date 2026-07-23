'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  RefreshCw,
  MapPin,
  ExternalLink,
  Info,
  X
} from 'lucide-react'

interface CalendarEvent {
  id: string
  applicationId: string
  type: 'interview' | 'timeline'
  title: string
  company: string
  role: string
  date: string // ISO string
}

interface CalendarClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  events: CalendarEvent[]
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarClient({ user, events }: CalendarClientProps) {
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate calendar grid days
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const daysInCurrentMonth = getDaysInMonth(year, month)
  const firstDayWeekday = getFirstDayOfMonth(year, month)

  // Get previous month padding days
  const prevMonthIndex = month === 0 ? 11 : month - 1
  const prevMonthYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex)

  const calendarDays = []

  // Fill prefix from previous month
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    calendarDays.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      date: new Date(prevMonthYear, prevMonthIndex, dayNum),
      isToday: false
    })
  }

  // Fill current month days
  const today = new Date()
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const cellDate = new Date(year, month, i)
    const isToday =
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear()

    calendarDays.push({
      dayNumber: i,
      isCurrentMonth: true,
      date: cellDate,
      isToday
    })
  }

  // Fill suffix from next month to make it standard 42 cell grid (6 rows)
  const totalCells = 42
  const remainingCells = totalCells - calendarDays.length
  const nextMonthIndex = month === 11 ? 0 : month + 1
  const nextMonthYear = month === 11 ? year + 1 : year
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      dayNumber: i,
      isCurrentMonth: false,
      date: new Date(nextMonthYear, nextMonthIndex, i),
      isToday: false
    })
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleGoToday = () => {
    setCurrentDate(new Date())
  }

  // Filter events for a specific cell date
  const getEventsForDate = (date: Date) => {
    return events.filter((evt) => {
      const evtDate = new Date(evt.date)
      return (
        evtDate.getDate() === date.getDate() &&
        evtDate.getMonth() === date.getMonth() &&
        evtDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Get color code for event types
  const getEventStyles = (type: 'interview' | 'timeline', title: string) => {
    const lowerTitle = title.toLowerCase()
    if (type === 'interview') {
      return { bg: 'var(--color-primary)', label: 'Interview' }
    }
    if (lowerTitle.includes('reject')) {
      return { bg: 'var(--color-danger)', label: 'Rejection' }
    }
    if (lowerTitle.includes('offer')) {
      return { bg: 'var(--color-success)', label: 'Offer' }
    }
    if (lowerTitle.includes('applied') || lowerTitle.includes('apply')) {
      return { bg: 'var(--color-info)', label: 'Applied' }
    }
    return { bg: 'var(--color-warning)', label: 'Event' }
  }

  // Sort upcoming events chronologically from today onward for sidebar
  const upcomingEvents = events
    .filter((evt) => new Date(evt.date) >= new Date(today.setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  // Find next upcoming interview for AI suggestion
  const nextInterview = events
    .filter((evt) => evt.type === 'interview' && new Date(evt.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: user.name || 'Demo User', email: user.email || 'demo@avenor.app', image: user.image }} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', gap: 24 }}>
          
          {/* Calendar Main Grid */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header toolbar */}
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h1 className="page-title">{MONTH_NAMES[month]} {year}</h1>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-nav-btn" onClick={handlePrevMonth} title="Previous month">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="icon-nav-btn" onClick={handleGoToday} title="Go to today" style={{ fontSize: 11, padding: '4px 8px', fontWeight: 600 }}>
                    Today
                  </button>
                  <button className="icon-nav-btn" onClick={handleNextMonth} title="Next month">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div className="tab-bar" style={{ padding: 3 }}>
                  <button className={`tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
                  <button className={`tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
                  <button className={`tab ${view === 'agenda' ? 'active' : ''}`} onClick={() => setView('agenda')}>Agenda</button>
                </div>
                <Link href="/interviews" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary">
                    <Plus size={16} />
                    <span>Schedule Interview</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Content Switcher */}
            {view === 'month' && (
              <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="calendar-weekdays">
                  {WEEKDAYS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((cell, idx) => {
                    const cellEvents = getEventsForDate(cell.date)
                    return (
                      <div
                        key={idx}
                        className={`calendar-cell ${cell.isToday ? 'today' : ''} ${!cell.isCurrentMonth ? 'empty' : ''}`}
                      >
                        <span className="day-number">{cell.dayNumber}</span>
                        <div className="cell-events">
                          {cellEvents.length > 3 ? (
                            <>
                              {cellEvents.slice(0, 2).map((evt) => {
                                const styles = getEventStyles(evt.type, evt.title)
                                return (
                                  <Link
                                    key={evt.id}
                                    href={`/applications/${evt.applicationId}`}
                                    className="event-pill"
                                    style={{ background: styles.bg }}
                                    title={`${evt.company} - ${evt.title}`}
                                  >
                                    {evt.company}: {evt.title}
                                  </Link>
                                )
                              })}
                              <button
                                type="button"
                                className="btn-more-events"
                                onClick={() => setSelectedDayEvents({ date: cell.date, events: cellEvents })}
                              >
                                + {cellEvents.length - 2} more...
                              </button>
                            </>
                          ) : (
                            cellEvents.map((evt) => {
                              const styles = getEventStyles(evt.type, evt.title)
                              return (
                                <Link
                                  key={evt.id}
                                  href={`/applications/${evt.applicationId}`}
                                  className="event-pill"
                                  style={{ background: styles.bg }}
                                  title={`${evt.company} - ${evt.title}`}
                                >
                                  {evt.company}: {evt.title}
                                </Link>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === 'week' && (
              <div className="content-card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700 }}>Weekly View</h3>
                <div className="week-grid">
                  {WEEKDAYS.map((dayName, idx) => {
                    // Calculate date for the current week starting from Sunday
                    const currentDayOfWeek = today.getDay()
                    const startOfWeek = new Date(today)
                    startOfWeek.setDate(today.getDate() - currentDayOfWeek + idx)
                    const cellEvents = getEventsForDate(startOfWeek)
                    const isToday =
                      startOfWeek.getDate() === today.getDate() &&
                      startOfWeek.getMonth() === today.getMonth() &&
                      startOfWeek.getFullYear() === today.getFullYear()

                    return (
                      <div key={idx} className={`week-col ${isToday ? 'today-col' : ''}`}>
                        <div className="week-col-header">
                          <span className="week-day-name">{dayName}</span>
                          <span className="week-day-num">{startOfWeek.getDate()}</span>
                        </div>
                        <div className="week-col-events">
                          {cellEvents.length === 0 ? (
                            <span className="no-events-text">No events</span>
                          ) : (
                            cellEvents.map((evt) => {
                              const styles = getEventStyles(evt.type, evt.title)
                              return (
                                <Link
                                  key={evt.id}
                                  href={`/applications/${evt.applicationId}`}
                                  className="week-event-card"
                                  style={{ borderLeftColor: styles.bg }}
                                >
                                  <div className="week-event-title">{evt.title}</div>
                                  <div className="week-event-meta">{evt.company}</div>
                                  <div className="week-event-time">
                                    {new Date(evt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                  </div>
                                </Link>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === 'agenda' && (
              <div className="content-card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700 }}>Comprehensive Agenda</h3>
                {events.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No interviews or timeline events scheduled.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...events]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((evt) => {
                        const styles = getEventStyles(evt.type, evt.title)
                        return (
                          <div key={evt.id} className="agenda-list-item" style={{ borderLeftColor: styles.bg }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{evt.title}</h4>
                                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                  {evt.company} — {evt.role}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>
                                  {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                  {new Date(evt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                              <Link href={`/applications/${evt.applicationId}`} className="btn-secondary" style={{ height: 26, fontSize: 11, padding: '0 8px', textDecoration: 'none', justifyContent: 'center' }}>
                                View Job Application
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Color coding legend */}
            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-dot" style={{ background: 'var(--color-primary)' }} />
                <span>Interviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-dot" style={{ background: 'var(--color-info)' }} />
                <span>Job Applications / Submissions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-dot" style={{ background: 'var(--color-success)' }} />
                <span>Job Offers Received</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-dot" style={{ background: 'var(--color-danger)' }} />
                <span>Rejections</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="legend-dot" style={{ background: 'var(--color-warning)' }} />
                <span>Other Events</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Scheduling Suggestion */}
            <div className="content-card ai-calendar-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                  AI Scheduler Suggestions
                </h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                {nextInterview ? (
                  <>
                    ✦ Best time to prepare for your upcoming <strong>{nextInterview.company}</strong> interview is 1-2 days before the scheduled date: <strong>{new Date(new Date(nextInterview.date).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>.
                  </>
                ) : (
                  'Schedule an upcoming interview to get smart preparation window suggestions!'
                )}
              </p>
            </div>

            {/* Upcoming Panel */}
            <div className="content-card">
              <h3>Upcoming Agenda</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {upcomingEvents.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '12px 0' }}>
                    No upcoming events.
                  </div>
                ) : (
                  upcomingEvents.map((evt) => {
                    const styles = getEventStyles(evt.type, evt.title)
                    return (
                      <Link
                        key={evt.id}
                        href={`/applications/${evt.applicationId}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="agenda-item" style={{ borderLeftColor: styles.bg }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }} className="agenda-title-link">{evt.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {evt.company} • {new Date(evt.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Day Events Table Modal */}
      {selectedDayEvents && (
        <div className="modal-backdrop" onClick={() => setSelectedDayEvents(null)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 550 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedDayEvents(null)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Events for {selectedDayEvents.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
              <p className="modal-subtitle">Scheduled interviews and pipeline milestones</p>
            </div>

            <div className="table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Event Details</th>
                    <th>Time</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayEvents.events.map((evt) => {
                    const styles = getEventStyles(evt.type, evt.title)
                    return (
                      <tr key={evt.id}>
                        <td><strong>{evt.company}</strong></td>
                        <td>{evt.role}</td>
                        <td>
                          <span className="type-badge" style={{ background: styles.bg + '1a', color: styles.bg, fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {evt.title}
                          </span>
                        </td>
                        <td>
                          {new Date(evt.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/applications/${evt.applicationId}`} style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary" style={{ height: 28, fontSize: 11, padding: '0 10px' }}>
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setSelectedDayEvents(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .icon-nav-btn {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          cursor: pointer;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
        }
        .icon-nav-btn:hover {
          background: var(--color-surface);
          color: var(--color-text-primary);
        }
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
        }
        .tab {
          padding: 5px 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          transition: all var(--duration-fast);
        }
        .tab.active {
          background: var(--color-card);
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 34px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-secondary {
          background: var(--color-card);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          height: 34px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 20px;
        }
        .content-card h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          text-align: center;
          padding: 10px 0;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: 96px;
        }
        .calendar-cell {
          border-right: 1px solid var(--color-border-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
          padding: 8px;
          position: relative;
          overflow: hidden;
        }
        .calendar-cell:nth-child(7n) {
          border-right: none;
        }
        .calendar-cell.today {
          background: var(--color-primary-subtle);
        }
        .calendar-cell.empty {
          background: var(--color-bg-primary);
          opacity: 0.5;
        }
        .day-number {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .calendar-cell.today .day-number {
          color: var(--color-primary);
          font-weight: 800;
        }
        .cell-events {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
          max-height: 70px;
          overflow-y: auto;
        }
        .event-pill {
          font-size: 9px;
          font-weight: 700;
          color: white !important;
          padding: 2px 4px;
          border-radius: var(--radius-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-decoration: none !important;
          display: block;
          transition: transform var(--duration-fast);
        }
        .event-pill:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .ai-calendar-card {
          border-left: 3px solid var(--color-primary);
        }
        .agenda-item {
          padding-left: 10px;
          border-left: 3px solid var(--color-border-strong);
          transition: transform var(--duration-fast);
        }
        .agenda-item:hover {
          transform: translateX(2px);
        }
        .agenda-title-link:hover {
          color: var(--color-primary);
        }
        
        /* Week View Styles */
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          min-height: 400px;
        }
        .week-col {
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .week-col.today-col {
          border-color: var(--color-primary);
          background: var(--color-card);
          box-shadow: var(--shadow-sm);
        }
        .week-col-header {
          padding: 10px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .week-col.today-col .week-col-header {
          background: var(--color-primary-subtle);
        }
        .week-day-name {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
        }
        .week-day-num {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-text-primary);
        }
        .week-col.today-col .week-day-num {
          color: var(--color-primary);
        }
        .week-col-events {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .no-events-text {
          font-size: 10px;
          color: var(--color-text-disabled);
          text-align: center;
          margin-top: 16px;
          font-style: italic;
        }
        .week-event-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-left-width: 3px;
          border-radius: var(--radius-md);
          padding: 8px;
          text-decoration: none !important;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: transform var(--duration-fast);
        }
        .week-event-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-xs);
        }
        .week-event-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .week-event-meta {
          font-size: 9px;
          color: var(--color-text-secondary);
        }
        .week-event-time {
          font-size: 9px;
          font-weight: 600;
          color: var(--color-primary);
          margin-top: 2px;
        }
        
        /* Agenda View Styles */
        .agenda-list-item {
          background: var(--color-surface);
          border: 1px solid var(--color-border-subtle);
          border-left-width: 4px;
          border-radius: var(--radius-lg);
          padding: 16px;
          transition: transform var(--duration-fast);
        }
        .agenda-list-item:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        .btn-more-events {
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          padding: 2px 4px;
          text-align: left;
          width: fit-content;
          transition: color var(--duration-fast);
        }
        .btn-more-events:hover {
          color: var(--color-primary-hover);
          text-decoration: underline;
        }
        .table-wrapper {
          overflow-x: auto;
          margin-top: 16px;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
        }
        .events-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          text-align: left;
        }
        .events-table th {
          background: var(--color-surface);
          color: var(--color-text-secondary);
          padding: 10px 12px;
          font-weight: 700;
          border-bottom: 1px solid var(--color-border-subtle);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .events-table td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
        }
        .events-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Modal Backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(48, 46, 43, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        /* Modal Wrapper */
        .modal-content-wrapper {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 600px;
          padding: 32px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          transition: all var(--duration-fast);
        }
        
        .modal-close-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        
        .modal-header {
          margin-bottom: 24px;
        }
        
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }
        
        .modal-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 4px 0 0;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  )
}
