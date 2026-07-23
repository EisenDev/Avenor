'use client'

import { useState, useTransition, useEffect } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Target, Sparkles, Award, Play, Edit3, X, Loader2, Check } from 'lucide-react'
import { updateGoalTargetsAction, getAICoachingAction } from '@/lib/actions/goal'

interface GoalItem {
  title: string
  current: string | number
  target: string | number
  percentage: number
  label: string
  desc: string
  unit: string
}

interface AchievementItem {
  id: number
  title: string
  date: string
  active: boolean
  icon: string
}

interface GoalsClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  goals: GoalItem[]
  achievements: AchievementItem[]
  weeklyData: Array<{ name: string; apps: number }>
  streak: number
  streakDays: Array<{ day: string; filled: boolean }>
  aiCoachAdvice: string
  targets: {
    targetApplications: number
    targetInterviews: number
    targetOffers: number
    targetSalary: number
  }
}

export function GoalsClient({
  user,
  goals,
  achievements,
  weeklyData,
  streak,
  streakDays,
  aiCoachAdvice,
  targets,
}: GoalsClientProps) {
  const [localCoachAdvice, setLocalCoachAdvice] = useState(aiCoachAdvice)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Coaching loading state
  const [isCoachingPending, setIsCoachingPending] = useState(false)

  // Edit targets form states
  const [targetApplications, setTargetApplications] = useState(targets.targetApplications.toString())
  const [targetInterviews, setTargetInterviews] = useState(targets.targetInterviews.toString())
  const [targetOffers, setTargetOffers] = useState(targets.targetOffers.toString())
  const [targetSalary, setTargetSalary] = useState(targets.targetSalary.toString())
  const [formError, setFormError] = useState<string | null>(null)

  // Trigger Gemini AI Coach
  const handleGetAICoaching = async () => {
    setIsCoachingPending(true)
    try {
      const res = await getAICoachingAction()
      if (!res.success) {
        alert(res.error)
      } else {
        setLocalCoachAdvice(res.data || 'Your search pipeline looks steady.')
      }
    } catch (err) {
      alert('Failed to get career advice.')
    } finally {
      setIsCoachingPending(false)
    }
  }

  // Submit new targets
  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const apps = parseInt(targetApplications)
    const ints = parseInt(targetInterviews)
    const offs = parseInt(targetOffers)
    const sal = parseFloat(targetSalary)

    if (isNaN(apps) || apps <= 0 || isNaN(ints) || ints <= 0 || isNaN(offs) || offs <= 0 || isNaN(sal) || sal <= 0) {
      setFormError('All target values must be positive numbers.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('targetApplications', apps.toString())
      formData.append('targetInterviews', ints.toString())
      formData.append('targetOffers', offs.toString())
      formData.append('targetSalary', sal.toString())

      const res = await updateGoalTargetsAction(formData)
      if (!res.success) {
        setFormError(res.error)
      } else {
        setIsEditModalOpen(false)
      }
    })
  }

  return (
    <>
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
                  <h1 className="page-title">Goals</h1>
                  <p className="page-subtitle">Define, track, and optimize your career objective checkpoints.</p>
                </div>
                <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)}>
                  <Edit3 size={14} />
                  <span>Edit Targets</span>
                </button>
              </div>

              {/* Streak card */}
              <div className="content-card streak-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>🔥</span>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                      {streak}-Day Application Streak
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {streak > 0 
                        ? `You have submitted at least one application consecutively. Keep up the momentum!` 
                        : 'No submissions recorded in the last 2 days. Start applying to lock in your daily streak!'}
                    </p>
                  </div>
                </div>
                <div className="streak-days" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {streakDays.map((day, idx) => (
                    <div key={idx} className={`streak-day-dot ${day.filled ? 'filled' : ''}`}>
                      <span>{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal Grid */}
              <div className="goals-grid">
                {goals.map((goal, idx) => (
                  <div key={idx} className="content-card goal-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="goal-tag">{goal.title}</span>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '6px 0 0 0' }}>{goal.label}</h3>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>
                        {goal.percentage}%
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>{goal.desc}</p>
                    
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        <span>Current: {goal.current}</span>
                        <span>Target: {goal.target}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 99 }}>
                        <div style={{ width: `${Math.min(goal.percentage, 100)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Activity bar chart */}
              <div className="content-card">
                <h3>Weekly Submissions Volume</h3>
                <div style={{ width: '100%', height: 160, marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                      <Bar dataKey="apps" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* AI Coach */}
              <div className="content-card ai-goals-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="var(--color-primary)" />
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                    AI Coach Insight
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                  {localCoachAdvice || 'Your search pipeline is warming up. Get custom coaching to analyze your conversion metrics!'}
                </p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', height: 32, fontSize: 11, justifyContent: 'center', marginTop: 12 }}
                  onClick={handleGetAICoaching}
                  disabled={isCoachingPending}
                >
                  {isCoachingPending ? (
                    <>
                      <Loader2 size={12} className="animate-spin" style={{ marginRight: 6 }} />
                      <span>Coaching...</span>
                    </>
                  ) : (
                    <span>Get AI Coaching</span>
                  )}
                </button>
              </div>

              {/* Achievements */}
              <div className="content-card">
                <h3>Achievements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {achievements.map((item) => (
                    <div key={item.id} className={`achievement-item ${!item.active ? 'locked' : ''}`}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Edit Targets Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Edit Goals & Targets</h2>
              <p className="modal-subtitle">Update your personal target benchmarks for the current job search</p>
            </div>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-danger-subtle)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
                <X size={14} style={{ marginRight: 6 }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTargets} className="modal-form">
              <div className="form-group">
                <label className="form-label">Target Applications (Jobs)</label>
                <input type="number" required placeholder="50" className="form-input" value={targetApplications} onChange={(e) => setTargetApplications(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Interviews (Count)</label>
                <input type="number" required placeholder="10" className="form-input" value={targetInterviews} onChange={(e) => setTargetInterviews(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Offers (Count)</label>
                <input type="number" required placeholder="3" className="form-input" value={targetOffers} onChange={(e) => setTargetOffers(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Salary Base ($/yr)</label>
                <input type="number" required placeholder="150000" className="form-input" value={targetSalary} onChange={(e) => setTargetSalary(e.target.value)} />
              </div>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={isPending}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Targets</span>
                  )}
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
        .streak-card {
          border-left: 4px solid var(--color-primary);
        }
        .streak-day-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-secondary);
        }
        .streak-day-dot.filled {
          background: var(--color-primary);
          color: white;
        }
        .goals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .goal-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          background: var(--color-primary-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          text-transform: uppercase;
        }
        .ai-goals-card {
          border-left: 3px solid var(--color-primary);
        }
        .achievement-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .achievement-item.locked {
          opacity: 0.5;
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
