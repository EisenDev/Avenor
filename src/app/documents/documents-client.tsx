'use client'

import { useState, useTransition, useEffect } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Folder,
  Link as LinkIcon,
  X,
  Loader2,
  AlertTriangle,
  Check
} from 'lucide-react'
import {
  uploadDocumentAction,
  toggleDocumentActiveAction,
  deleteDocumentAction,
  analyzeDocumentAction
} from '@/lib/actions/document'

interface Application {
  id: string
  company: string
  role: string
}

interface DocumentItem {
  id: string
  name: string
  description?: string | null
  path: string
  fileSize?: string | null
  fileType: string
  active: boolean
  aiScore?: string | null
  aiFeedback?: string | null
  applicationId?: string | null
  createdAt: Date
  application?: {
    company: string
    role: string
  } | null
}

interface DocumentsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  documents: DocumentItem[]
  applications: Application[]
}

export function DocumentsClient({ user, documents, applications }: DocumentsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'resumes' | 'cover'>('resumes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Real-time document list state
  const [localDocuments, setLocalDocuments] = useState<DocumentItem[]>(documents)

  // Sync state if documents prop changes (e.g. from server component revalidation)
  useEffect(() => {
    setLocalDocuments(documents)
  }, [documents])

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<'resume' | 'coverletter' | 'other'>('resume')
  const [description, setDescription] = useState('')
  const [linkedAppId, setLinkedAppId] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

  // Analyzing documents tracking
  const [analyzingDocs, setAnalyzingDocs] = useState<Record<string, boolean>>({})
  // Selected document for detailed analysis modal
  const [selectedAnalysisDoc, setSelectedAnalysisDoc] = useState<DocumentItem | null>(null)

  // Background analysis trigger function
  const triggerAnalysis = async (docId: string) => {
    if (analyzingDocs[docId]) return
    setAnalyzingDocs((prev) => ({ ...prev, [docId]: true }))
    try {
      const res = await analyzeDocumentAction(docId)
      if (res.success) {
        // Real-time update: store analysis score and feedback in state immediately!
        setLocalDocuments((prev) =>
          prev.map((doc) => (doc.id === docId ? res.data : doc))
        )
      } else {
        console.error(`Failed to analyze doc ${docId}:`, res.error)
      }
    } catch (err) {
      console.error(`Error analyzing doc ${docId}:`, err)
    } finally {
      setAnalyzingDocs((prev) => {
        const copy = { ...prev }
        delete copy[docId]
        return copy
      })
    }
  }

  // Automatically trigger analysis for documents without score
  useEffect(() => {
    localDocuments.forEach((doc) => {
      if (!doc.aiScore && !analyzingDocs[doc.id]) {
        triggerAnalysis(doc.id)
      }
    })
  }, [localDocuments])

  // Find active resume for the AI feedback panel
  const activeResume = localDocuments.find((doc) => doc.fileType === 'resume' && doc.active)
  // Fallback to first resume with an AI score if no resume is marked active
  const feedbackDoc = activeResume || localDocuments.find((doc) => doc.fileType === 'resume' && doc.aiScore)

  let feedbackSuggestions: string[] = []
  if (feedbackDoc?.aiFeedback) {
    try {
      const parsed = JSON.parse(feedbackDoc.aiFeedback)
      if (Array.isArray(parsed)) {
        feedbackSuggestions = parsed
      } else if (parsed && typeof parsed === 'object') {
        feedbackSuggestions = parsed.improve || []
      }
    } catch {
      feedbackSuggestions = []
    }
  }

  // Filter documents based on tab and search query
  const filteredDocs = localDocuments.filter((doc) => {
    // Tab filter
    if (activeTab === 'resumes' && doc.fileType !== 'resume') return false
    if (activeTab === 'cover' && doc.fileType !== 'coverletter') return false

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const nameMatch = doc.name.toLowerCase().includes(q)
      const descMatch = doc.description?.toLowerCase().includes(q)
      const compMatch = doc.application?.company?.toLowerCase().includes(q)
      const roleMatch = doc.application?.role?.toLowerCase().includes(q)
      return nameMatch || descMatch || compMatch || roleMatch
    }

    return true
  })

  // Group filtered documents by folders (Applications)
  const folderGroups: Record<string, { folderName: string; appId: string; items: DocumentItem[] }> = {}

  filteredDocs.forEach((doc) => {
    const key = doc.applicationId || 'general'
    if (!folderGroups[key]) {
      const folderName = doc.application
        ? `${doc.application.company} - ${doc.application.role}`
        : 'General Documents'
      folderGroups[key] = {
        folderName,
        appId: key,
        items: []
      }
    }
    folderGroups[key].items.push(doc)
  })

  const foldersList = Object.values(folderGroups)

  // Filter documents to display based on selected folder
  const displayDocs = selectedFolderId
    ? filteredDocs.filter((doc) => (doc.applicationId || 'general') === selectedFolderId)
    : filteredDocs

  // Handlers
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!file) {
      setModalError('Please choose a file to upload.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', fileType)
      formData.append('description', description)
      if (linkedAppId) {
        formData.append('applicationId', linkedAppId)
      }

      const res = await uploadDocumentAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        const newDoc = res.data
        // Real-time update: prepend the new document to the list immediately!
        setLocalDocuments((prev) => [newDoc, ...prev])

        // Reset and close
        setFile(null)
        setFileType('resume')
        setDescription('')
        setLinkedAppId('')
        setIsUploadModalOpen(false)
        setSelectedFolderId(null) // Reset selection to show the newly added file
        
        // Instantly trigger analysis in the background
        triggerAnalysis(newDoc.id)
      }
    })
  }

  const handleToggleActive = (id: string) => {
    // Optimistic toggle active status
    setLocalDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          return { ...doc, active: !doc.active }
        }
        if (doc.fileType === 'resume' && doc.id !== id) {
          return { ...doc, active: false }
        }
        return doc
      })
    )

    startTransition(async () => {
      const res = await toggleDocumentActiveAction(id)
      if (!res.success) {
        alert(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    // Optimistic delete
    setLocalDocuments((prev) => prev.filter((doc) => doc.id !== id))

    startTransition(async () => {
      const res = await deleteDocumentAction(id)
      if (!res.success) {
        alert(res.error)
      }
    })
  }

  const handleTabChange = (tab: 'all' | 'resumes' | 'cover') => {
    setActiveTab(tab)
    setSelectedFolderId(null)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setSelectedFolderId(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: user.name || 'Demo User', email: user.email || 'demo@avenor.app', image: user.image }} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Main Document Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Documents</h1>
                <p className="page-subtitle">Manage resumes, cover letters, and offer contracts.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setModalError(null)
                    setIsUploadModalOpen(true)
                  }}
                >
                  <Upload size={16} />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Tab view filters */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="tab-bar">
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>All Docs</button>
                <button className={`tab ${activeTab === 'resumes' ? 'active' : ''}`} onClick={() => handleTabChange('resumes')}>Resumes</button>
                <button className={`tab ${activeTab === 'cover' ? 'active' : ''}`} onClick={() => handleTabChange('cover')}>Cover Letters</button>
              </div>

              <div className="search-input-wrap" style={{ marginLeft: 'auto' }}>
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="content-card empty-state">
                <FileText size={48} className="empty-state-icon" />
                <p className="empty-state-title">No documents found</p>
                <p className="empty-state-desc">Upload your resumes or cover letters to get started and receive AI score audits.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* 1. FOLDERS SECTION (Google Drive Look) */}
                <div>
                  <h3 className="section-title-label">Folders</h3>
                  <div className="folders-grid">
                    {/* All Files Root Folder */}
                    <div 
                      className={`folder-pill ${selectedFolderId === null ? 'active' : ''}`}
                      onClick={() => setSelectedFolderId(null)}
                    >
                      <Folder size={15} className="folder-pill-icon active-folder" />
                      <span className="folder-pill-name">All Files</span>
                      <span className="folder-pill-count">{filteredDocs.length}</span>
                    </div>

                    {/* Filtered Application Directories */}
                    {foldersList.map((folder) => (
                      <div
                        key={folder.appId}
                        className={`folder-pill ${selectedFolderId === folder.appId ? 'active' : ''}`}
                        onClick={() => setSelectedFolderId(folder.appId)}
                      >
                        <Folder size={15} className="folder-pill-icon" />
                        <span className="folder-pill-name">{folder.folderName}</span>
                        <span className="folder-pill-count">{folder.items.length}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. FILES SECTION */}
                <div>
                  <div className="files-section-header">
                    <span className="breadcrumb-root" onClick={() => setSelectedFolderId(null)}>Documents</span>
                    {selectedFolderId && (
                      <>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">
                          {selectedFolderId === 'general' 
                            ? 'General Documents' 
                            : folderGroups[selectedFolderId]?.folderName || 'Selected Folder'}
                        </span>
                      </>
                    )}
                  </div>

                  {displayDocs.length === 0 ? (
                    <div className="content-card empty-state" style={{ padding: 32 }}>
                      <FileText size={32} className="empty-state-icon" />
                      <p className="empty-state-title" style={{ fontSize: 13 }}>No files inside this folder</p>
                    </div>
                  ) : (
                    <div className="doc-grid">
                      {displayDocs.map((doc) => {
                        const isAnalyzing = !doc.aiScore || analyzingDocs[doc.id];
                        return (
                          <div 
                            key={doc.id} 
                            className={`content-card doc-card ${!isAnalyzing ? 'clickable-card' : ''}`}
                            onClick={() => {
                              if (!isAnalyzing) {
                                setSelectedAnalysisDoc(doc)
                              }
                            }}
                            style={{ 
                              cursor: !isAnalyzing ? 'pointer' : 'default',
                              border: isAnalyzing ? '1px dashed var(--color-border)' : '1px solid var(--color-border)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <FileText size={24} color={doc.fileType === 'resume' ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                                <div>
                                  <span className="doc-name" title={doc.name}>{doc.name}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <span className="doc-meta">{doc.fileType.toUpperCase()}</span>
                                    <span className="dot-divider" />
                                    <span className="doc-meta">{doc.fileSize || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              {doc.fileType === 'resume' && (
                                <button
                                  className={`active-badge-btn ${doc.active ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleActive(doc.id)
                                  }}
                                  title={doc.active ? 'Set Inactive' : 'Set as Active Resume'}
                                >
                                  <CheckCircle size={10} />
                                  <span>{doc.active ? 'Active' : 'Set Active'}</span>
                                </button>
                              )}
                            </div>

                            {doc.description && (
                              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                                {doc.description}
                              </p>
                            )}

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                              {doc.application && (
                                <span className="tag-pill" onClick={(e) => e.stopPropagation()}>
                                  <LinkIcon size={10} style={{ marginRight: 4 }} />
                                  {doc.application.company}
                                </span>
                              )}
                              {isAnalyzing ? (
                                <span className="score-badge analyzing" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                                  <Loader2 size={10} className="animate-spin" />
                                  <span>AI Auditing...</span>
                                </span>
                              ) : (
                                doc.aiScore && (
                                  <span className="score-badge">AI Score: {doc.aiScore}</span>
                                )
                              )}
                            </div>

                            <div className="doc-actions" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={doc.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="icon-btn"
                                title="Preview / Open"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Eye size={14} />
                              </a>
                              <a
                                href={doc.path}
                                download={doc.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="icon-btn"
                                title="Download"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Download size={14} />
                              </a>
                              <button
                                className="icon-btn danger"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(doc.id)
                                }}
                                disabled={isPending}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Right Sidebar - AI Feedback */}
          <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="content-card ai-doc-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                  Resume Feedback
                </h3>
              </div>
              
              {feedbackDoc ? (
                <>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 12px 0', lineHeight: 1.5 }}>
                    Your audited resume (<strong>{feedbackDoc.name}</strong>) has an AI score of <strong>{feedbackDoc.aiScore || 'N/A'}</strong>. Actionable improvements:
                  </p>
                  {feedbackSuggestions.length > 0 ? (
                    <ul className="suggestions-list">
                      {feedbackSuggestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No specific suggestions extracted. Try re-uploading to get AI feedback points.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  ✦ Select a resume as "Active" to display smart AI feedback suggestions and optimization scores here.
                </p>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsUploadModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Upload Document</h2>
              <p className="modal-subtitle">Secure S3 cloud storage with automated Gemini audit</p>
            </div>

            {modalError && (
              <div className="modal-error-banner" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-danger-subtle)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Select File *</label>
                <input
                  type="file"
                  required
                  className="form-input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ paddingTop: 8 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-input"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                >
                  <option value="resume">Resume</option>
                  <option value="coverletter">Cover Letter</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Link to Job Application (Optional)</label>
                <select
                  className="form-input"
                  value={linkedAppId}
                  onChange={(e) => setLinkedAppId(e.target.value)}
                >
                  <option value="">-- No Association --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.role}
                    </option>
                  ))}
                </select>
                <p className="form-helper" style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Links this file to a company folder and structures its Cloudflare R2 path.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. Custom resume tailored for senior fullstack position"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ height: 60, resize: 'none' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                      <span>Auditing with AI...</span>
                    </>
                  ) : (
                    <span>Upload & Analyze</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Details Modal */}
      {selectedAnalysisDoc && (() => {
        let goodPoints: string[] = []
        let badPoints: string[] = []
        let improvePoints: string[] = []
        if (selectedAnalysisDoc.aiFeedback) {
          try {
            const parsed = JSON.parse(selectedAnalysisDoc.aiFeedback)
            if (Array.isArray(parsed)) {
              improvePoints = parsed
            } else if (parsed && typeof parsed === 'object') {
              goodPoints = parsed.good || []
              badPoints = parsed.bad || []
              improvePoints = parsed.improve || []
            }
          } catch (e) {
            console.error('Failed to parse feedback:', e)
          }
        }

        return (
          <div className="modal-backdrop" onClick={() => setSelectedAnalysisDoc(null)}>
            <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
              {/* Close X Button */}
              <button className="modal-close-btn" style={{ top: 20, right: 20 }} onClick={() => setSelectedAnalysisDoc(null)}>
                <X size={16} />
              </button>

              {/* Modal Header (Fixed) */}
              <div className="modal-header" style={{ padding: '24px 24px 16px 24px', margin: 0, borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={18} color="var(--color-primary)" />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                    AI Audit Analysis
                  </span>
                </div>
                <h2 className="modal-title" style={{ marginTop: 6, fontSize: 18 }}>{selectedAnalysisDoc.name}</h2>
                <p className="modal-subtitle">
                  {selectedAnalysisDoc.fileType.toUpperCase()} {selectedAnalysisDoc.fileSize ? `• ${selectedAnalysisDoc.fileSize}` : ''}
                </p>
              </div>

              {/* Modal Body (Scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Score Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-surface)', padding: '16px 20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--color-primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    border: '3px solid var(--color-primary)',
                    flexShrink: 0
                  }}>
                    {selectedAnalysisDoc.aiScore || 'N/A'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Gemini Quality Rating</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      Based on standard ATS parsing benchmarks, layout formatting, structure, and keyword density.
                    </p>
                  </div>
                </div>

                {/* Analysis Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* What's Good */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Check size={16} color="var(--color-success)" />
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>What's Good</h4>
                    </div>
                    {goodPoints.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.4, listStyleType: 'disc' }}>
                        {goodPoints.map((item, idx) => <li key={idx} style={{ paddingLeft: 4 }}>{item}</li>)}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-disabled)', fontStyle: 'italic', paddingLeft: 20 }}>
                        No strong points explicitly outlined.
                      </p>
                    )}
                  </div>

                  {/* What's Bad */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <AlertTriangle size={16} color="var(--color-danger)" />
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-danger)' }}>What's Bad</h4>
                    </div>
                    {badPoints.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.4, listStyleType: 'disc' }}>
                        {badPoints.map((item, idx) => <li key={idx} style={{ paddingLeft: 4 }}>{item}</li>)}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-disabled)', fontStyle: 'italic', paddingLeft: 20 }}>
                        No major errors or warning points found.
                      </p>
                    )}
                  </div>

                  {/* What to Improve */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={16} color="var(--color-primary)" />
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>What to Improve</h4>
                    </div>
                    {improvePoints.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.4, listStyleType: 'disc' }}>
                        {improvePoints.map((item, idx) => <li key={idx} style={{ paddingLeft: 4 }}>{item}</li>)}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-disabled)', fontStyle: 'italic', paddingLeft: 20 }}>
                        No recommendations compiled.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions (Fixed Footer) */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-card)' }}>
                <button className="btn-secondary" onClick={() => setSelectedAnalysisDoc(null)}>
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .page-title {
          font-size: 20px;
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
          height: 34px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
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
          font-size: 12px;
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
        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--color-surface);
          padding: 3px;
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
        .search-input-wrap {
          position: relative;
        }
        .search-input {
          height: 32px;
          padding: 0 12px 0 32px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 12px;
          outline: none;
          color: var(--color-text-primary);
          width: 200px;
          transition: width 0.2s ease;
        }
        .search-input:focus {
          width: 240px;
          border-color: var(--color-primary);
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 20px;
        }
        
        /* Folders Section - Google Drive Look */
        .section-title-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .folder-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-fast);
          user-select: none;
        }
        
        .folder-pill:hover {
          background: var(--color-surface);
          border-color: var(--color-text-secondary);
        }
        
        .folder-pill.active {
          background: var(--color-primary-subtle);
          border-color: var(--color-primary);
        }
        
        .folder-pill-icon {
          color: var(--color-text-secondary);
          flex-shrink: 0;
        }
        
        .folder-pill.active .folder-pill-icon {
          color: var(--color-primary);
        }
        
        .folder-pill-icon.active-folder {
          color: var(--color-primary);
        }
        
        .folder-pill-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        
        .folder-pill-count {
          font-size: 9px;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          padding: 1px 5px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-subtle);
          flex-shrink: 0;
        }
        
        .folder-pill.active .folder-pill-count {
          background: var(--color-card);
          color: var(--color-primary);
          border-color: var(--color-primary-subtle);
        }
        
        /* Files section path breadcrumbs */
        .files-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 16px 0 16px 0;
          border-bottom: 1px solid var(--color-border-subtle);
          padding-bottom: 8px;
        }
        
        .breadcrumb-root {
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: color var(--duration-fast);
        }
        
        .breadcrumb-root:hover {
          color: var(--color-primary);
        }
        
        .breadcrumb-separator {
          color: var(--color-text-disabled);
        }
        
        .breadcrumb-current {
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }
        
        .doc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .doc-card {
          display: flex;
          flex-direction: column;
          background: var(--color-card);
          transition: transform var(--duration-fast), box-shadow var(--duration-fast), border-color var(--duration-fast);
        }
        .doc-card.clickable-card {
          border: 1px solid var(--color-border);
        }
        .doc-card.clickable-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .doc-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          display: block;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .doc-meta {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin: 0;
        }
        .dot-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--color-text-disabled);
        }
        
        .active-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .active-badge-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .active-badge-btn.active {
          color: var(--color-success);
          background: var(--color-success-subtle);
          border-color: transparent;
        }
        
        .tag-pill {
          font-size: 10px;
          color: var(--color-text-secondary);
          background: var(--color-surface);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--color-border-subtle);
        }
        .score-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          background: var(--color-primary-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          margin-left: auto;
        }
        .doc-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--color-border-subtle);
          margin-top: 16px;
          padding-top: 12px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all var(--duration-fast);
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .icon-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .icon-btn.danger:hover {
          color: var(--color-danger);
          background: var(--color-danger-subtle);
        }
        .ai-doc-card {
          border-left: 3px solid var(--color-primary);
        }
        .suggestions-list {
          margin: 0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
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
        
        /* Modal Content Wrapper */
        .modal-content-wrapper {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-lg);
          width: 100%;
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
        
        .modal-form {
          display: flex;
          flex-direction: column;
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
          color: var(--color-text-primary);
        }
        
        .form-input {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          color: var(--color-text-primary);
          font-size: 13px;
          outline: none;
          transition: border var(--duration-fast);
        }
        
        .form-input:focus {
          border-color: var(--color-primary);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
          border: 1px dashed var(--color-border);
          background: var(--color-surface);
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
          max-width: 320px;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
