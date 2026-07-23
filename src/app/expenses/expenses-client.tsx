'use client'

import { useState, useTransition, useEffect } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Plus, Download, Receipt, Sparkles, X, Loader2, Edit3 } from 'lucide-react'
import { addExpenseAction, updateBudgetAction } from '@/lib/actions/expense'

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Hide labels for very small slices to look clean

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface ExpenseItem {
  id: string
  date: Date | string
  category: string
  description: string
  amount: number
  receiptPath?: string | null
}

interface ExpensesClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expenses: ExpenseItem[]
  budgetLimit: number
  stats: {
    totalSpentThisMonth: number
    totalTransportation: number
    totalFoodCoffee: number
    percentUsed: number
    pieData: Array<{ name: string; value: number; color: string }>
  }
}

function getCategoryColor(category: string) {
  const cat = category.toLowerCase()
  if (cat.includes('transport') || cat === 'transportation') {
    return { color: 'var(--color-info)', bg: 'var(--color-info-subtle)' }
  }
  if (cat === 'food' || cat === 'coffee' || cat.includes('meal') || cat.includes('coffee') || cat.includes('food')) {
    return { color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' }
  }
  if (cat.includes('cert') || cat.includes('course') || cat.includes('exam')) {
    return { color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' }
  }
  if (cat.includes('sub') || cat.includes('premium')) {
    return { color: 'var(--color-danger)', bg: 'var(--color-danger-subtle)' }
  }
  return { color: 'var(--color-text-secondary)', bg: 'var(--color-muted)' }
}

export function ExpensesClient({ user, expenses, budgetLimit, stats }: ExpensesClientProps) {
  const [localExpenses, setLocalExpenses] = useState<ExpenseItem[]>(expenses)
  const [localBudgetLimit, setLocalBudgetLimit] = useState<number>(budgetLimit)
  const [isPending, startTransition] = useTransition()

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)

  // Add Expense form states
  const [category, setCategory] = useState('Transportation')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10))
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Edit Budget form states
  const [newBudgetLimit, setNewBudgetLimit] = useState(budgetLimit.toString())
  const [budgetModalError, setBudgetModalError] = useState<string | null>(null)

  // Sync props to state when props change
  useEffect(() => {
    setLocalExpenses(expenses)
  }, [expenses])

  useEffect(() => {
    setLocalBudgetLimit(budgetLimit)
    setNewBudgetLimit(budgetLimit.toString())
  }, [budgetLimit])

  // Recalculate quick dashboard metrics based on real-time client state
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const thisMonthSpent = localExpenses
    .filter((exp) => new Date(exp.date) >= thisMonthStart)
    .reduce((sum, exp) => sum + exp.amount, 0)

  const thisMonthTransportation = localExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const cat = exp.category.toLowerCase()
      return expDate >= thisMonthStart && (cat.includes('transport') || cat === 'transportation')
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const thisMonthFoodCoffee = localExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const cat = exp.category.toLowerCase()
      return expDate >= thisMonthStart && (cat === 'food' || cat === 'coffee' || cat.includes('meal') || cat.includes('coffee') || cat.includes('food'))
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const percentUsed = localBudgetLimit > 0 ? Math.round((thisMonthSpent / localBudgetLimit) * 100) : 0

  // Category chart recalculations based on real-time state
  const categorySums: Record<string, number> = {}
  localExpenses.forEach((exp) => {
    const cat = exp.category
    categorySums[cat] = (categorySums[cat] || 0) + exp.amount
  })

  // Format chart data matching the static labels
  const categoriesList = [
    { name: 'Certifications', match: ['certification', 'cert', 'course', 'exam'], color: 'var(--color-primary)' },
    { name: 'Transportation', match: ['transportation', 'transport', 'uber', 'train', 'bus'], color: 'var(--color-info)' },
    { name: 'Subscriptions', match: ['subscription', 'premium', 'sub'], color: 'var(--color-danger)' },
    { name: 'Food & Coffee', match: ['food', 'coffee', 'meal', 'lunch', 'cafe'], color: 'var(--color-warning)' },
  ]

  let categorizedSum = 0
  const finalPieData = categoriesList.map((item) => {
    let sum = 0
    Object.entries(categorySums).forEach(([cat, val]) => {
      const match = item.match.some((m) => cat.toLowerCase().includes(m))
      if (match) {
        sum += val
      }
    })
    categorizedSum += sum
    return { name: item.name, value: sum, color: item.color }
  })

  // Add the "Other" slice for leftover sums
  const totalAllSum = localExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const otherSum = Math.max(0, totalAllSum - categorizedSum)
  finalPieData.push({ name: 'Other', value: otherSum, color: 'var(--color-text-disabled)' })

  // Filter out zero categories for clean chart
  const activePieData = finalPieData.filter((item) => item.value > 0)

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Receipt Path']
    const csvRows = [headers.join(',')]

    for (const exp of localExpenses) {
      const formattedDate = new Date(exp.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const row = [
        `"${formattedDate}"`,
        `"${exp.category}"`,
        `"${exp.description.replace(/"/g, '""')}"`,
        exp.amount.toFixed(2),
        exp.receiptPath ? `"${exp.receiptPath}"` : '""',
      ]
      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `avenor_expenses_${new Date().toISOString().substring(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle new expense form submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!description.trim()) {
      setModalError('Please enter a description.')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError('Please enter a valid positive amount.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('category', category)
      formData.append('description', description)
      formData.append('amount', parsedAmount.toString())
      formData.append('date', date)
      if (receiptFile) {
        formData.append('receipt', receiptFile)
      }

      const res = await addExpenseAction(formData)
      if (!res.success) {
        setModalError(res.error)
      } else {
        // Prepend new expense immediately in client UI
        setLocalExpenses((prev) => [res.data, ...prev])

        // Reset form and close
        setDescription('')
        setAmount('')
        setReceiptFile(null)
        setIsAddModalOpen(false)
      }
    })
  }

  // Handle budget edit form submit
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBudgetModalError(null)

    const parsedLimit = parseFloat(newBudgetLimit)
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setBudgetModalError('Please enter a valid budget limit greater than zero.')
      return
    }

    startTransition(async () => {
      const res = await updateBudgetAction(parsedLimit)
      if (!res.success) {
        setBudgetModalError(res.error)
      } else {
        setLocalBudgetLimit(parsedLimit)
        setIsBudgetModalOpen(false)
      }
    })
  }

  const formatMonthDateRange = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayStr = firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${firstDayStr} - ${todayStr}`
  }

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
              <h1 className="page-title">Expenses</h1>
              <p className="page-subtitle">Track and report your job application costs.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={handleExportCSV}>
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics row */}
          <div className="metrics-grid">
            <div className="content-card metric-box">
              <span className="metric-label">Total spent this month</span>
              <span className="metric-value">${thisMonthSpent.toFixed(2)}</span>
              <span className="metric-note">{formatMonthDateRange()}</span>
            </div>
            <div className="content-card metric-box">
              <span className="metric-label">Transportation</span>
              <span className="metric-value">${thisMonthTransportation.toFixed(2)}</span>
              <span className="metric-note">Uber, Train, Bus</span>
            </div>
            <div className="content-card metric-box">
              <span className="metric-label">Food & Coffee</span>
              <span className="metric-value">${thisMonthFoodCoffee.toFixed(2)}</span>
              <span className="metric-note">Pre-interview meals</span>
            </div>
            <div className="content-card budget-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label">Monthly Budget</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>{percentUsed}% USED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span className="metric-value">${thisMonthSpent.toFixed(2)} / ${localBudgetLimit.toFixed(0)}</span>
                <button 
                  className="edit-budget-btn" 
                  onClick={() => {
                    setBudgetModalError(null)
                    setIsBudgetModalOpen(true)
                  }}
                  title="Edit Budget Limit"
                >
                  <Edit3 size={12} />
                </button>
              </div>
              <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, percentUsed)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99 }} />
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            
            {/* Left: Expenses Table */}
            <div className="content-card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
              <div className="table-header">
                <span>Date</span>
                <span>Category</span>
                <span>Description</span>
                <span>Amount</span>
                <span style={{ textAlign: 'center' }}>Receipt</span>
              </div>
              {localExpenses.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, fontStyle: 'italic' }}>
                  No expenses logged yet. Click "Add Expense" to get started!
                </div>
              ) : (
                <div className="table-body">
                  {localExpenses.map((exp) => {
                    const { color, bg } = getCategoryColor(exp.category)
                    const formattedDate = new Date(exp.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                    return (
                      <div key={exp.id} className="table-row">
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{formattedDate}</span>
                        <div>
                          <span className="category-pill" style={{ color, background: bg }}>
                            {exp.category}
                          </span>
                        </div>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{exp.description}</span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
                          ${exp.amount.toFixed(2)}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          {exp.receiptPath ? (
                            <a 
                              href={exp.receiptPath} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="receipt-badge" 
                              title="View receipt file"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Receipt size={12} />
                              <span>PDF</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>—</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Pie Distribution Chart */}
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="content-card">
                <h3>Category Breakdown</h3>
                <div style={{ width: '100%', height: 160, marginTop: 12 }}>
                  {activePieData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: 12, fontStyle: 'italic' }}>
                      No expenses in breakdown.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={65}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {activePieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {finalPieData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Add Expense</h2>
              <p className="modal-subtitle">Log a job-hunting expense for tracking and tax reports</p>
            </div>

            {modalError && (
              <div className="modal-error-banner" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-danger-subtle)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
                <X size={14} style={{ marginRight: 6 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Transportation">Transportation</option>
                  <option value="Food">Food</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Certification">Certification</option>
                  <option value="Internet">Internet</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Printing">Printing</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Train to Google HQ"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Receipt File (PDF/Image - Optional)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  style={{ paddingTop: 8 }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Cost</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {isBudgetModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBudgetModalOpen(false)}>
          <div className="modal-content-wrapper animate-slide-up" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsBudgetModalOpen(false)}>
              <X size={16} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Edit Monthly Budget</h2>
              <p className="modal-subtitle">Update your monthly spending allowance for job hunts</p>
            </div>

            {budgetModalError && (
              <div className="modal-error-banner" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-danger-subtle)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>
                <X size={14} style={{ marginRight: 6 }} />
                <span>{budgetModalError}</span>
              </div>
            )}

            <form onSubmit={handleBudgetSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Monthly Limit ($) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="500"
                  className="form-input"
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsBudgetModalOpen(false)}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Budget</span>
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
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 20px;
        }
        .budget-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 20px;
        }
        .metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .metric-note {
          font-size: 11px;
          color: var(--color-text-secondary);
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
        .table-header {
          display: grid;
          grid-template-columns: 80px 140px 1fr 100px 80px;
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
        .table-body {
          max-height: 500px;
          overflow-y: auto;
        }
        .table-row {
          display: grid;
          grid-template-columns: 80px 140px 1fr 100px 80px;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border-subtle);
          font-size: 13px;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .category-pill {
          display: inline-flex;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          text-transform: uppercase;
        }
        .receipt-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          background: var(--color-primary-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          transition: background 0.15s ease;
        }
        .receipt-badge:hover {
          background: var(--color-primary-hover-subtle, #f0dfda);
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .ai-expense-card {
          border-left: 3px solid var(--color-primary);
        }
        .edit-budget-btn {
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
        .edit-budget-btn:hover {
          background: var(--color-surface);
          color: var(--color-primary);
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
