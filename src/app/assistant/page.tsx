'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Bookmark,
  FileText,
  Calendar,
  DollarSign,
  ChevronRight,
  TrendingUp
} from 'lucide-react'

export default function AIAssistantPage() {
  const [activeMode, setActiveMode] = useState<string>('Career Chat')
  const [inputVal, setInputVal] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'I have an interview at Google on July 18th for SWE II. Can you help me prepare?'
    },
    {
      sender: 'ai',
      text: 'Congratulations! Google SWE II interviews focus heavily on system design, data structures, and behavioral alignment. Here is a baseline prep plan:\n\n1. **Technical**: Focus on tree traversals, dynamic programming, and hash table design. Google interviewers look for optimal time/space complexity analysis.\n2. **System Design**: Google values scaling. Practice designing rate limiters, global CDNs, and high-throughput logging collectors.\n3. **Behavioral**: Align your stories with Google core values (collaboration, resilience, and product innovation).'
    },
    {
      sender: 'user',
      text: 'What are the most common system design questions at Google?'
    },
    {
      sender: 'ai',
      text: 'Based on recent candidate reports, Google system design panels frequently ask:\n\n1. **Design a Web Crawler**: Focus on URL deduplication, crawl politeness, and multi-threaded scaling.\n2. **Design Google Drive Sync**: Emphasize differential chunking, storage synchronization, and offline mode capabilities.\n3. **Design a Rate Limiter**: Talk about token bucket algorithms, Redis cache distribution, and handling edge network spikes.'
    }
  ])

  const handleSend = () => {
    if (!inputVal.trim()) return
    setMessages(prev => [...prev, { sender: 'user', text: inputVal }])
    setInputVal('')

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'That is a great follow-up. I would recommend building a mock design trace for this scenario to practice your structure.'
      }])
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header user={{ name: 'Demo User', email: 'demo@avenor.app' }} />
        <main style={{ padding: 0, flex: 1, display: 'flex', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
          
          {/* Left: Chat Modes Navigation */}
          <div className="assistant-sidebar">
            <div style={{ padding: 16 }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={14} />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="nav-section">
              <span className="section-title">AI Modes</span>
              <div className="mode-list">
                {[
                  { name: 'Career Chat', icon: Sparkles },
                  { name: 'Resume Review', icon: FileText },
                  { name: 'Interview Practice', icon: MessageSquare },
                  { name: 'Salary Advice', icon: DollarSign }
                ].map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.name}
                      className={`mode-btn ${activeMode === mode.name ? 'active' : ''}`}
                      onClick={() => setActiveMode(mode.name)}
                    >
                      <Icon size={14} />
                      <span>{mode.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="nav-section" style={{ marginTop: 16 }}>
              <span className="section-title">Recent Conversations</span>
              <div className="recent-list">
                <button className="recent-btn"><MessageSquare size={13} /><span>Prepare Google Interview</span></button>
                <button className="recent-btn"><MessageSquare size={13} /><span>Review Resume draft</span></button>
                <button className="recent-btn"><MessageSquare size={13} /><span>Negotiate Stripe offer</span></button>
              </div>
            </div>
          </div>

          {/* Middle: Chat Workspace Area */}
          <div className="chat-workspace">
            {/* Header */}
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{activeMode}</span>
                <span className="status-dot" />
              </div>
            </div>

            {/* Message Area */}
            <div className="messages-area">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                  {msg.sender === 'ai' && (
                    <div className="ai-avatar">✦</div>
                  )}
                  <div className="bubble-content">
                    {msg.text.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} style={{ margin: '0 0 8px 0' }}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="chat-input-container">
              <div className="suggested-chips">
                <button className="chip" onClick={() => setInputVal('Generate system design checklist')}>System design checklist</button>
                <button className="chip" onClick={() => setInputVal('Common behavioral questions')}>Behavioral questions</button>
              </div>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Ask Avenor AI anything about your career path..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend}><Send size={14} /></button>
              </div>
            </div>
          </div>

          {/* Right: Context Sidebar */}
          <div className="context-sidebar">
            <span className="context-title">Active Context</span>

            {/* Application ref */}
            <div className="context-card">
              <span className="card-label">Referenced Application</span>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Google</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Software Engineer II • Interview</div>
            </div>

            {/* Documents ref */}
            <div className="context-card">
              <span className="card-label">Documents Sync</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <FileText size={12} />
                  <span>Resume_Frontend_v3.pdf</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <FileText size={12} />
                  <span>CL_Google_SWE.pdf</span>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="context-card ai-tips-card">
              <span className="card-label" style={{ color: 'var(--color-primary)' }}>AI Prep Tasks</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <div className="task-row">
                  <Calendar size={12} />
                  <span>Schedule prep session</span>
                </div>
                <div className="task-row">
                  <MessageSquare size={12} />
                  <span>Practice 5 behavioral Qs</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      <style>{`
        .assistant-sidebar {
          width: 240px;
          border-right: 1px solid var(--color-border);
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
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
        .nav-section {
          padding: 0 12px;
        }
        .section-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 8px;
        }
        .mode-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--duration-fast), color var(--duration-fast);
          text-align: left;
        }
        .mode-btn:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }
        .mode-btn.active {
          background: var(--color-active-bg);
          color: var(--color-primary);
          font-weight: 600;
        }
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .recent-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 28px;
          padding: 0 8px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 11px;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recent-btn:hover {
          color: var(--color-text-primary);
        }
        .chat-workspace {
          flex: 1;
          background: var(--color-card);
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          height: 48px;
          border-bottom: 1px solid var(--color-border-subtle);
          padding: 0 16px;
          display: flex;
          align-items: center;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-success);
          margin-left: 4px;
        }
        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message-bubble {
          display: flex;
          gap: 12px;
          max-width: 80%;
          font-size: 13px;
          line-height: 1.5;
        }
        .message-bubble.ai {
          align-self: flex-start;
        }
        .message-bubble.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .ai-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-primary-subtle);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        .bubble-content {
          padding: 10px 14px;
          border-radius: var(--radius-lg);
        }
        .message-bubble.ai .bubble-content {
          background: var(--color-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-subtle);
        }
        .message-bubble.user .bubble-content {
          background: var(--color-primary);
          color: white;
        }
        .chat-input-container {
          padding: 16px;
          border-top: 1px solid var(--color-border-subtle);
        }
        .suggested-chips {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .chip {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 4px 10px;
          font-size: 11px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: background var(--duration-fast);
        }
        .chip:hover {
          background: var(--color-hover-bg);
          color: var(--color-primary);
        }
        .input-row {
          display: flex;
          gap: 8px;
        }
        .input-row input {
          flex: 1;
          height: 38px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0 14px;
          outline: none;
          font-size: 13px;
        }
        .send-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .context-sidebar {
          width: 240px;
          border-left: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .context-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .context-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 12px;
        }
        .card-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
        }
        .ai-tips-card {
          border-left: 3px solid var(--color-primary);
        }
        .task-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }
      `}</style>
    </div>
  )
}
