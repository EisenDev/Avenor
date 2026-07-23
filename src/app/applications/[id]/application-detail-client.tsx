'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  updateApplicationAction,
  createTimelineEventAction,
  uploadApplicationLogoAction,
  uploadApplicationDocumentAction
} from '@/lib/actions/application'
import {
  ChevronLeft,
  Calendar,
  FileText,
  Sparkles,
  ExternalLink,
  Mail,
  FileDown,
  Clock,
  MapPin,
  X,
  Plus,
  Edit2,
  Trash2,
  FileCheck,
  Play
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

interface TimelineEvent {
  id: string
  title: string
  description: string | null
  date: string
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
  recruiterName: string | null
  recruiterEmail: string | null
  recruiterPhone: string | null
  interviewLink: string | null
  resumeName: string | null
  coverLetterName: string | null
  logoUrl: string | null
  resumePath: string | null
  coverLetterPath: string | null
  timelineEvents: TimelineEvent[]
}

interface ApplicationDetailClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  application: Application
}

export function ApplicationDetailClient({ user, application }: ApplicationDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes'>('overview')
  const [showPhone, setShowPhone] = useState(false)
  const [interviewType, setInterviewType] = useState('TECHNICAL')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Dynamic values
  const [logoUrl, setLogoUrl] = useState(application.logoUrl || '')
  const [resumeName, setResumeName] = useState(application.resumeName || '')
  const [coverLetterName, setCoverLetterName] = useState(application.coverLetterName || '')

  // Edit form states
  const [company, setCompany] = useState(application.company)
  const [role, setRole] = useState(application.role)
  const [status, setStatus] = useState(application.status)
  const [location, setLocation] = useState(application.location || '')
  const [url, setUrl] = useState(application.url || '')
  const [salary, setSalary] = useState(application.salary ? String(application.salary) : '')
  const [notes, setNotes] = useState(application.notes || '')
  const [appliedAt, setAppliedAt] = useState(application.appliedAt ? application.appliedAt.split('T')[0] : '')
  
  // Recruiter States
  const [recruiterName, setRecruiterName] = useState(application.recruiterName || '')
  const [recruiterEmail, setRecruiterEmail] = useState(application.recruiterEmail || '')
  const [recruiterPhone, setRecruiterPhone] = useState(application.recruiterPhone || '')
  const [interviewLink, setInterviewLink] = useState(application.interviewLink || '')

  // Timeline form states
  const [eventTitle, setEventTitle] = useState('Phone Screen Completed')
  const [customTitle, setCustomTitle] = useState('')
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0])
  const [eventDesc, setEventDesc] = useState('')

  const stageInfo = STAGE_MAP[application.status] || { label: 'Applied', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' }

  // Check if both recruiter email and interview link are empty
  const isMissingDetails = !application.recruiterEmail && !application.interviewLink

  // Generate URL safe username slug
  const userSlug = (user.name || 'User')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')

  // Format salary range
  const formatSalary = (salary: number | null) => {
    if (!salary) return 'Flexible / Not Specified'
    return `$${(salary).toLocaleString()}`
  }

  // Handle edit form submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', application.id)
      formData.append('company', company)
      formData.append('role', role)
      formData.append('status', status)
      formData.append('location', location)
      formData.append('url', url)
      formData.append('salary', salary)
      formData.append('notes', notes)
      formData.append('appliedAt', appliedAt)
      formData.append('recruiterName', recruiterName)
      formData.append('recruiterEmail', recruiterEmail)
      formData.append('recruiterPhone', recruiterPhone)
      formData.append('interviewLink', interviewLink)
      formData.append('resumeName', resumeName)
      formData.append('coverLetterName', coverLetterName)

      const res = await updateApplicationAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        setIsEditModalOpen(false)
      }
    })
  }

  // Handle timeline event submit
  const handleTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    const finalTitle = eventTitle === 'Custom' ? customTitle.trim() : eventTitle
    if (!finalTitle) {
      setModalError('Event title is required')
      return
    }

    const t = finalTitle.toLowerCase()
    const isInterview =
      t.includes('interview') ||
      t.includes('screen') ||
      t.includes('onsite') ||
      t.includes('scheduled') ||
      t.includes('call')

    if (isInterview) {
      // Mapped interview type for preset dropdown
      let mappedType = 'TECHNICAL'
      if (t.includes('phone') || t.includes('call')) {
        mappedType = 'PHONE'
      } else if (t.includes('hr')) {
        mappedType = 'HR'
      } else if (t.includes('behavioral')) {
        mappedType = 'BEHAVIORAL'
      } else if (t.includes('system')) {
        mappedType = 'SYSTEM_DESIGN'
      } else if (t.includes('onsite')) {
        mappedType = 'ONSITE'
      } else if (t.includes('final')) {
        mappedType = 'FINAL'
      } else if (t.includes('technical')) {
        mappedType = 'TECHNICAL'
      } else {
        mappedType = 'CUSTOM'
      }

      // Hide active dialog
      setIsTimelineModalOpen(false)
      const queryParams = new URLSearchParams({
        action: 'schedule',
        appId: application.id,
        type: mappedType,
        customType: mappedType === 'CUSTOM' ? finalTitle : '',
        scheduledAt: eventDate || '',
        notes: eventDesc || '',
      })
      router.push(`/interviews?${queryParams.toString()}`)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('applicationId', application.id)
      formData.append('title', finalTitle)
      formData.append('date', eventDate)
      formData.append('description', eventDesc)

      const res = await createTimelineEventAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        setEventDesc('')
        setCustomTitle('')
        setIsTimelineModalOpen(false)
      }
    })
  }

  // Handle click to upload logo
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file logo upload change
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('applicationId', application.id)
    formData.append('logo', file)

    startTransition(async () => {
      const res = await uploadApplicationLogoAction(formData)
      if (res.success) {
        setLogoUrl(res.data.logoUrl)
      } else {
        alert(res.error || 'Failed to upload company logo')
      }
    })
  }

  // Handle document upload
  const handleDocumentUpload = async (type: 'resume' | 'coverletter', file: File) => {
    const formData = new FormData()
    formData.append('applicationId', application.id)
    formData.append('documentType', type)
    formData.append('file', file)

    startTransition(async () => {
      const res = await uploadApplicationDocumentAction(formData)
      if (res.success) {
        if (type === 'resume' && res.data?.resumeName) {
          setResumeName(res.data.resumeName)
        } else if (type === 'coverletter' && res.data?.coverLetterName) {
          setCoverLetterName(res.data.coverLetterName)
        }
      } else {
        alert(res.error || 'Failed to upload document file')
      }
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={user} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/applications" className="btn-ghost" style={{ padding: '4px 8px', height: 'auto' }}>
                <ChevronLeft size={16} />
                <span>Back to Applications</span>
              </Link>
            </div>

            {/* Application Overview Header Card */}
            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div
                    className="avatar-square-lg clickable-avatar animate-fade-in"
                    onClick={handleAvatarClick}
                    title="Click to upload company logo"
                    style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                    ) : (
                      application.company[0]
                    )}
                    <div className="avatar-overlay">
                      <span>Upload</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        {application.company}
                      </h1>
                      <span className="status-pill" style={{ background: stageInfo.bg, color: stageInfo.color }}>
                        {stageInfo.label}
                      </span>
                      <span className="priority-badge">
                        <span className="priority-dot" />
                        Priority Task
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      {application.role} • {application.location || 'Flexible / Remote'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    {isMissingDetails ? 'Add Details' : 'Edit'}
                  </button>
                  
                  {/* Interview Link Button */}
                  {application.interviewLink ? (
                    <a href={application.interviewLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={14} />
                      <span>Interview Link</span>
                    </a>
                  ) : (
                    <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)}>
                      <span>Add Interview Link</span>
                    </button>
                  )}

                  {/* Email Recruiter Button */}
                  {application.recruiterEmail ? (
                    <a href={`mailto:${application.recruiterEmail}`} className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} />
                      <span>Email Recruiter</span>
                    </a>
                  ) : (
                    <button className="btn-primary" onClick={() => setIsEditModalOpen(true)}>
                      <Plus size={14} />
                      <span>Add Recruiter Email</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="tab-row" style={{ marginTop: 24, borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: 24 }}>
                <button
                  className={`tab-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab-link ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline
                </button>
                <button
                  className={`tab-link ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Details Grid */}
                <div className="details-grid">
                  <div className="content-card">
                    <h3>Position Details</h3>
                    <div className="details-list" style={{ marginTop: 12 }}>
                      <div className="details-item">
                        <span className="details-label">Salary Range</span>
                        <span className="details-value">{formatSalary(application.salary)}</span>
                      </div>
                      <div className="details-item">
                        <span className="details-label">Applied Date</span>
                        <span className="details-value">
                          {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <div className="details-item">
                        <span className="details-label">Job Location</span>
                        <span className="details-value">{application.location || 'Remote / Flexible'}</span>
                      </div>
                      {application.url && (
                        <div className="details-item">
                          <span className="details-label">Job Posting</span>
                          <a href={application.url} target="_blank" rel="noreferrer" className="link-action">
                            <span>View Listing</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="content-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3>Timeline Overview</h3>
                      <button className="btn-secondary" style={{ height: 26, padding: '0 8px', fontSize: 11 }} onClick={() => setIsTimelineModalOpen(true)}>
                        <Plus size={12} />
                        <span>Add Event</span>
                      </button>
                    </div>
                    
                    <div className="timeline">
                      {application.timelineEvents.length > 0 ? (
                        application.timelineEvents.map((evt, idx) => (
                          <div key={evt.id} className={`timeline-item ${idx === 0 ? 'active' : 'done'}`}>
                            <div className="timeline-dot" />
                            <div className="timeline-content">
                              <span className="timeline-title">{evt.title}</span>
                              <span className="timeline-date">
                                {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                          No timeline events added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Guidelines / Notes */}
                <div className="content-card">
                  <h3>Notes & Details</h3>
                  <div className="jd-text" style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {application.notes ? (
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{application.notes}</p>
                    ) : (
                      <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-disabled)' }}>
                        No description details or interview guidelines have been added for this application. Click &ldquo;Add Details&rdquo; above to append details.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'timeline' ? (
              <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Full Activity History</h3>
                  <button className="btn-secondary" style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={() => setIsTimelineModalOpen(true)}>
                    <Plus size={14} />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="timeline">
                  {application.timelineEvents.map((evt) => (
                    <div key={evt.id} className="timeline-item done">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="timeline-title">{evt.title}</span>
                        {evt.description && <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{evt.description}</p>}
                        <span className="timeline-date" style={{ marginTop: 4, display: 'block' }}>
                          {new Date(evt.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3>Notes</h3>
                <textarea
                  className="note-textarea"
                  placeholder="Write a new note..."
                  style={{
                    width: '100%',
                    height: 100,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    padding: 12,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary">Save Note</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Interviewer */}
            <div className="content-card ai-insight-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                  Avenor AI Interviewer
                </h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '8px 0 12px 0', lineHeight: 1.5 }}>
                Practice simulated Technical, HR, or mixed voice interviews tailored to this specific job description and your resume.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Interview Type</label>
                  <select 
                    id="ai-interview-type-select"
                    value={interviewType} 
                    onChange={(e) => setInterviewType(e.target.value)}
                    style={{ height: 32, padding: '0 8px', fontSize: 12, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', outline: 'none' }}
                  >
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="HR">HR Interview</option>
                    <option value="BOTH">Technical & HR (Both)</option>
                  </select>
                </div>
                
                <Link href={`/applications/${application.id}/ai-interview?type=${interviewType}`} style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', height: 34, fontSize: 12, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <Play size={12} />
                    <span>Start Mock Interview</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Recruiter Contact Card */}
            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3>Recruiter Contact</h3>
                <button className="btn-secondary" style={{ height: 24, padding: '0 6px', fontSize: 10 }} onClick={() => setIsEditModalOpen(true)}>Edit</button>
              </div>
              
              {application.recruiterName || application.recruiterEmail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{application.recruiterName || 'Unnamed Recruiter'}</div>
                    {application.recruiterEmail && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{application.recruiterEmail}</div>}
                  </div>
                  {application.recruiterPhone && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Phone:{' '}
                      {showPhone ? application.recruiterPhone : (
                        <button onClick={() => setShowPhone(true)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', cursor: 'pointer', fontSize: 12 }}>
                          Reveal number
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--color-text-disabled)' }}>
                  Recruiter details not linked. Click &ldquo;Edit&rdquo; to add.
                </div>
              )}
            </div>

            {/* Documents Used Card */}
            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3>Documents Used</h3>
                <button className="btn-secondary" style={{ height: 24, padding: '0 6px', fontSize: 10 }} onClick={() => setIsEditModalOpen(true)}>Edit</button>
              </div>
              
              {resumeName || coverLetterName ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {resumeName && (
                    <a
                      href={`/applications/${application.id}/${userSlug}-resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}
                      className="doc-link-item"
                    >
                      <FileText size={16} color="var(--color-primary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }} className="doc-title">{resumeName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Resume • PDF (click to view)</div>
                      </div>
                    </a>
                  )}
                  {coverLetterName && (
                    <a
                      href={`/applications/${application.id}/${userSlug}-cover-letter.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}
                      className="doc-link-item"
                    >
                      <FileText size={16} color="var(--color-text-secondary)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }} className="doc-title">{coverLetterName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Cover Letter • PDF (click to view)</div>
                      </div>
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--color-text-disabled)' }}>
                  No files linked. Click &ldquo;Edit&rdquo; to set documents used.
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Edit Details Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Edit Application Details</h2>
              <p className="modal-subtitle">Update recruitment metadata and contacts</p>
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
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
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
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="number"
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
                  <label className="form-label">Recruiter Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Priya Mehta"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recruiter Email</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="recruiter@company.com"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Recruiter Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={recruiterPhone}
                    onChange={(e) => setRecruiterPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Link</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://meet.google.com/..."
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Resume Used</label>
                  {resumeName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                      <FileText size={14} color="var(--color-primary)" />
                      <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeName}</span>
                      <button type="button" className="btn-secondary" style={{ height: 24, padding: '0 6px', fontSize: 10 }} onClick={() => resumeInputRef.current?.click()}>Replace</button>
                    </div>
                  ) : (
                    <button type="button" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => resumeInputRef.current?.click()}>
                      <Plus size={14} />
                      <span>Upload Resume (PDF)</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('resume', file)
                    }}
                    style={{ display: 'none' }}
                    accept="application/pdf"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Letter Used</label>
                  {coverLetterName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                      <FileText size={14} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coverLetterName}</span>
                      <button type="button" className="btn-secondary" style={{ height: 24, padding: '0 6px', fontSize: 10 }} onClick={() => coverLetterInputRef.current?.click()}>Replace</button>
                    </div>
                  ) : (
                    <button type="button" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => coverLetterInputRef.current?.click()}>
                      <Plus size={14} />
                      <span>Upload Cover Letter (PDF)</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={coverLetterInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('coverletter', file)
                    }}
                    style={{ display: 'none' }}
                    accept="application/pdf"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Posting URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Details</label>
                <textarea
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Timeline Event Modal */}
      {isTimelineModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTimelineModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsTimelineModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Add Timeline Event</h2>
              <p className="modal-subtitle">Log updates to your interview path history</p>
            </div>

            {modalError && (
              <div className="modal-error-banner">
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleTimelineSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Stage *</label>
                <select
                  className="form-input"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Phone Screen Scheduled">Phone Screen Scheduled</option>
                  <option value="Phone Screen Completed">Phone Screen Completed</option>
                  <option value="Technical Interview Scheduled">Technical Interview Scheduled</option>
                  <option value="Technical Interview Completed">Technical Interview Completed</option>
                  <option value="Onsite Round Scheduled">Onsite Round Scheduled</option>
                  <option value="Onsite Completed">Onsite Completed</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Follow-up Sent">Follow-up Sent</option>
                  <option value="Custom">Custom Event...</option>
                </select>
              </div>

              {eventTitle === 'Custom' && (
                <div className="form-group animate-slide-up" style={{ animationDuration: '0.2s' }}>
                  <label className="form-label">Custom Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panel Panel Case Presentation"
                    className="form-input"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  placeholder="e.g. Spoke with Priya. Talked about system design prep."
                  className="form-textarea"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsTimelineModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .avatar-square-lg {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }
        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--duration-fast);
        }
        .clickable-avatar:hover .avatar-overlay {
          opacity: 1;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
        }
        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 600;
        }
        .priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
        }
        .btn-ghost {
          background: transparent;
          color: var(--color-text-secondary);
          border: none;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background var(--duration-fast), color var(--duration-fast);
        }
        .btn-ghost:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 34px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
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
          height: 34px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background var(--duration-fast);
        }
        .btn-secondary:hover {
          background: var(--color-surface);
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
        .tab-link {
          background: none;
          border: none;
          padding: 8px 4px 12px 4px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color var(--duration-fast), border-color var(--duration-fast);
        }
        .tab-link:hover {
          color: var(--color-text-primary);
        }
        .tab-link.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 600;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .details-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .details-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .details-label {
          color: var(--color-text-secondary);
        }
        .details-value {
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .link-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }
        .link-action:hover {
          text-decoration: underline;
        }
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          padding-left: 16px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 4px;
          bottom: 4px;
          width: 1px;
          background: var(--color-border);
        }
        .timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .timeline-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--color-border-strong);
          position: absolute;
          left: -16px;
          top: 5px;
          border: 2px solid var(--color-card);
        }
        .timeline-item.done .timeline-dot {
          background: var(--color-success);
        }
        .timeline-item.active .timeline-dot {
          background: var(--color-primary);
        }
        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .timeline-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .timeline-date {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .ai-insight-card {
          border-left: 3px solid var(--color-primary);
        }
        
        .doc-link-item {
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          transition: background var(--duration-fast), border-color var(--duration-fast);
        }
        .doc-link-item:hover {
          background: var(--color-surface);
          border-color: var(--color-primary);
        }
        .doc-link-item:hover .doc-title {
          color: var(--color-primary);
          text-decoration: underline;
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
        .animate-fade-in {
          animation: fadeIn var(--duration-normal) var(--ease-out);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
