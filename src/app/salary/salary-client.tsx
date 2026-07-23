'use client'

import { useState, useTransition, useEffect } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { Plus, Check, Sparkles, HelpCircle, FileText, ArrowRight, X, Loader2, Clipboard, Trash2, Mail } from 'lucide-react'
import { addOfferAction, parseOfferLetterAction, updateOfferStatusAction, deleteOfferAction } from '@/lib/actions/offer'

interface OfferItem {
  id: string
  company: string
  role: string
  baseSalary: number
  bonus: number
  equity: number
  location: string
  status: string
  expirationDate?: Date | string | null
  score?: number | null
  scoreExplanation?: string | null
  negotiationEmail?: string | null
  applicationId?: string | null
}

interface ApplicationItem {
  id: string
  company: string
  role: string
}

interface SalaryClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  offers: OfferItem[]
  applications: ApplicationItem[]
  overallStrategy: string
}

export function SalaryClient({ user, offers, applications, overallStrategy }: SalaryClientProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'compare'>('active')
  const [localOffers, setLocalOffers] = useState<OfferItem[]>(offers)
  const [isPending, startTransition] = useTransition()

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedNegotiateOffer, setSelectedNegotiateOffer] = useState<OfferItem | null>(null)
  const [selectedScoreOffer, setSelectedScoreOffer] = useState<OfferItem | null>(null)
  
  // PDF Parsing states
  const [isParsingPDF, setIsParsingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Add Offer Form states
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [bonus, setBonus] = useState('')
  const [equity, setEquity] = useState('')
  const [location, setLocation] = useState('Remote')
  const [status, setStatus] = useState('PENDING')
  const [expirationDate, setExpirationDate] = useState('')
  const [linkedAppId, setLinkedAppId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [copiedState, setCopiedState] = useState(false)

  // Sync props to state
  useEffect(() => {
    setLocalOffers(offers)
  }, [offers])

  // Reset form helper
  const resetForm = () => {
    setCompany('')
    setRole('')
    setBaseSalary('')
    setBonus('')
    setEquity('')
    setLocation('Remote')
    setStatus('PENDING')
    setExpirationDate('')
    setLinkedAppId('')
    setFormError(null)
    setPdfError(null)
  }

  // Handle PDF parsing upload
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsingPDF(true)
    setPdfError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await parseOfferLetterAction(formData)
      if (!res.success) {
        setPdfError(res.error)
      } else {
        const data = res.data
        if (data.company) setCompany(data.company)
        if (data.role) setRole(data.role)
        if (data.baseSalary) setBaseSalary(data.baseSalary.toString())
        if (data.bonus) setBonus(data.bonus.toString())
        if (data.equity) setEquity(data.equity.toString())
        if (data.location) setLocation(data.location)
      }
    } catch (err) {
      setPdfError('Failed to read and parse the offer letter.')
    } finally {
      setIsParsingPDF(false)
    }
  }

  // Submit new offer
  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!company.trim() || !role.trim()) {
      setFormError('Company and Role are required.')
      return
    }

    const baseVal = parseFloat(baseSalary)
    if (isNaN(baseVal) || baseVal < 0) {
      setFormError('Base Salary must be a positive number.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('company', company)
      formData.append('role', role)
      formData.append('baseSalary', baseVal.toString())
      formData.append('bonus', (parseFloat(bonus) || 0).toString())
      formData.append('equity', (parseFloat(equity) || 0).toString())
      formData.append('location', location)
      formData.append('status', status)
      if (expirationDate) {
        formData.append('expirationDate', expirationDate)
      }
      if (linkedAppId) {
        formData.append('applicationId', linkedAppId)
      }

      const res = await addOfferAction(formData)
      if (!res.success) {
        setFormError(res.error)
      } else {
        // Optimistic update
        setLocalOffers((prev) => [res.data, ...prev])
        setIsAddModalOpen(false)
        resetForm()
      }
    })
  }

  // Handle offer status change (Accept)
  const handleAcceptOffer = (id: string) => {
    setLocalOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'ACCEPTED' } : o))
    )
    startTransition(async () => {
      const res = await updateOfferStatusAction(id, 'ACCEPTED')
      if (!res.success) {
        alert(res.error)
      }
    })
  }

  // Handle offer deletion
  const handleDeleteOffer = (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return

    setLocalOffers((prev) => prev.filter((o) => o.id !== id))
    startTransition(async () => {
      const res = await deleteOfferAction(id)
      if (!res.success) {
        alert(res.error)
      }
    })
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedState(true)
    setTimeout(() => setCopiedState(false), 2000)
  }

  // Sort and highlight highest scored offer
  const sortedOffers = [...localOffers].sort((a, b) => (b.score || 0) - (a.score || 0))
  const highestScore = sortedOffers[0]?.score || 0

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Sidebar />
        <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header user={{ name: user.name || 'Demo User', email: user.email || 'demo@avenor.app', image: user.image }} />
          <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Salary & Offers</h1>
                <p className="page-subtitle">Compare baseline components and negotiate offers with AI analytics.</p>
              </div>
              <button className="btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
                <Plus size={16} />
                <span>Add Offer</span>
              </button>
            </div>

            {/* Navigation Tab */}
            <div className="tab-bar">
              <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active Offers</button>
              <button className={`tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>Detailed Comparison</button>
            </div>

            {activeTab === 'active' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {localOffers.length === 0 ? (
                  <div className="content-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                    No offers logged yet. Click "Add Offer" or upload an offer letter PDF to calculate your negotiation strategy!
                  </div>
                ) : (
                  <>
                    {/* Offers Grid */}
                    <div className="offers-grid">
                      {localOffers.map((offer) => {
                        const isBest = offer.score && offer.score === highestScore && localOffers.length > 1
                        const formattedExpiration = offer.expirationDate 
                          ? `Expires ${new Date(offer.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                          : 'Pending Decision'

                        return (
                          <div key={offer.id} className={`content-card offer-card ${isBest ? 'highlighted' : ''}`}>
                            {isBest && (
                              <div className="best-tag">
                                <Sparkles size={11} />
                                <span>AI RECOMMENDED</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{offer.company}</h3>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{offer.role}</p>
                              </div>
                              <button 
                                className="score-badge-btn" 
                                title="Click to view AI score breakdown"
                                onClick={() => setSelectedScoreOffer(offer)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  background: 'var(--color-success-subtle)',
                                  color: 'var(--color-success)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '4px 10px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <span className="score-num">{offer.score || 'N/A'}</span>
                                <span className="score-lbl" style={{ fontSize: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
                                  Score <HelpCircle size={8} />
                                </span>
                              </button>
                            </div>

                            <div style={{ margin: '16px 0' }}>
                              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Base Salary</span>
                              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
                                ${offer.baseSalary.toLocaleString()}
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>/yr</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Annual Bonus</span>
                                <span style={{ fontWeight: 600 }}>${offer.bonus.toLocaleString()}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Stock Options / RSUs</span>
                                <span style={{ fontWeight: 600 }}>${offer.equity.toLocaleString()} (4yr vest)</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Work Location</span>
                                <span style={{ fontWeight: 600 }}>{offer.location}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Monthly Take-home</span>
                                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                  ~${Math.round((offer.baseSalary * 0.7) / 12).toLocaleString()}/mo
                                </span>
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border-subtle)', marginTop: 16, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span className={`status-pill ${offer.status.toLowerCase()}`}>
                                {offer.status === 'PENDING' ? formattedExpiration : offer.status}
                              </span>
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <button className="btn-secondary text-btn" onClick={() => setSelectedNegotiateOffer(offer)}>
                                  Negotiate
                                </button>
                                {offer.status !== 'ACCEPTED' && (
                                  <button className="btn-primary text-btn" onClick={() => handleAcceptOffer(offer.id)}>
                                    Accept
                                  </button>
                                )}
                                <button className="delete-btn" onClick={() => handleDeleteOffer(offer.id)} title="Delete Offer">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* AI combined recommendation advice */}
                    {overallStrategy && (
                      <div className="content-card ai-recommendation-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Sparkles size={16} color="var(--color-primary)" />
                          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                            Negotiation Strategy
                          </h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                          {overallStrategy}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
                {localOffers.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                    No offers logged to compare.
                  </div>
                ) : (
                  <div className="compare-table">
                    <div className="table-header-row" style={{ gridTemplateColumns: `200px repeat(${localOffers.length}, 1fr)` }}>
                      <span>Metric</span>
                      {localOffers.map(o => <span key={o.id}>{o.company}</span>)}
                    </div>
                    {[
                      { label: 'Base Salary', format: (o: OfferItem) => `$${o.baseSalary.toLocaleString()}/yr` },
                      { label: 'Annual Bonus', format: (o: OfferItem) => `$${o.bonus.toLocaleString()}` },
                      { label: 'Stock Options / RSUs (4yr)', format: (o: OfferItem) => `$${o.equity.toLocaleString()}` },
                      { label: 'Work Mode', format: (o: OfferItem) => o.location },
                      { label: 'Estimated Take Home', format: (o: OfferItem) => `$${Math.round((o.baseSalary * 0.7) / 12).toLocaleString()}/mo` },
                      { label: 'Package Score', format: (o: OfferItem) => `${o.score || 'N/A'} / 100` },
                      { label: 'Expiration', format: (o: OfferItem) => o.expirationDate ? new Date(o.expirationDate).toLocaleDateString() : 'N/A' },
                    ].map((row, idx) => (
                      <div key={idx} className="table-data-row" style={{ gridTemplateColumns: `200px repeat(${localOffers.length}, 1fr)` }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{row.label}</span>
                        {localOffers.map(o => (
                          <span key={o.id} style={{ color: o.score === highestScore && row.label === 'Base Salary' && localOffers.length > 1 ? 'var(--color-success)' : 'var(--color-text-primary)', fontWeight: o.score === highestScore ? 'bold' : 'normal' }}>
                            {row.format(o)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Offer Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 540, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button className="modal-close-btn" style={{ top: 20, right: 20 }} onClick={() => setIsAddModalOpen(false)}>
              <X size={16} />
            </button>

            {/* Modal Header (Fixed) */}
            <div className="modal-header" style={{ padding: '24px 24px 16px 24px', margin: 0, borderBottom: '1px solid var(--color-border-subtle)' }}>
              <h2 className="modal-title">Add Job Offer</h2>
              <p className="modal-subtitle">Log offer parameters manually or upload an offer PDF for AI parsing</p>
            </div>

            <form onSubmit={handleSubmitOffer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              {/* Modal Body (Scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* AI Parsing Zone */}
                <div style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 16, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileText size={24} color={pdfError ? 'var(--color-danger)' : 'var(--color-primary)'} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>AI Document Parser</span>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>
                      Upload an offer letter PDF to automatically fill compensation details.
                    </p>
                    <label className="btn-secondary" style={{ height: 28, padding: '0 10px', fontSize: 11, cursor: 'pointer', marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isParsingPDF ? (
                        <>
                          <Loader2 size={12} className="animate-spin" style={{ marginRight: 6 }} />
                          <span>Parsing with Gemini...</span>
                        </>
                      ) : (
                        <span>Choose Offer Letter PDF</span>
                      )}
                      <input type="file" accept="application/pdf,image/*" onChange={handlePDFUpload} style={{ display: 'none' }} disabled={isParsingPDF} />
                    </label>
                    {pdfError && <p style={{ fontSize: 10, color: 'var(--color-danger)', margin: '4px 0 0 0' }}>{pdfError}</p>}
                  </div>
                </div>

                {formError && (
                  <div className="modal-error-banner" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-danger-subtle)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12 }}>
                    <X size={14} style={{ marginRight: 6 }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input type="text" required placeholder="e.g. Anthropic" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Title *</label>
                    <input type="text" required placeholder="e.g. Research Engineer" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Salary ($/yr) *</label>
                  <input type="number" required placeholder="e.g. 150000" className="form-input" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Annual Bonus ($)</label>
                    <input type="number" placeholder="0" className="form-input" value={bonus} onChange={(e) => setBonus(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Options / RSUs ($)</label>
                    <input type="number" placeholder="0" className="form-input" value={equity} onChange={(e) => setEquity(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Work Location *</label>
                    <select className="form-input" value={location} onChange={(e) => setLocation(e.target.value)}>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link Application (Optional)</label>
                    <select className="form-input" value={linkedAppId} onChange={(e) => setLinkedAppId(e.target.value)}>
                      <option value="">-- No Application --</option>
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>{app.company} — {app.role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Offer Status *</label>
                    <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="PENDING">Pending Decision</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiration Date</label>
                    <input type="date" className="form-input" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                  </div>
                </div>

              </div>

              {/* Modal Actions (Fixed Footer) */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--color-card)' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={isPending}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                      <span>Gemini Auditing...</span>
                    </>
                  ) : (
                    <span>Add Offer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Negotiation Dialog Modal */}
      {selectedNegotiateOffer && (
        <div className="modal-backdrop" onClick={() => setSelectedNegotiateOffer(null)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 580, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" style={{ top: 20, right: 20 }} onClick={() => setSelectedNegotiateOffer(null)}>
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '24px 24px 16px 24px', margin: 0, borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={16} color="var(--color-primary)" />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                  AI Recruiter Email Generator
                </span>
              </div>
              <h2 className="modal-title" style={{ marginTop: 6, fontSize: 18 }}>Negotiate Offer — {selectedNegotiateOffer.company}</h2>
              <p className="modal-subtitle">Persuasive draft based on total compensation and current leverage</p>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                  {selectedNegotiateOffer.negotiationEmail || 'No template compiled.'}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--color-card)' }}>
              <button 
                className="btn-primary" 
                style={{ height: 32 }}
                onClick={() => handleCopyToClipboard(selectedNegotiateOffer.negotiationEmail || '')}
              >
                <Clipboard size={14} />
                <span>{copiedState ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              <button className="btn-secondary" style={{ height: 32 }} onClick={() => setSelectedNegotiateOffer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Explanation Modal */}
      {selectedScoreOffer && (
        <div className="modal-backdrop" onClick={() => setSelectedScoreOffer(null)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 500, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" style={{ top: 20, right: 20 }} onClick={() => setSelectedScoreOffer(null)}>
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '24px 24px 16px 24px', margin: 0, borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="var(--color-success)" />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', letterSpacing: '0.05em' }}>
                  AI Score Analysis
                </span>
              </div>
              <h2 className="modal-title" style={{ marginTop: 6, fontSize: 18 }}>Compensation Auditing — {selectedScoreOffer.company}</h2>
              <p className="modal-subtitle">AI analysis of the package quality and market alignment</p>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-success)', background: 'var(--color-success-subtle)', width: 56, height: 56, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedScoreOffer.score || 'N/A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Overall Quality Rating</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>Audited by Gemini AI against role level & standards</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                  {selectedScoreOffer.scoreExplanation || 'No score explanation compiled. Add or update this offer to run AI auditing.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--color-card)' }}>
              <button className="btn-primary" style={{ height: 32 }} onClick={() => setSelectedScoreOffer(null)}>
                Got it
              </button>
            </div>
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
          height: 34px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s ease;
        }
        .btn-primary:hover {
          background: var(--color-primary-hover, #aa644d);
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
          transition: background 0.15s ease;
        }
        .btn-secondary:hover {
          background: var(--color-surface);
        }
        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .text-btn {
          height: 26px !important;
          padding: 0 8px !important;
          font-size: 11px !important;
          border-radius: var(--radius-sm) !important;
        }
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: 4px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .delete-btn:hover {
          background: var(--color-danger-subtle);
          color: var(--color-danger);
        }
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--color-surface);
          padding: 3px;
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
        }
        .offers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .content-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          padding: 24px;
          position: relative;
        }
        .offer-card.highlighted {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        .best-tag {
          position: absolute;
          top: -10px;
          left: 20px;
          background: var(--color-primary);
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .score-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--color-success-subtle);
          color: var(--color-success);
          border-radius: var(--radius-md);
          padding: 4px 10px;
        }
        .score-num {
          font-size: 16px;
          font-weight: 800;
        }
        .score-lbl {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill {
          display: inline-flex;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .status-pill.pending {
          color: var(--color-warning);
          background: var(--color-warning-subtle);
        }
        .status-pill.accepted {
          color: var(--color-success);
          background: var(--color-success-subtle);
        }
        .status-pill.declined {
          color: var(--color-danger);
          background: var(--color-danger-subtle);
        }
        .ai-recommendation-card {
          border-left: 4px solid var(--color-primary);
        }
        .compare-table {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table-header-row {
          display: grid;
          padding: 14px 20px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
        }
        .table-data-row {
          display: grid;
          padding: 14px 20px;
          border-bottom: 1px solid var(--color-border-subtle);
          font-size: 13px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          transition: all 0.2s ease;
        }
        
        .modal-close-btn:hover {
          background: var(--color-surface);
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
          transition: border 0.2s ease;
        }
        
        .form-input:focus {
          border-color: var(--color-primary);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </>
  )
}
