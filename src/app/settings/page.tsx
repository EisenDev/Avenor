'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Link2,
  Cpu,
  Shield,
  Trash2,
  Mail,
  Calendar,
  Database
} from 'lucide-react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'integrations' | 'notifications' | 'security'>('integrations')

  // integrations toggles
  const [gmailActive, setGmailActive] = useState(true)
  const [calendarActive, setCalendarActive] = useState(true)
  const [driveActive, setDriveActive] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Demo User', email: 'demo@avenor.app' }} />
        <main style={{ padding: 'var(--spacing-page-y) var(--spacing-page-x)', flex: 1, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Settings Left Navigation Sidebar */}
          <div className="settings-nav">
            <button className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`} onClick={() => setActiveSection('profile')}>
              <User size={15} />
              <span>Profile Settings</span>
            </button>
            <button className={`settings-nav-item ${activeSection === 'integrations' ? 'active' : ''}`} onClick={() => setActiveSection('integrations')}>
              <Link2 size={15} />
              <span>Integrations</span>
            </button>
            <button className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`} onClick={() => setActiveSection('notifications')}>
              <Bell size={15} />
              <span>Notifications</span>
            </button>
            <button className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`} onClick={() => setActiveSection('security')}>
              <Shield size={15} />
              <span>Security</span>
            </button>
          </div>

          {/* Settings Right panel content area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeSection === 'integrations' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Google Integrations */}
                <div className="content-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Database size={16} color="var(--color-primary)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Google Integrations</h2>
                  </div>

                  <div className="integration-rows">
                    {/* Gmail */}
                    <div className="integration-row">
                      <div className="integration-icon-box"><Mail size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="integration-title">Gmail Integration</span>
                          {gmailActive && <span className="conn-status green">Connected</span>}
                        </div>
                        <p className="integration-desc">Avenor monitors incoming emails for recruiter messages and classifications.</p>
                      </div>
                      <button className="btn-secondary" onClick={() => setGmailActive(!gmailActive)}>
                        {gmailActive ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Calendar */}
                    <div className="integration-row">
                      <div className="integration-icon-box"><Calendar size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="integration-title">Google Calendar Sync</span>
                          {calendarActive && <span className="conn-status green">Connected</span>}
                        </div>
                        <p className="integration-desc">Synchronizes scheduled interviews, assessment tasks, and followups.</p>
                      </div>
                      <button className="btn-secondary" onClick={() => setCalendarActive(!calendarActive)}>
                        {calendarActive ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Google Drive */}
                    <div className="integration-row">
                      <div className="integration-icon-box"><Database size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="integration-title">Google Drive Vault</span>
                          {driveActive && <span className="conn-status green">Connected</span>}
                        </div>
                        <p className="integration-desc">Upload, backup, and store versioned resume copies and portfolio logs.</p>
                      </div>
                      <button className="btn-primary" style={{ height: 32 }} onClick={() => setDriveActive(!driveActive)}>
                        {driveActive ? 'Disconnect' : 'Connect Account'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Providers config */}
                <div className="content-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Cpu size={16} color="var(--color-primary)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>AI Providers & Credentials</h2>
                  </div>

                  <div className="integration-rows">
                    <div className="integration-row">
                      <div className="integration-icon-box">✦</div>
                      <div style={{ flex: 1 }}>
                        <span className="integration-title">OpenAI GPT Integration</span>
                        <p className="integration-desc">Configured with API Key ending in ****8901</p>
                      </div>
                      <button className="btn-secondary">Edit Config</button>
                    </div>

                    <div className="integration-row">
                      <div className="integration-icon-box">✦</div>
                      <div style={{ flex: 1 }}>
                        <span className="integration-title">Google Gemini Core</span>
                        <p className="integration-desc">System default model active: gemini-1.5-pro</p>
                      </div>
                      <span className="conn-status green">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeSection === 'profile' ? (
              <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3>Profile Settings</h3>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="avatar-circle-edit">DU</div>
                  <button className="btn-secondary">Upload New Picture</button>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" defaultValue="Demo User" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email Address</label>
                    <input type="text" className="form-input" defaultValue="demo@avenor.app" readOnly />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Job Title</label>
                    <input type="text" className="form-input" defaultValue="Software Engineer" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>
            ) : activeSection === 'notifications' ? (
              <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3>Notifications Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Email digest summaries', desc: 'Recieve daily pipeline status summaries' },
                    { label: 'Interview alerts', desc: 'Notify 1 hour before scheduled interviews' },
                    { label: 'Document updates', desc: 'Sync score updates from optimization drafts' }
                  ].map((item, idx) => (
                    <label key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)', width: 16 }} />
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3>Security Settings</h3>
                <div className="form-field">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" />
                </div>
                <div className="form-field">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary">Update Password</button>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 20 }}>
                  <h4 style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 700, margin: 0 }}>Danger Zone</h4>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Permanently remove Avenor data profiles.</p>
                  <button className="btn-secondary" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', marginTop: 8 }}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      <style>{`
        .settings-nav {
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 38px;
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
        .settings-nav-item:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .settings-nav-item.active {
          background: var(--color-active-bg);
          color: var(--color-primary);
          font-weight: 600;
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
        .integration-rows {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .integration-row {
          display: flex;
          gap: 16px;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .integration-row:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
        .integration-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .integration-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .integration-desc {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 2px 0 0 0;
        }
        .conn-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }
        .conn-status.green {
          color: var(--color-success);
          background: var(--color-success-subtle);
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
        }
        .avatar-circle-edit {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        .form-field {
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
          height: 36px;
          padding: 0 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-card);
          outline: none;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
