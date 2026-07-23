'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  Briefcase,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  Mail,
  ChevronRight,
  Plus,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface OverviewClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  stats: {
    applicationsCount: number
    interviewsCount: number
    offersCount: number
    responseRate: number
  }
  upcomingInterviews: Array<{
    id: string
    company: string
    role: string
    scheduledAt: string
    location: string | null
    type: string
  }>
  pipelineData: Array<{
    status: string
    count: number
    percentage: number
    color: string
  }>
  emailActivity: Array<{
    id: string
    company: string
    subject: string
    type: string
    receivedAt: string
  }>
  chartData: Array<{
    date: string
    applications: number
  }>
}

export function OverviewClient({
  user,
  stats,
  upcomingInterviews,
  pipelineData,
  emailActivity,
  chartData,
}: OverviewClientProps) {
  const [assistantOpen, setAssistantOpen] = useState(true)

  const getEmailTypeColor = (type: string) => {
    switch (type) {
      case 'INTERVIEW_INVITATION':
        return { bg: 'var(--color-info-subtle)', text: 'var(--color-info)' }
      case 'ASSESSMENT_INVITE':
        return { bg: 'var(--color-warning-subtle)', text: 'var(--color-warning)' }
      case 'REJECTION':
        return { bg: 'var(--color-danger-subtle)', text: 'var(--color-danger)' }
      case 'OFFER':
        return { bg: 'var(--color-success-subtle)', text: 'var(--color-success)' }
      default:
        return { bg: 'var(--color-muted)', text: 'var(--color-text-secondary)' }
    }
  }

  const getEmailTypeLabel = (type: string) => {
    return type.replace('_', ' ')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <Header user={user} />

        {/* Inner Content Padding */}
        <main
          style={{
            padding: 'var(--spacing-page-y) var(--spacing-page-x)',
            maxWidth: 'var(--content-max-width)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
          className="animate-fade-up"
        >
          {/* Welcome Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Good morning, {user.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Here's what's happening with your career today.
              </p>
            </div>
            <button
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                height: 38,
                padding: '0 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-primary-btn)',
              }}
            >
              <Plus size={16} />
              <span>Add Application</span>
            </button>
          </div>

          {/* Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {/* Card 1: Applications */}
            <div className="stat-card">
              <span className="stat-label">Applications</span>
              <div className="stat-value-row">
                <span className="stat-number">{stats.applicationsCount}</span>
              </div>
              <div className="stat-delta success">
                <TrendingUp size={12} />
                <span>+12% this month</span>
              </div>
            </div>

            {/* Card 2: Interviews */}
            <div className="stat-card">
              <span className="stat-label">Interviews</span>
              <div className="stat-value-row">
                <span className="stat-number">{stats.interviewsCount}</span>
              </div>
              <div className="stat-delta success">
                <TrendingUp size={12} />
                <span>+25% this month</span>
              </div>
            </div>

            {/* Card 3: Offers */}
            <div className="stat-card">
              <span className="stat-label">Offers</span>
              <div className="stat-value-row">
                <span className="stat-number" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {stats.offersCount}
                  <span style={{ fontSize: 16, color: 'var(--color-warning)' }}>★</span>
                </span>
              </div>
              <div className="stat-delta neutral">
                <Minus size={12} />
                <span>No change</span>
              </div>
            </div>

            {/* Card 4: Response Rate */}
            <div className="stat-card">
              <span className="stat-label">Response Rate</span>
              <div className="stat-value-row">
                <span className="stat-number">{stats.responseRate}%</span>
              </div>
              <div className="stat-delta success">
                <TrendingUp size={12} />
                <span>+8% this month</span>
              </div>
            </div>
          </div>

          {/* Two Column Dashboard Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
            {/* Left Main Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Upcoming Interviews */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Upcoming</h3>
                  <button className="icon-more-btn">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {upcomingInterviews.length > 0 ? (
                    upcomingInterviews.map((interview) => (
                      <div key={interview.id} className="list-item-row">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-primary-subtle)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {interview.company[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {interview.company}
                          </h4>
                          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                            {interview.role}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}{' '}
                            • {interview.location || 'Google Meet'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center', paddingTop: 48, paddingBottom: 48 }}>
                      No upcoming interviews.
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  <a href="#" className="card-footer-link">
                    <span>View all interviews</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>

              {/* Application Pipeline */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Application Pipeline</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pipelineData.map((item) => (
                    <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span
                        style={{
                          width: 80,
                          fontSize: 13,
                          color: 'var(--color-text-secondary)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.status.toLowerCase()}
                      </span>
                      <div style={{ flex: 1, height: 8, background: 'var(--color-muted)', borderRadius: 99 }}>
                        <div
                          style={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            background: item.color,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          width: 24,
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          textAlign: 'right',
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* AI Assistant Suggestions */}
              {assistantOpen && (
                <div className="content-card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={16} color="var(--color-primary)" />
                      <h3 style={{ fontSize: 14, fontWeight: 700 }}>AI Assistant</h3>
                    </div>
                    <span
                      style={{
                        background: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      BETA
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    Here's what I found for you:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                      />
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          You have 3 follow-ups due
                        </div>
                        <a
                          href="#"
                          style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            marginTop: 2,
                          }}
                        >
                          Review now <ChevronRight size={12} />
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                      />
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Prepare for Google interview
                        </div>
                        <a
                          href="#"
                          style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            marginTop: 2,
                          }}
                        >
                          View suggested questions <ChevronRight size={12} />
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        defaultChecked
                        style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                      />
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Update resume for Microsoft
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          Match score: 82%
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      height: 34,
                      background: 'var(--color-surface)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      marginTop: 10,
                    }}
                  >
                    Open Assistant
                  </button>
                </div>
              )}

              {/* Recent Email Activity */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Recent Email Activity</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {emailActivity.length > 0 ? (
                    emailActivity.map((email) => {
                      const badgeStyles = getEmailTypeColor(email.type)
                      return (
                        <div key={email.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-primary-subtle)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Mail size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-xs)',
                                  background: badgeStyles.bg,
                                  color: badgeStyles.text,
                                }}
                              >
                                {getEmailTypeLabel(email.type)}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                                {email.receivedAt}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginTop: 4,
                              }}
                            >
                              {email.company}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                              {email.subject}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                      No recent emails detected.
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  <a href="#" className="card-footer-link">
                    <span>View all emails</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Area Chart Panel */}
          <div className="content-card" style={{ padding: '24px 20px' }}>
            <div className="card-header" style={{ marginBottom: 20 }}>
              <h3>Analytics Overview</h3>
              <select
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                }}
              >
                <option>This month</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: 'var(--color-border)' }}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .stat-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          height: var(--height-stat-card);
          transition: box-shadow var(--duration-normal), transform var(--duration-normal);
        }
        .stat-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-1px);
        }
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        .stat-value-row {
          display: flex;
          align-items: baseline;
          margin-top: 4px;
        }
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary);
          font-feature-settings: "tnum";
        }
        .stat-delta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          margin-top: 6px;
        }
        .stat-delta.success {
          color: var(--color-success);
        }
        .stat-delta.neutral {
          color: var(--color-text-secondary);
        }

        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: var(--spacing-card-inner);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .icon-more-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
        }
        .icon-more-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }

        .list-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .list-item-row:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .card-footer {
          border-top: 1px solid var(--color-border-subtle);
          padding-top: 12px;
          margin-top: 4px;
        }
        .card-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-primary);
          transition: color var(--duration-fast);
        }
        .card-footer-link:hover {
          color: var(--color-primary-hover);
        }
      `}</style>
    </div>
  )
}
