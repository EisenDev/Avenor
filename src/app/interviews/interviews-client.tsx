'use client'

import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  CheckSquare,
  Sparkles,
  Plus,
  Play,
  Edit2,
  Trash2,
  X,
  Minus
} from 'lucide-react'
import {
  createInterviewAction,
  updateInterviewAction,
  updateInterviewChecklistAction,
  deleteInterviewAction
} from '@/lib/actions/interview'

interface Interview {
  id: string
  applicationId: string
  type: string
  customType: string | null
  scheduledAt: string
  location: string | null
  notes: string | null
  interviewer: string | null
  link: string | null
  checklist: string | null // JSON string of checklist items
  application: {
    company: string
    role: string
  }
}

interface Application {
  id: string
  company: string
  role: string
}

interface InterviewsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  initialInterviews: Interview[]
  applications: Application[]
}

const INTERVIEW_TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PHONE: { label: 'Phone Call', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' },
  TECHNICAL: { label: 'Technical Interview', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
  BEHAVIORAL: { label: 'Behavioral Interview', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
  SYSTEM_DESIGN: { label: 'System Design', color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  HR: { label: 'HR Screening', color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  FINAL: { label: 'Final Round', color: 'var(--color-success)', bg: 'var(--color-success-subtle)' },
  ONSITE: { label: 'Onsite Interview', color: 'var(--color-success)', bg: 'var(--color-success-subtle)' },
  CUSTOM: { label: 'Interview', color: 'var(--color-text-secondary)', bg: 'var(--color-border-subtle)' },
}

const DEFAULT_PREP_QS = [
  'Why are you looking to join our company?',
  'Walk me through a complex technical problem you solved.',
  'Describe a conflict you had with a team member and how you resolved it.',
  'How do you handle deadlines and project tradeoffs?'
]

export function InterviewsClient({ user, initialInterviews, applications }: InterviewsClientProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [isPending, startTransition] = useTransition()
  const [modalError, setModalError] = useState<string | null>(null)

  // Scheduling state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [appId, setAppId] = useState('')
  const [type, setType] = useState('TECHNICAL')
  const [customType, setCustomType] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [location, setLocation] = useState('')
  const [interviewer, setInterviewer] = useState('')
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; done: boolean }[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'schedule') {
      const qAppId = searchParams.get('appId') || ''
      const qType = searchParams.get('type') || 'TECHNICAL'
      const qCustomType = searchParams.get('customType') || ''
      const qScheduledAt = searchParams.get('scheduledAt') || ''
      const qNotes = searchParams.get('notes') || ''

      setAppId(qAppId)
      setType(qType)
      setCustomType(qCustomType)
      setScheduledAt(qScheduledAt)
      setNotes(qNotes)
      setChecklistItems([])
      setModalError(null)
      setIsAddModalOpen(true)

      // Replace URL to clean query parameters
      router.replace('/interviews')
    }
  }, [searchParams, router])

  // Editing state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editId, setEditId] = useState('')
  const [editAppId, setEditAppId] = useState('')
  const [editType, setEditType] = useState('TECHNICAL')
  const [editCustomType, setEditCustomType] = useState('')
  const [editScheduledAt, setEditScheduledAt] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editInterviewer, setEditInterviewer] = useState('')
  const [editLink, setEditLink] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editChecklistItems, setEditChecklistItems] = useState<{ id: string; text: string; done: boolean }[]>([])
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)

  const getLocalDateString = (isoString: string) => {
    try {
      const d = new Date(isoString)
      // Format as YYYY-MM-DDThh:mm
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch {
      return ''
    }
  }

  // Add Item to creation checklist
  const handleAddCreateChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: Date.now().toString(), text: '', done: false }])
  }

  const handleUpdateCreateChecklistItemText = (id: string, text: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, text } : item))
  }

  const handleRemoveCreateChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  // Add Item to editing checklist
  const handleAddEditChecklistItem = () => {
    setEditChecklistItems([...editChecklistItems, { id: Date.now().toString(), text: '', done: false }])
  }

  const handleUpdateEditChecklistItemText = (id: string, text: string) => {
    setEditChecklistItems(editChecklistItems.map(item => item.id === id ? { ...item, text } : item))
  }

  const handleRemoveEditChecklistItem = (id: string) => {
    setEditChecklistItems(editChecklistItems.filter(item => item.id !== id))
  }

  // Handle schedule submit
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!appId || !scheduledAt) {
      setModalError('Application and date/time are required.')
      return
    }

    if (type === 'CUSTOM' && !customType.trim()) {
      setModalError('Please specify the custom interview type.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('applicationId', appId)
      formData.append('type', type)
      formData.append('customType', type === 'CUSTOM' ? customType : '')
      formData.append('scheduledAt', scheduledAt)
      formData.append('location', location)
      formData.append('interviewer', interviewer)
      formData.append('link', link)
      formData.append('notes', notes)

      // Filter empty items
      const finalChecklist = checklistItems.filter(item => item.text.trim() !== '')
      formData.append('checklist', finalChecklist.length > 0 ? JSON.stringify(finalChecklist) : '')

      const res = await createInterviewAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        // Reset states
        setAppId('')
        setType('TECHNICAL')
        setCustomType('')
        setScheduledAt('')
        setLocation('')
        setInterviewer('')
        setLink('')
        setNotes('')
        setChecklistItems([])
        setIsAddModalOpen(false)
      }
    })
  }

  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!editScheduledAt) {
      setModalError('Schedule date and time are required.')
      return
    }

    if (editType === 'CUSTOM' && !editCustomType.trim()) {
      setModalError('Please specify the custom interview type.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', editId)
      formData.append('type', editType)
      formData.append('customType', editType === 'CUSTOM' ? editCustomType : '')
      formData.append('scheduledAt', editScheduledAt)
      formData.append('location', editLocation)
      formData.append('interviewer', editInterviewer)
      formData.append('link', editLink)
      formData.append('notes', editNotes)

      // Filter empty items
      const finalChecklist = editChecklistItems.filter(item => item.text.trim() !== '')
      formData.append('checklist', finalChecklist.length > 0 ? JSON.stringify(finalChecklist) : '')

      const res = await updateInterviewAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        setIsEditModalOpen(false)
      }
    })
  }

  // Open Edit Modal
  const openEditModal = (interview: Interview) => {
    setEditId(interview.id)
    setEditAppId(interview.applicationId)
    setEditType(interview.type)
    setEditCustomType(interview.customType || '')
    setEditScheduledAt(getLocalDateString(interview.scheduledAt))
    setEditLocation(interview.location || '')
    setEditInterviewer(interview.interviewer || '')
    setEditLink(interview.link || '')
    setEditNotes(interview.notes || '')

    let parsedTasks: { id: string; text: string; done: boolean }[] = []
    try {
      parsedTasks = interview.checklist ? JSON.parse(interview.checklist) : []
    } catch {
      parsedTasks = []
    }
    setEditChecklistItems(parsedTasks)
    setIsDeleteConfirming(false)
    setModalError(null)
    setIsEditModalOpen(true)
  }

  // Trigger delete interview
  const handleDeleteInterview = (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled interview?')) return
    startTransition(async () => {
      const res = await deleteInterviewAction(id)
      if (!res.success) {
        alert(res.error)
      } else {
        setIsEditModalOpen(false)
      }
    })
  }

  // Toggle preparation checklist task item
  const handleToggleChecklistTask = (interview: Interview, taskId: string) => {
    let list: { id: string; text: string; done: boolean }[] = []
    try {
      list = interview.checklist ? JSON.parse(interview.checklist) : []
    } catch {
      list = []
    }

    const updated = list.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    )

    startTransition(async () => {
      await updateInterviewChecklistAction(interview.id, JSON.stringify(updated))
    })
  }

  // Determine upcoming vs past
  const now = new Date()
  const sortedInterviews = [...initialInterviews].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  )

  const upcomingInterviews = sortedInterviews.filter((item) => new Date(item.scheduledAt) >= now)
  const pastInterviews = sortedInterviews.filter((item) => new Date(item.scheduledAt) < now)

  const displayInterviews =
    activeTab === 'upcoming' ? upcomingInterviews : activeTab === 'past' ? pastInterviews : sortedInterviews

  // Find next upcoming interview for AI prep suggestions
  const nextInterview = upcomingInterviews[0] || null
  const totalCompleted = pastInterviews.length
  // Simple pass rate calculation
  const passRate = totalCompleted > 0 ? Math.round((pastInterviews.filter(i => (i.notes || '').toLowerCase().includes('pass') || (i.notes || '').toLowerCase().includes('offer')).length / totalCompleted) * 100) : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: user.name || 'Demo User', email: user.email || 'demo@avenor.app', image: user.image }} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Interviews</h1>
                <p className="page-subtitle">Schedule, prepare, and track outcomes for your interviews.</p>
              </div>
              <button className="btn-primary" onClick={() => { setModalError(null); setChecklistItems([]); setIsAddModalOpen(true); }}>
                <Plus size={16} />
                <span>Schedule Interview</span>
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="stat-pill-box">
                <span className="stat-label">Upcoming</span>
                <span className="stat-value">{upcomingInterviews.length} Scheduled</span>
              </div>
              <div className="stat-pill-box">
                <span className="stat-label">Total Completed</span>
                <span className="stat-value">{totalCompleted} Interviews</span>
              </div>
              <div className="stat-pill-box">
                <span className="stat-label">Pass Rate</span>
                <span className="stat-value" style={{ color: 'var(--color-success)' }}>
                  {totalCompleted > 0 ? `${passRate}%` : '—'}
                </span>
              </div>
            </div>

            {/* Tab Controller */}
            <div className="tab-bar">
              <button
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past
              </button>
              <button
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            </div>

            {/* Content Lists */}
            {displayInterviews.length === 0 ? (
              <div className="content-card empty-state">
                <div className="empty-state-icon">
                  <CalendarIcon size={24} />
                </div>
                <h3 className="empty-state-title">No interviews found</h3>
                <p className="empty-state-desc">Get started by clicking 'Schedule Interview' above.</p>
              </div>
            ) : (
              <div className="interview-grid">
                {displayInterviews.map((item) => {
                  const typeInfo = INTERVIEW_TYPE_MAP[item.type] || INTERVIEW_TYPE_MAP.TECHNICAL
                  const typeLabel = item.type === 'CUSTOM' ? (item.customType || 'Interview') : typeInfo.label

                  let tasks: { id: string; text: string; done: boolean }[] = []
                  try {
                    tasks = item.checklist ? JSON.parse(item.checklist) : []
                  } catch {
                    tasks = []
                  }

                  return (
                    <div key={item.id} className="content-card interview-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                            {typeLabel}
                          </span>
                          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 2px 0' }}>{item.application.company}</h3>
                          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>{item.application.role}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            className="btn-edit-action"
                            title="Edit details"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <div className="avatar-square">{item.application.company[0]}</div>
                        </div>
                      </div>

                      <div className="card-divider" />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          <Clock size={14} color="var(--color-text-secondary)" />
                          <span>
                            {new Date(item.scheduledAt).toLocaleString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          <MapPin size={14} />
                          <span>{item.location || 'Online Meet'} {item.interviewer ? `(with ${item.interviewer})` : ''}</span>
                        </div>
                      </div>

                      {tasks.length > 0 && (
                        <>
                          <div className="card-divider" />
                          <div>
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CheckSquare size={13} />
                              Preparation Checklist
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {tasks.map((task) => (
                                <label key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: task.done ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => handleToggleChecklistTask(item, task.id)}
                                    style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                                  />
                                  <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                                    {task.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {item.notes && (
                        <>
                          <div className="card-divider" />
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            <strong>Notes:</strong> {item.notes}
                          </div>
                        </>
                      )}

                      <div className="card-divider" />

                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {item.link ? (
                          <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, textDecoration: 'none', height: 32, fontSize: 12, justifyContent: 'center' }}>
                            Join Meeting
                          </a>
                        ) : (
                          <button className="btn-secondary" style={{ flex: 1, height: 32, fontSize: 12, justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                            No Meeting Link
                          </button>
                        )}
                        <Link href={`/applications/${item.applicationId}`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button className="btn-secondary" style={{ width: '100%', height: 32, fontSize: 12, justifyContent: 'center' }}>
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - AI Prep Panel */}
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="content-card ai-prep-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                  AI Interview Prep
                </h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '12px 0 0 0', lineHeight: 1.5 }}>
                Select an upcoming interview from your list and click <strong>"View Details"</strong> to open the application panel and launch your personalized Avenor AI Interviewer session.
              </p>
            </div>
          </div>

        </main>
      </div>

      {/* Schedule Interview Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Schedule Interview</h2>
              <p className="modal-subtitle">Log a new scheduled interview slot in Avenor</p>
            </div>

            {modalError && (
              <div className="modal-error-banner">
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Job Application *</label>
                  <select
                    required
                    className="form-input"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                  >
                    <option value="">Select an application...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company} — {app.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Type</label>
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="HR">HR Screening</option>
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="BEHAVIORAL">Behavioral Interview</option>
                    <option value="SYSTEM_DESIGN">System Design</option>
                    <option value="ONSITE">Onsite Interview</option>
                    <option value="FINAL">Final Round</option>
                    <option value="CUSTOM">Custom Type...</option>
                  </select>
                </div>
              </div>

              {type === 'CUSTOM' && (
                <div className="form-group">
                  <label className="form-label">Custom Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panel Presentation, Live Coding, Assessment Review"
                    className="form-input"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Mehta"
                    className="form-input"
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    className="form-input"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location/Method</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Meet, Zoom, Onsite office"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pre-interview Notes</label>
                <textarea
                  placeholder="Notes, areas to study, details about interviewer..."
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Checklist Builder */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label">Preparation Checklist</label>
                  <button
                    type="button"
                    className="btn-add-checklist"
                    onClick={handleAddCreateChecklistItem}
                  >
                    <Plus size={12} />
                    <span>Add Task</span>
                  </button>
                </div>
                {checklistItems.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0' }}>
                    No checklist tasks added yet. Add tasks that you want to complete before this interview.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {checklistItems.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          required
                          placeholder={`Task #${idx + 1}`}
                          className="form-input"
                          style={{ flex: 1 }}
                          value={item.text}
                          onChange={(e) => handleUpdateCreateChecklistItemText(item.id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-remove-task"
                          onClick={() => handleRemoveCreateChecklistItem(item.id)}
                          title="Remove task"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="btn-primary"
                  disabled={isPending}
                >
                  {isPending ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Interview Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Edit Interview Details</h2>
              <p className="modal-subtitle">Modify interview details and preparation notes</p>
            </div>

            {modalError && (
              <div className="modal-error-banner">
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Interview Type</label>
                  <select
                    className="form-input"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="HR">HR Screening</option>
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="BEHAVIORAL">Behavioral Interview</option>
                    <option value="SYSTEM_DESIGN">System Design</option>
                    <option value="ONSITE">Onsite Interview</option>
                    <option value="FINAL">Final Round</option>
                    <option value="CUSTOM">Custom Type...</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={editScheduledAt}
                    onChange={(e) => setEditScheduledAt(e.target.value)}
                  />
                </div>
              </div>

              {editType === 'CUSTOM' && (
                <div className="form-group">
                  <label className="form-label">Custom Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panel Presentation, Live Coding, Assessment Review"
                    className="form-input"
                    value={editCustomType}
                    onChange={(e) => setEditCustomType(e.target.value)}
                  />
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Mehta"
                    className="form-input"
                    value={editInterviewer}
                    onChange={(e) => setEditInterviewer(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    className="form-input"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location/Method</label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet, Zoom, Onsite office"
                  className="form-input"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pre-interview Notes</label>
                <textarea
                  placeholder="Notes, areas to study, details about interviewer..."
                  className="form-textarea"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              {/* Edit Checklist Builder */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label">Preparation Checklist</label>
                  <button
                    type="button"
                    className="btn-add-checklist"
                    onClick={handleAddEditChecklistItem}
                  >
                    <Plus size={12} />
                    <span>Add Task</span>
                  </button>
                </div>
                {editChecklistItems.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0' }}>
                    No checklist tasks added yet. Add tasks that you want to complete before this interview.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {editChecklistItems.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={(e) => setEditChecklistItems(editChecklistItems.map(t => t.id === item.id ? { ...t, done: e.target.checked } : t))}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Task #${idx + 1}`}
                          className="form-input"
                          style={{ flex: 1 }}
                          value={item.text}
                          onChange={(e) => handleUpdateEditChecklistItemText(item.id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-remove-task"
                          onClick={() => handleRemoveEditChecklistItem(item.id)}
                          title="Remove task"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isDeleteConfirming ? (
                <div className="delete-confirm-box">
                  <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--color-danger)', fontWeight: 600 }}>
                    Are you sure you want to delete this scheduled interview? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const res = await deleteInterviewAction(editId)
                          if (!res.success) {
                            setModalError(res.error)
                            setIsDeleteConfirming(false)
                          } else {
                            setIsDeleteConfirming(false)
                            setIsEditModalOpen(false)
                          }
                        })
                      }}
                    >
                      {isPending ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsDeleteConfirming(false)}
                      style={{ height: 36 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    className="btn-danger-link"
                    onClick={() => setIsDeleteConfirming(true)}
                    disabled={isPending}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--color-danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Interview</span>
                  </button>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isPending}
                    >
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
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
        .btn-edit-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-card);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .btn-edit-action:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .stat-pill-box {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 140px;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--color-surface);
          padding: 4px;
          border-radius: var(--radius-lg);
          width: fit-content;
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
        }
        .tab.active {
          background: var(--color-card);
          color: var(--color-text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-xs);
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 24px;
        }
        .interview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .interview-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .type-badge {
          display: inline-flex;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .avatar-square {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
        }
        .card-divider {
          height: 1px;
          background: var(--color-border-subtle);
        }
        .ai-prep-card {
          border-left: 3px solid var(--color-primary);
        }
        .prep-q-list {
          margin: 0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 12px;
          color: var(--color-text-secondary);
          line-height: 1.4;
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
        
        .modal-error-banner {
          background: var(--color-danger-subtle);
          color: var(--color-danger);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          margin-bottom: 20px;
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
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        
        .form-input {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          height: 38px;
          padding: 0 12px;
          font-size: 13px;
          color: var(--color-text-primary);
          transition: border-color var(--duration-fast);
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .form-textarea {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          min-height: 100px;
          padding: 12px;
          font-size: 13px;
          color: var(--color-text-primary);
          resize: vertical;
          font-family: inherit;
          transition: border-color var(--duration-fast);
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .btn-add-checklist {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          height: 24px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background var(--duration-fast);
        }
        
        .btn-add-checklist:hover {
          background: var(--color-hover-bg);
        }
        
        .btn-remove-task {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 38px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-danger);
          cursor: pointer;
          transition: background var(--duration-fast);
        }
        
        .btn-remove-task:hover {
          background: var(--color-danger-subtle);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }
        
        .delete-confirm-box {
          background: var(--color-danger-subtle);
          border: 1px solid var(--color-danger);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-top: 12px;
        }
        
        .btn-danger {
          background: var(--color-danger);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 36px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--duration-fast);
        }
        
        .btn-danger:hover {
          background: #dc2626;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
          border: 1px dashed var(--color-border);
        }
        .empty-state-icon {
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }
        .empty-state-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .empty-state-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 6px 0 0;
        }
      `}</style>
    </div>
  )
}
