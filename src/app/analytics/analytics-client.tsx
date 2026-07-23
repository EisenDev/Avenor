'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Briefcase
} from 'lucide-react'

interface AnalyticsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  stats: {
    totalApps: number
    appsDeltaStr: string
    isAppsDeltaPositive: boolean
    responseRate: number
    respDeltaStr: string
    isRespDeltaPositive: boolean
    interviewRate: number
    intDeltaStr: string
    isInterviewsDeltaPositive: boolean
    offerRate: number
    offDeltaStr: string
    isOffersDeltaPositive: boolean
    healthScore: number
    healthBreakdown: {
      activity: number
      responseRate: number
      interviewRate: number
      marketMatch: number
    }
    chartData: Array<{ name: string; apps: number }>
    sourceData: Array<{ name: string; value: number }>
    funnelData: Array<{ stage: string; count: number; width: string }>
  }
}

export function AnalyticsClient({ user, stats }: AnalyticsClientProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: user.name || 'Demo User', email: user.email || 'demo@avenor.app', image: user.image }} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Analytics</h1>
              <p className="page-subtitle">Understand and measure your career path metrics.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="select-input" defaultValue="Last 30 Days">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Health Score Overview */}
          <div className="content-card health-score-card">
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <div className="radial-score-container">
                <div className="radial-score-ring" style={{ background: `conic-gradient(var(--color-primary) ${stats.healthScore}%, var(--color-border) ${stats.healthScore}%)` }}>
                  <div className="radial-score-center">
                    <span className="score-number">{stats.healthScore}</span>
                    <span className="score-total">/100</span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="var(--color-primary)" />
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Career Health Score</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {stats.totalApps === 0 
                    ? "Welcome! Upload your resume and start tracking job applications to calculate your personalized Career Health Score."
                    : stats.healthScore >= 75 
                      ? "Your job search health is excellent! Your high resume matching score, consistent applications, and response rates put you ahead of the pack."
                      : stats.healthScore >= 50
                        ? "Your job search is on a solid path. Optimize your resume for target positions and apply to more openings to boost response and interview metrics."
                        : "Let's level up your search. Make sure to upload an updated resume, complete its Gemini audit, and ensure consistent application activity."
                  }
                </p>

                <div className="health-breakdown" style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                  <div>
                    <span className="breakdown-label">Application Activity</span>
                    <span className="breakdown-val">{stats.healthBreakdown.activity}%</span>
                  </div>
                  <div>
                    <span className="breakdown-label">Response Rate</span>
                    <span className="breakdown-val">{stats.healthBreakdown.responseRate}%</span>
                  </div>
                  <div>
                    <span className="breakdown-label">Interview Success</span>
                    <span className="breakdown-val">{stats.healthBreakdown.interviewRate}%</span>
                  </div>
                  <div>
                    <span className="breakdown-label">Market Match</span>
                    <span className="breakdown-val">{stats.healthBreakdown.marketMatch}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            {/* Applications Stat */}
            <div className="content-card stat-item">
              <span className="stat-label">Applications</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="stat-value">{stats.totalApps}</span>
                <span className={`stat-delta ${stats.isAppsDeltaPositive ? 'positive' : 'neutral'}`}>
                  {stats.isAppsDeltaPositive ? <TrendingUp size={12} /> : null}
                  <span>{stats.appsDeltaStr}</span>
                </span>
              </div>
            </div>

            {/* Response Rate Stat */}
            <div className="content-card stat-item">
              <span className="stat-label">Response Rate</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="stat-value">{stats.responseRate}%</span>
                <span className={`stat-delta ${stats.isRespDeltaPositive ? 'positive' : 'neutral'}`}>
                  {stats.isRespDeltaPositive ? <TrendingUp size={12} /> : null}
                  <span>{stats.respDeltaStr}</span>
                </span>
              </div>
            </div>

            {/* Interview Rate Stat */}
            <div className="content-card stat-item">
              <span className="stat-label">Interview Rate</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="stat-value">{stats.interviewRate}%</span>
                <span className={`stat-delta ${stats.isInterviewsDeltaPositive ? 'positive' : 'neutral'}`}>
                  {stats.isInterviewsDeltaPositive ? <TrendingUp size={12} /> : null}
                  <span>{stats.intDeltaStr}</span>
                </span>
              </div>
            </div>

            {/* Offer Rate Stat */}
            <div className="content-card stat-item">
              <span className="stat-label">Offer Rate</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="stat-value">{stats.offerRate}%</span>
                <span className={`stat-delta ${stats.isOffersDeltaPositive ? 'positive' : 'neutral'}`}>
                  {stats.isOffersDeltaPositive ? <TrendingUp size={12} /> : null}
                  <span>{stats.offDeltaStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="charts-grid">
            {/* Applications per month area chart */}
            <div className="content-card">
              <h3>Applications Per Month</h3>
              <div style={{ width: '100%', height: 200, marginTop: 16 }}>
                {stats.totalApps === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                    No applications logged in the last 6 months.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                      <XAxis dataKey="name" tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="apps" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Source performance bar chart */}
            <div className="content-card">
              <h3>Source Performance</h3>
              <div style={{ width: '100%', height: 200, marginTop: 16 }}>
                {stats.totalApps === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                    No applications sources available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {/* FIXED: left margin is set to 28px instead of -10px to prevent labels from being cropped */}
                    <BarChart data={stats.sourceData} layout="vertical" margin={{ top: 10, right: 10, left: 28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Funnel Graph */}
          <div className="content-card">
            <h3>Application Conversion Funnel</h3>
            {stats.totalApps === 0 ? (
              <div style={{ padding: '32px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                No conversion funnel data. Save or apply to a job to see your funnel steps here.
              </div>
            ) : (
              <div className="funnel-container" style={{ marginTop: 20 }}>
                {stats.funnelData.map((step, idx) => (
                  <div key={idx} className="funnel-row" style={{ width: step.width }}>
                    <span className="funnel-stage">{step.stage}</span>
                    <span className="funnel-count">{step.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .page-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 4px 0 0;
        }
        .select-input {
          height: 34px;
          padding: 0 10px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-primary);
          outline: none;
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 24px;
        }
        .content-card h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .health-score-card {
          border-left: 4px solid var(--color-primary);
        }
        .radial-score-container {
          width: 96px;
          height: 96px;
        }
        .radial-score-ring {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .radial-score-center {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--color-card);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .score-number {
          font-size: 28px;
          font-weight: 800;
          color: var(--color-text-primary);
        }
        .score-total {
          font-size: 13px;
          color: var(--color-text-secondary);
          align-self: flex-end;
          margin-bottom: 12px;
        }
        .breakdown-label {
          display: block;
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .breakdown-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
          display: block;
          margin-top: 2px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          padding: 16px 20px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .stat-delta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .stat-delta.positive {
          color: var(--color-success);
        }
        .stat-delta.neutral {
          color: var(--color-text-secondary);
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
        }
        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .funnel-row {
          background: var(--color-primary-subtle);
          border: 1px solid var(--color-primary-muted);
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
        }
        .funnel-stage {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-primary);
        }
        .funnel-count {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  )
}
