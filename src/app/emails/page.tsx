'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  Mail,
  Search,
  Sparkles,
  ChevronRight,
  Inbox,
  Send,
  Calendar,
  AlertCircle,
  Link2,
  Bookmark,
  Archive,
  Star,
  CheckCircle,
  FileText
} from 'lucide-react'

export default function EmailsPage() {
  const [selectedId, setSelectedId] = useState<number>(1)
  const [activeFilter, setActiveFilter] = useState<'inbox' | 'invites' | 'offers' | 'rejections' | 'unread'>('inbox')

  const emails = [
    {
      id: 1,
      company: 'Google',
      sender: 'Priya Mehta',
      date: 'Today, 10:15 AM',
      subject: 'Interview invitation: Software Engineer II',
      body: 'Hi Demo,\n\nThanks for taking the time to speak with us during the phone screen. We would like to invite you for a 60-minute technical session on systems and algorithms. Please let us know if July 18th at 2:00 PM works for you.\n\nBest,\nPriya Mehta\nGoogle Recruiting',
      type: 'Interview Invitation',
      typeColor: 'var(--color-primary)',
      typeBg: 'var(--color-primary-subtle)',
      unread: true,
      detectedDate: 'July 18, 2025 at 2:00 PM',
      detectedRole: 'Software Engineer II',
    },
    {
      id: 2,
      company: 'Stripe',
      sender: 'Tom Karry',
      date: 'Yesterday, 4:32 PM',
      subject: 'Offer Letter from Stripe',
      body: 'Dear Demo,\n\nWe are absolutely thrilled to extend you an offer to join Stripe as a Product Engineer. We were incredibly impressed by your interviews. Your base salary will be $160,000, and details on stock benefits are enclosed.\n\nWarmly,\nTom Karry',
      type: 'Offer',
      typeColor: 'var(--color-success)',
      typeBg: 'var(--color-success-subtle)',
      unread: true,
      detectedSalary: '$160,000 + Stock',
    },
    {
      id: 3,
      company: 'Notion',
      sender: 'Alex Rivera',
      date: 'Jul 12, 2025',
      subject: 'Technical Assessment: Frontend Design',
      body: 'Hello,\n\nPlease complete the frontend take-home assessment within 7 days. You will design a simplified rich text editor block. Link to GitHub repository is attached below.\n\nThanks,\nAlex',
      type: 'Assessment',
      typeColor: 'var(--color-warning)',
      typeBg: 'var(--color-warning-subtle)',
      unread: false,
    },
    {
      id: 4,
      company: 'Figma',
      sender: 'Sara Connor',
      date: 'Jul 10, 2025',
      subject: 'Update on application: Software Engineer',
      body: 'Hi Demo,\n\nThank you for interviewing for the Software Engineer role. We enjoyed meeting you, but we have decided to move forward with other candidates whose experience matches our requirements more closely.',
      type: 'Rejection',
      typeColor: 'var(--color-danger)',
      typeBg: 'var(--color-danger-subtle)',
      unread: false,
    }
  ]

  const activeEmail = emails.find(e => e.id === selectedId) || emails[0]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Demo User', email: 'demo@avenor.app' }} />
        
        {/* Three Column Layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Inbox Sidebar (Left) */}
          <div className="inbox-sidebar">
            <div style={{ padding: '16px 12px' }}>
              <div className="search-input-wrap">
                <Search size={14} className="search-icon" />
                <input type="text" placeholder="Search inbox..." className="search-input" style={{ width: '100%' }} />
              </div>
            </div>
            
            <nav className="inbox-nav">
              <button className={`inbox-nav-item ${activeFilter === 'inbox' ? 'active' : ''}`} onClick={() => setActiveFilter('inbox')}>
                <Inbox size={15} />
                <span>Inbox</span>
                <span className="count-badge">2</span>
              </button>
              <button className={`inbox-nav-item ${activeFilter === 'invites' ? 'active' : ''}`} onClick={() => setActiveFilter('invites')}>
                <Calendar size={15} />
                <span>Interviews</span>
              </button>
              <button className={`inbox-nav-item ${activeFilter === 'offers' ? 'active' : ''}`} onClick={() => setActiveFilter('offers')}>
                <CheckCircle size={15} />
                <span>Offers</span>
              </button>
              <button className={`inbox-nav-item ${activeFilter === 'rejections' ? 'active' : ''}`} onClick={() => setActiveFilter('rejections')}>
                <AlertCircle size={15} />
                <span>Rejections</span>
              </button>
            </nav>
          </div>

          {/* Email Previews (Middle) */}
          <div className="email-list">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`email-row ${selectedId === email.id ? 'selected' : ''} ${email.unread ? 'unread' : ''}`}
                onClick={() => setSelectedId(email.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="sender-avatar">{email.company[0]}</div>
                    <span className="sender-name">{email.sender}</span>
                  </div>
                  <span className="email-time">{email.date.split(', ')[0]}</span>
                </div>
                <div className="email-subject" style={{ fontWeight: email.unread ? 700 : 500 }}>{email.subject}</div>
                <div className="email-snippet">{email.body.substring(0, 75)}...</div>
                <div style={{ marginTop: 8 }}>
                  <span className="type-tag" style={{ background: email.typeBg, color: email.typeColor }}>
                    {email.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Email Content Details (Right) */}
          <div className="email-detail">
            {activeEmail ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div className="detail-header">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="sender-avatar-lg">{activeEmail.company[0]}</div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        {activeEmail.sender}
                      </h2>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                        to me • {activeEmail.date}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="icon-btn"><Archive size={15} /></button>
                    <button className="icon-btn"><Star size={15} /></button>
                  </div>
                </div>

                <div style={{ padding: '0 24px', fontSize: 15, fontWeight: 700, borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                  {activeEmail.subject}
                </div>

                {/* AI Extracted Data Panel */}
                {(activeEmail.detectedDate || activeEmail.detectedSalary) && (
                  <div className="ai-extracted-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Sparkles size={16} color="var(--color-primary)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Avenor AI Detection
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      {activeEmail.detectedDate && (
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Detected Date</span>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{activeEmail.detectedDate}</div>
                        </div>
                      )}
                      {activeEmail.detectedRole && (
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Position</span>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{activeEmail.detectedRole}</div>
                        </div>
                      )}
                      {activeEmail.detectedSalary && (
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Base Salary</span>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{activeEmail.detectedSalary}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      {activeEmail.detectedDate && (
                        <button className="btn-primary" style={{ height: 30, fontSize: 11 }}>
                          Add to Calendar
                        </button>
                      )}
                      <button className="btn-secondary" style={{ height: 30, fontSize: 11 }}>
                        Link to Application
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="email-body">
                  {activeEmail.body.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Mail size={32} color="var(--color-text-disabled)" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Select an email to view details</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .inbox-sidebar {
          width: 240px;
          border-right: 1px solid var(--color-border);
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
        }
        .search-input-wrap {
          position: relative;
        }
        .search-input {
          height: 34px;
          padding: 0 12px 0 32px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
        }
        .inbox-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 8px;
        }
        .inbox-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 36px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--duration-fast), color var(--duration-fast);
          text-align: left;
        }
        .inbox-nav-item:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .inbox-nav-item.active {
          background: var(--color-active-bg);
          color: var(--color-primary);
          font-weight: 600;
        }
        .count-badge {
          margin-left: auto;
          background: var(--color-primary);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }
        .email-list {
          width: 340px;
          border-right: 1px solid var(--color-border);
          background: var(--color-card);
          overflow-y: auto;
        }
        .email-row {
          padding: 16px;
          border-bottom: 1px solid var(--color-border-subtle);
          cursor: pointer;
          transition: background var(--duration-fast);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .email-row:hover {
          background: var(--color-bg-primary);
        }
        .email-row.selected {
          background: var(--color-primary-subtle);
        }
        .email-row.unread {
          border-left: 3px solid var(--color-primary);
        }
        .sender-avatar {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
        }
        .sender-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .email-time {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .email-subject {
          font-size: 13px;
          color: var(--color-text-primary);
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .email-snippet {
          font-size: 12px;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }
        .type-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .email-detail {
          flex: 1;
          background: var(--color-card);
          overflow-y: auto;
        }
        .detail-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sender-avatar-lg {
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
        .icon-btn {
          background: none;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 6px;
          cursor: pointer;
          color: var(--color-text-secondary);
        }
        .icon-btn:hover {
          background: var(--color-surface);
          color: var(--color-text-primary);
        }
        .ai-extracted-banner {
          margin: 24px;
          padding: 16px;
          background: var(--color-primary-subtle);
          border: 1px solid var(--color-primary-muted);
          border-radius: var(--radius-lg);
        }
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary {
          background: var(--color-card);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .email-body {
          padding: 24px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-primary);
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}
