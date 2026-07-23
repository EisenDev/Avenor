'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { signInAction } from '@/lib/actions/auth'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const result = await signInAction(formData)
      if (result && !result.success) {
        setError(result.error)
      } else {
        onClose()
        router.push('/overview')
        router.refresh()
      }
    })
  }

  return (
    <div
      className="signin-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div
        className="signin-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="signin-close" aria-label="Close">
          <X size={15} />
        </button>

        {/* Header */}
        <div className="signin-header">
          <div className="signin-logo-mark">
            <img src="/avenor-logo.png" alt="Avenor" className="signin-logo-img" />
          </div>
          <h2 className="signin-title">Welcome back</h2>
          <p className="signin-subtitle">Sign in to continue to Avenor</p>
        </div>

        {/* Google SSO */}
        <button className="signin-google-btn">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="signin-divider">
          <div className="signin-divider-line" />
          <span className="signin-divider-text">or</span>
          <div className="signin-divider-line" />
        </div>

        {/* Error */}
        {error && (
          <div className="signin-error">
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-field">
            <label className="signin-label">Email address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signin-input"
              autoComplete="email"
            />
          </div>

          <div className="signin-field">
            <div className="signin-label-row">
              <label className="signin-label">Password</label>
              <a href="#" className="signin-forgot">Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signin-input"
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signin-eye-btn"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="signin-submit-btn">
            {isPending ? (
              <span>Signing in…</span>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="signin-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup" onClick={onClose} className="signin-link">
            Create one
          </Link>
        </p>
      </div>

      <style>{`
        .signin-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(30, 20, 15, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 600;
          padding: 20px;
          animation: signin-fade-in 0.15s ease;
        }

        @keyframes signin-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .signin-panel {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 36px 32px 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: signin-slide-up 0.2s ease;
        }

        @keyframes signin-slide-up {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Close button */
        .signin-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: background var(--duration-fast), color var(--duration-fast);
        }
        .signin-close:hover {
          background: var(--color-hover-bg);
          color: var(--color-text-primary);
        }

        /* Header */
        .signin-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .signin-logo-mark {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--color-primary-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .signin-logo-img {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }
        .signin-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .signin-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        /* Google button */
        .signin-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 42px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background var(--duration-fast), border-color var(--duration-fast);
        }
        .signin-google-btn:hover {
          background: var(--color-surface);
          border-color: var(--color-border-focus);
        }

        /* Divider */
        .signin-divider {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .signin-divider-line {
          flex: 1;
          height: 1px;
          background: var(--color-border);
        }
        .signin-divider-text {
          font-size: 11px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Error */
        .signin-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-danger-subtle);
          border: 1px solid rgba(224, 122, 122, 0.3);
          border-radius: var(--radius-md);
          padding: 9px 12px;
          font-size: 12px;
          color: var(--color-danger);
          font-weight: 500;
        }

        /* Form */
        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .signin-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .signin-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .signin-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signin-forgot {
          font-size: 12px;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }
        .signin-forgot:hover {
          text-decoration: underline;
        }

        .signin-input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--color-text-primary);
          outline: none;
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }
        .signin-input::placeholder {
          color: var(--color-text-disabled);
        }
        .signin-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(181, 106, 69, 0.12);
        }

        .signin-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: 0;
          display: flex;
          align-items: center;
          transition: color var(--duration-fast);
        }
        .signin-eye-btn:hover {
          color: var(--color-text-primary);
        }

        /* Submit */
        .signin-submit-btn {
          width: 100%;
          height: 44px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(181,106,69,0.25), 0 4px 12px rgba(181,106,69,0.15);
          transition: background var(--duration-fast), box-shadow var(--duration-fast);
          margin-top: 2px;
        }
        .signin-submit-btn:hover:not(:disabled) {
          background: var(--color-primary-hover);
          box-shadow: 0 2px 6px rgba(181,106,69,0.3), 0 6px 16px rgba(181,106,69,0.2);
        }
        .signin-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Footer */
        .signin-footer {
          font-size: 13px;
          color: var(--color-text-secondary);
          text-align: center;
          margin: 0;
        }
        .signin-link {
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
        }
        .signin-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
