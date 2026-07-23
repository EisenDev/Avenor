'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { createApplicationAction } from '@/lib/actions/application'
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Table as TableIcon,
  Plus,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink,
  Filter,
  X,
  Sparkles,
  DollarSign
} from 'lucide-react'

// Map database enum to UI labels
const STAGE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  WISHLIST: { label: 'Wishlist', color: 'var(--color-text-secondary)', bg: 'var(--color-muted)' },
  APPLIED: { label: 'Applied', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' },
  SCREENING: { label: 'Phone Screen', color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  INTERVIEWING: { label: 'Interview', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
  OFFER: { label: 'Offer', color: 'var(--color-success)', bg: 'var(--color-success-subtle)' },
  ACCEPTED: { label: 'Accepted', color: 'var(--color-success)', bg: 'var(--color-success-subtle)' },
  REJECTED: { label: 'Rejected', color: 'var(--color-danger)', bg: 'var(--color-danger-subtle)' },
  GHOSTED: { label: 'Ghosted', color: '#B0ABA4', bg: 'var(--color-muted)' },
  WITHDRAWN: { label: 'Withdrawn', color: '#B0ABA4', bg: 'var(--color-muted)' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'High', color: 'var(--color-danger)', bg: 'var(--color-danger-subtle)' },
  MEDIUM: { label: 'Medium', color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  LOW: { label: 'Low', color: 'var(--color-text-secondary)', bg: 'var(--color-hover-bg)' },
}

interface Application {
  id: string
  company: string
  role: string
  status: string
  location: string | null
  url: string | null
  salary: number | null
  notes: string | null
  appliedAt: string | null
  logoUrl: string | null
  priority: string
}

interface ApplicationsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  initialApplications: Application[]
}

export function ApplicationsClient({ user, initialApplications }: ApplicationsClientProps) {
  const router = useRouter()
  const [view, setView] = useState<'table' | 'kanban' | 'list'>('table')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [modalError, setModalError] = useState<string | null>(null)

  // Form states
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('APPLIED')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')
  const [salary, setSalary] = useState('')
  const [notes, setNotes] = useState('')
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().split('T')[0])
  const [priority, setPriority] = useState('MEDIUM')

  const stages = ['All', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected']

  // Format salary
  const formatSalaryRange = (salary: number | null) => {
    if (!salary) return '—'
    return `$${(salary / 1000).toFixed(0)}k`
  }

  // Filter application list
  const filteredApps = initialApplications.filter((app) => {
    const stageDetails = STAGE_MAP[app.status] || { label: 'Applied' }
    const matchesStage = stageFilter === 'All' || stageDetails.label === stageFilter
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStage && matchesSearch
  })

  // Submit new application handler
  const handleAddApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!company || !role) {
      setModalError('Company name and role title are required')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('company', company)
      formData.append('role', role)
      formData.append('status', status)
      formData.append('location', location)
      formData.append('url', url)
      formData.append('salary', salary)
      formData.append('notes', notes)
      formData.append('appliedAt', appliedAt)
      formData.append('priority', priority)

      const res = await createApplicationAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        // Reset states
        setCompany('')
        setRole('')
        setStatus('APPLIED')
        setLocation('')
        setUrl('')
        setSalary('')
        setNotes('')
        setAppliedAt(new Date().toISOString().split('T')[0])
        setPriority('MEDIUM')
        setIsAddModalOpen(false)
        
        // Redirect to new application details page so they can finish filling it
        if (res.data?.id) {
          router.push(`/applications/${res.data.id}`)
        }
      }
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={user} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Applications</h1>
              <p className="page-subtitle">Track and manage your active job applications.</p>
            </div>
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              <span>Add Application</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="controls-bar">
            {/* View Switcher */}
            <div className="tab-bar">
              <button
                className={`tab ${view === 'table' ? 'active' : ''}`}
                onClick={() => setView('table')}
              >
                <TableIcon size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>Table</span>
              </button>
              <button
                className={`tab ${view === 'kanban' ? 'active' : ''}`}
                onClick={() => setView('kanban')}
              >
                <LayoutGrid size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>Kanban</span>
              </button>
              <button
                className={`tab ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                <List size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>List</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="filter-bar">
              {stages.map((stage) => (
                <button
                  key={stage}
                  className={`filter-chip ${stageFilter === stage ? 'active' : ''}`}
                  onClick={() => setStageFilter(stage)}
                >
                  {stage}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <div className="search-input-wrap">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search company or role..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-secondary">
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Main Views */}
          {filteredApps.length === 0 ? (
            <div className="content-card empty-state">
              <div className="empty-state-icon">
                <Briefcase size={24} />
              </div>
              <h3 className="empty-state-title">No applications found</h3>
              <p className="empty-state-desc">Try modifying your filter or add a new application to get started.</p>
            </div>
          ) : view === 'table' ? (
            <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-header">
                <span style={{ width: 48 }} />
                <span>Company</span>
                <span>Role</span>
                <span>Priority</span>
                <span>Stage</span>
                <span>Salary</span>
                <span>Applied Date</span>
                <span>Location</span>
                <span style={{ width: 48 }} />
              </div>
              <div>
                {filteredApps.map((app) => {
                  const stageInfo = STAGE_MAP[app.status] || { label: 'Applied', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' }
                  const priorityInfo = PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM
                  return (
                    <Link key={app.id} href={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                      <div className="table-row">
                        <div className="avatar-square">
                          {app.logoUrl ? (
                            <img src={app.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} alt="" />
                          ) : (
                            app.company[0]
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{app.company}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{app.role}</span>
                        <div>
                          <span className="status-pill" style={{ background: priorityInfo.bg, color: priorityInfo.color }}>
                            {priorityInfo.label}
                          </span>
                        </div>
                        <div>
                          <span className="status-pill" style={{ background: stageInfo.bg, color: stageInfo.color }}>
                            <span className="pulse-dot" style={{ background: stageInfo.color }} />
                            {stageInfo.label}
                          </span>
                        </div>
                        <span style={{ color: 'var(--color-text-primary)', fontFeatureSettings: '"tnum"' }}>
                          {formatSalaryRange(app.salary)}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{app.location || '—'}</span>
                        <div className="actions-cell">
                          <ChevronRight size={16} color="var(--color-text-disabled)" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : view === 'kanban' ? (
            <div className="kanban-grid">
              {['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'].map((stageName) => {
                const stageApps = filteredApps.filter((app) => {
                  const mapped = STAGE_MAP[app.status] || { label: 'Applied' }
                  return mapped.label === stageName
                })
                return (
                  <div key={stageName} className="kanban-column">
                    <div className="kanban-column-header">
                      <span>{stageName}</span>
                      <span className="kanban-count">{stageApps.length}</span>
                    </div>
                    <div className="kanban-cards">
                      {stageApps.map((app) => (
                        <Link key={app.id} href={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                          <div className="kanban-card">
                            <div className="kanban-card-top">
                              <div className="avatar-square-sm">
                                {app.logoUrl ? (
                                  <img src={app.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} alt="" />
                                ) : (
                                  app.company[0]
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <h4 className="kanban-company-name">{app.company}</h4>
                                  <span className="kanban-priority-dot" style={{ background: (PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM).color }} title={`${(PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM).label} Priority`} />
                                </div>
                                <p className="kanban-role">{app.role}</p>
                              </div>
                            </div>
                            <div className="kanban-card-details">
                              <span className="kanban-salary">{formatSalaryRange(app.salary)}</span>
                              {app.location && <span className="kanban-source-badge">{app.location.split(' ')[0]}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {stageApps.length === 0 && <div className="kanban-empty">No items</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredApps.map((app) => {
                const stageInfo = STAGE_MAP[app.status] || { label: 'Applied', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' }
                return (
                  <Link key={app.id} href={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                    <div className="content-card list-item-card">
                      <div className="avatar-square">
                        {app.logoUrl ? (
                          <img src={app.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} alt="" />
                        ) : (
                          app.company[0]
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 className="list-item-title">{app.company}</h3>
                          <span className="status-pill" style={{ background: stageInfo.bg, color: stageInfo.color }}>
                            {stageInfo.label}
                          </span>
                          <span className="status-pill" style={{ background: (PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM).bg, color: (PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM).color, fontSize: '10px', padding: '2px 6px' }}>
                            {(PRIORITY_MAP[app.priority] || PRIORITY_MAP.MEDIUM).label}
                          </span>
                        </div>
                        <p className="list-item-subtitle">{app.role} • {app.location || 'Flexible'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatSalaryRange(app.salary)}</div>
                        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Quick Timeline Stats at Bottom */}
          <div className="content-card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h3>Application Timeline & Stage Summary</h3>
            </div>
            <div className="summary-stats-grid">
              <div className="summary-stat-box">
                <span className="stat-label">Total Applications</span>
                <span className="stat-number">{initialApplications.length}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Interviews Scheduled</span>
                <span className="stat-number" style={{ color: 'var(--color-primary)' }}>
                  {initialApplications.filter(a => a.status === 'INTERVIEWING').length}
                </span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Active Offers</span>
                <span className="stat-number" style={{ color: 'var(--color-success)' }}>
                  {initialApplications.filter(a => a.status === 'OFFER' || a.status === 'ACCEPTED').length}
                </span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Conversion Rate</span>
                <span className="stat-number">
                  {initialApplications.length > 0
                    ? `${Math.round((initialApplications.filter(a => ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED'].includes(a.status)).length / initialApplications.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
              <X size={16} />
            </button>

            {/* Modal Heading */}
            <div className="modal-header">
              <h2 className="modal-title">Add Job Application</h2>
              <p className="modal-subtitle">Track new career targets in Avenor</p>
            </div>

            {modalError && (
              <div className="modal-error-banner">
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleAddApplicationSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Product Engineer"
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Status Stage</label>
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="WISHLIST">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Phone Screen</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="GHOSTED">Ghosted</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA (Hybrid)"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Annual Salary (USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    className="form-input"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Applied Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={appliedAt}
                    onChange={(e) => setAppliedAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Job Posting URL</label>
                  <input
                    type="text"
                    placeholder="https://careers.company.com/..."
                    className="form-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Guidelines</label>
                <textarea
                  placeholder="Paste details, keywords, key contacts..."
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Adding...' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 36px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-primary-btn);
          transition: background var(--duration-fast);
        }
        .btn-primary:hover {
          background: var(--color-primary-hover);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--color-card);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          height: 36px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background var(--duration-fast);
        }
        .btn-secondary:hover {
          background: var(--color-surface);
        }
        .controls-bar {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--color-surface);
          padding: 4px;
          border-radius: var(--radius-lg);
        }
        .tab {
          padding: 6px 14px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          transition: all var(--duration-fast);
          display: flex;
          align-items: center;
        }
        .tab.active {
          background: var(--color-card);
          color: var(--color-text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-xs);
        }
        .filter-bar {
          display: flex;
          gap: 6px;
        }
        .filter-chip {
          padding: 6px 12px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .filter-chip:hover {
          border-color: var(--color-border-strong);
          color: var(--color-text-primary);
        }
        .filter-chip.active {
          background: var(--color-primary-subtle);
          border-color: var(--color-primary);
          color: var(--color-primary);
          font-weight: 600;
        }
        .search-input-wrap {
          position: relative;
        }
        .search-input {
          height: 36px;
          padding: 0 12px 0 36px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-family: var(--font-sans);
          color: var(--color-text-primary);
          outline: none;
          width: 220px;
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }
        .search-input:focus {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-focus);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 24px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-header h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .table-header {
          display: grid;
          grid-template-columns: 48px 120px 1fr 100px 140px 100px 120px 150px 48px;
          align-items: center;
          padding: 12px 16px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .table-row {
          display: grid;
          grid-template-columns: 48px 120px 1fr 100px 140px 100px 120px 150px 48px;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border-subtle);
          font-size: 13px;
          transition: background var(--duration-fast);
        }
        .table-row:hover {
          background: var(--color-hover-bg);
        }
        .avatar-square {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .actions-cell {
          display: flex;
          justify-content: flex-end;
        }
        .kanban-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          align-items: start;
        }
        .kanban-column {
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid var(--color-border-subtle);
        }
        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
          padding: 0 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .kanban-count {
          background: rgba(0, 0, 0, 0.05);
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .kanban-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 300px;
        }
        .kanban-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 12px;
          box-shadow: var(--shadow-xs);
          transition: transform var(--duration-fast), box-shadow var(--duration-fast);
        }
        .kanban-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .kanban-card-top {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .avatar-square-sm {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
        }
        .kanban-company-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .kanban-role {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin: 1px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .kanban-card-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          border-top: 1px solid var(--color-border-subtle);
          padding-top: 8px;
        }
        .kanban-salary {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .kanban-source-badge {
          font-size: 10px;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .kanban-empty {
          font-size: 11px;
          color: var(--color-text-disabled);
          text-align: center;
          padding: 16px 0;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg);
        }
        .list-item-card {
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform var(--duration-fast), box-shadow var(--duration-fast);
        }
        .list-item-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .list-item-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .list-item-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 2px 0 0;
        }
        .summary-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .summary-stat-box {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          gap: 12px;
          text-align: center;
        }
        .empty-state-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-xl);
          background: var(--color-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
        }
        .empty-state-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .empty-state-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          max-width: 300px;
          margin: 0;
          line-height: 1.5;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(30, 20, 15, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content-wrapper {
          position: relative;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 600px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
        }
        .modal-close-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .modal-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .modal-subtitle {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 0;
        }
        .modal-error-banner {
          background: var(--color-danger-subtle);
          border: 1px solid rgba(224, 122, 122, 0.2);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          font-size: 12px;
          color: var(--color-danger);
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .form-input {
          height: 38px;
          padding: 0 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }
        .form-input:focus {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-focus);
        }
        .form-textarea {
          min-height: 80px;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          resize: vertical;
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }
        .form-textarea:focus {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-focus);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid var(--color-border-subtle);
          padding-top: 16px;
          margin-top: 8px;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up var(--duration-normal) var(--ease-out);
        }
      `}</style>
    </div>
  )
}
