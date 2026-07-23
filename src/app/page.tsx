'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignInModal } from '@/components/auth/signin-modal'
import {
  Briefcase,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  BarChart2,
  Sparkles,
  Play,
  Menu,
  X,
} from 'lucide-react'

export default function LandingPage() {
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Briefcase,
      title: 'Application Tracking',
      desc: 'Track every application and its status in real time.',
    },
    {
      icon: Mail,
      title: 'AI Email Monitoring',
      desc: 'Let AI read and organize important emails so you never miss anything.',
    },
    {
      icon: MessageSquare,
      title: 'Interview Management',
      desc: 'Prepare better, track interviews, and never miss a follow-up.',
    },
    {
      icon: Calendar,
      title: 'Calendar Integration',
      desc: 'Sync interviews and deadlines with Google Calendar automatically.',
    },
    {
      icon: DollarSign,
      title: 'Salary & Offer Tracking',
      desc: 'Compare offers, track salary history, and make smarter decisions.',
    },
    {
      icon: BarChart2,
      title: 'Analytics & Insights',
      desc: "Visualize your progress and identify what's working (and what's not).",
    },
  ]

  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navigation Header */}
      <header className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/avenor-logo.png" alt="Avenor Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Avenor
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#how-it-works" className="nav-link">How it works</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
          <Link href="#resources" className="nav-link">Resources</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="desktop-actions">
          <button
            onClick={() => setIsSignInOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            className="login-btn"
          >
            Log in
          </button>
          <Link href="/signup" className="get-started-btn">
            Get started
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-trigger"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 0' }}>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">Features</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">How it works</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">Pricing</Link>
            <Link href="#resources" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">Resources</Link>
            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '10px 0' }} />
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setIsSignInOpen(true)
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                height: 44,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Log in
            </button>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="get-started-btn" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
              Get started
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Hero Content */}
          <div className="hero-left-content">
            <div
              style={{
                alignSelf: 'flex-start',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={12} />
              <span>AI-Powered Career Management</span>
            </div>

            <h1 className="hero-title">
              Your career,<br />
              organized.<br />
              Opportunities,<br />
              <span style={{ color: 'var(--color-primary)' }}>maximized.</span>
            </h1>

            <p
              style={{
                fontSize: 16,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                maxWidth: 480,
              }}
              className="hero-subtitle"
            >
              Avenor helps you manage applications, track interviews, organize offers, and grow your career with AI.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="get-started-btn hero-cta-btn">
                Get started for free
              </Link>

              <button className="sec-btn hero-cta-btn">
                <Play size={14} fill="currentColor" />
                <span>See how it works</span>
              </button>
            </div>
          </div>

          {/* Right Hero / Visual mockup */}
          <div className="hero-right-visual">
            {/* Card Mockup 1: Upcoming Interview */}
            <div className="hero-card upcoming-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Upcoming Interview
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-secondary)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img
                  src="/avenor-logo.png"
                  alt="Company Logo"
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                  }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Acme Corporation
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                    Senior Frontend Engineer
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'left' }}>
                Jul 18, 2026 • 10:00 AM
              </div>
              <button
                style={{
                  width: '100%',
                  height: 32,
                  background: 'var(--color-surface)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                }}
              >
                View details
              </button>
            </div>

            {/* Bottom Row containing Progress card and Status list card */}
            <div className="hero-cards-row">
              {/* Card Mockup 2: Progress */}
              <div className="hero-card progress-card">
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', textAlign: 'left' }}>
                  Application Progress
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      border: '5px solid var(--color-primary)',
                      borderRightColor: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    68%
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>In progress</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>24 Active</span>
                  </div>
                </div>
              </div>

              {/* Card Mockup 3: Status list */}
              <div className="hero-card status-list-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>● Wishlist</span>
                  <span style={{ fontWeight: 600 }}>8</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-primary)' }}>● Applied</span>
                  <span style={{ fontWeight: 600 }}>24</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-secondary)' }}>● Interview</span>
                  <span style={{ fontWeight: 600 }}>5</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--color-warning)' }}>● Offer</span>
                  <span style={{ fontWeight: 600 }}>2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By logo strip */}
      <section className="trusted-section">
        <div className="trusted-container">
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)' }}>
            Integrates seamlessly with
          </span>
          <div className="trusted-logos">
            <span>Google</span>
            <span>Microsoft</span>
            <span>Stripe</span>
            <span>Amazon</span>
            <span>Notion</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div style={{ textAlign: 'center', marginBottom: 50, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Everything you need in{' '}
            <span style={{ color: 'var(--color-primary)' }}>one place</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
            Avenor combines status pipelines, automated syncs, and intelligent analysis to simplify your job search.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Let AI handle background with Matters.png */}
      <section style={{ padding: '0 24px 60px' }} className="cta-banner-section">
        <div className="cta-banner-container">
          <h2 style={{ fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }} className="cta-banner-title">
            Let AI handle the busywork,<br />
            so you can focus on what matters.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 500 }} className="cta-banner-desc">
            Avenor's AI assistant helps you stay on top of opportunities, follow ups, and next steps — automatically.
          </p>
        </div>
      </section>

      {/* Complete Mockup Footer */}
      <footer className="footer-section">
        <div className="footer-grid">
          {/* Logo & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="footer-info-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/avenor-logo.png" alt="Avenor Logo" style={{ width: 28, height: 28 }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Avenor
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              AI-powered career management platform that helps you stay organized, save time, and grow your career.
            </p>
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Discord">
                <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.2,77.2,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.2,77.2,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,69.43,69.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.81.71,1.68,1.4,2.58,2a69.43,69.43,0,0,1-10.5,5A77.7,77.7,0,0,0,95.14,96.36a105.73,105.73,0,0,0,31-18.83C129.87,50.7,123.63,27.86,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.42,65.69,73.25,60,73.25,53S78.42,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <a href="#" className="footer-link">Features</a>
              <a href="#" className="footer-link">How it works</a>
              <a href="#" className="footer-link">Pricing</a>
              <a href="#" className="footer-link">Updates</a>
            </div>
          </div>

          {/* Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Guides</a>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Templates</a>
            </div>
          </div>

          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <a href="#" className="footer-link">About us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>

          {/* CTA Box */}
          <div className="footer-cta-card">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              Ready to take control<br />of your career?
            </h4>
            <Link
              href="/signup"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-primary-btn)',
                display: 'block',
                width: '100%',
                transition: 'background var(--duration-fast)',
              }}
              className="get-started-btn"
            >
              Get started for free
            </Link>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              No credit card required.
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginTop: 30,
          }}
        >
          © 2026 Avenor. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToSignUp={() => {}}
      />

      <style>{`
        .header-container {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 50;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .desktop-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .mobile-menu-trigger {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-text-primary);
          padding: 4px;
        }

        .mobile-drawer {
          position: fixed;
          top: 80px;
          left: 0;
          width: 100%;
          background: var(--color-card);
          border-bottom: 1px solid var(--color-border);
          padding: 16px 24px;
          box-shadow: var(--shadow-md);
          z-index: 45;
        }

        .nav-link {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color var(--duration-fast);
        }
        .nav-link:hover {
          color: var(--color-text-primary);
        }

        .nav-link-mobile {
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .login-btn:hover {
          color: var(--color-text-primary);
        }

        .get-started-btn {
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-md);
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: var(--shadow-primary-btn);
          border: none;
          cursor: pointer;
          transition: background var(--duration-fast);
          display: inline-block;
        }
        .get-started-btn:hover {
          background: var(--color-primary-hover) !important;
        }

        .sec-btn {
          background: var(--color-card);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8;
          box-shadow: var(--shadow-sm);
          transition: background var(--duration-fast);
        }
        .sec-btn:hover {
          background: var(--color-surface) !important;
        }

        /* Hero Layout */
        .hero-section {
          background-color: var(--color-bg-primary); /* Sets background color explicitly to warm bone white */
          background-image: url(/avenor-herosection-base.png);
          background-size: auto 82%; /* Scales down the background illustration to keep it properly sized */
          background-position: right 4% bottom; /* Positions background plant and circles exactly behind card area */
          background-repeat: no-repeat;
          min-height: 90vh;
          display: flex;
          align-items: center;
          margin-top: -80px;
          padding-top: 100px;
          padding-bottom: 40px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 -40px 40px -40px rgba(181, 106, 69, 0.12); /* Bottom transition inset shadow */
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 48px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 40px;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .hero-left-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 10;
        }

        .hero-right-visual {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 20px;
          position: relative;
          z-index: 15; /* Sits on top of background illustration */
          max-width: 400px;
          margin-left: auto;
        }

        .hero-title {
          font-size: 52px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.1;
          letter-spacing: -0.025em;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
        }

        .hero-cta-btn {
          flex-shrink: 0;
        }

        .hero-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
        }

        .upcoming-card {
          padding: 20px;
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-right: 40px;
        }

        .hero-cards-row {
          display: flex;
          gap: 16px;
          align-items: stretch;
          width: 100%;
          justify-content: flex-end;
        }

        .progress-card {
          padding: 20px;
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
        }

        .status-list-card {
          padding: 20px;
          width: 180px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        /* Trusted By */
        .trusted-section {
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-primary);
          padding: 32px 0;
        }

        .trusted-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 48px;
        }

        .trusted-logos {
          display: flex;
          gap: 40px;
          font-size: 16px;
          font-weight: 700;
          opacity: 0.6;
        }

        /* Features */
        .features-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 100px 48px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* CTA matters banner */
        .cta-banner-container {
          max-width: 1280px;
          margin: 0 auto;
          background-image: url(/Matters.png);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: var(--radius-xl);
          padding: 100px 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          box-shadow: var(--shadow-md);
        }

        .cta-banner-title {
          font-size: 32px;
        }

        /* Footer */
        .footer-section {
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-primary);
          padding: 80px 48px 40px;
        }

        .footer-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 0.8fr 0.8fr 1.4fr;
          gap: 40px;
          padding-bottom: 60px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .footer-link {
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--duration-fast);
        }
        .footer-link:hover {
          color: var(--color-text-primary);
        }

        .social-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          background: var(--color-card);
          transition: color var(--duration-fast), background var(--duration-fast);
        }
        .social-icon:hover {
          color: var(--color-text-primary);
          background: var(--color-surface);
        }

        .footer-cta-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          text-align: center;
        }

        /* ── RESPONSIVE DESIGN (MEDIA QUERIES) ──────────────────── */

        @media (max-width: 1024px) {
          .header-container {
            padding: 0 24px;
          }

          .hero-section {
            background-size: cover;
            background-position: center bottom;
            min-height: auto;
            padding-top: 120px;
            padding-bottom: 60px;
            box-shadow: inset 0 -20px 20px -20px rgba(181, 106, 69, 0.12);
          }

          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 40px 24px;
            gap: 48px;
          }

          .hero-left-content {
            align-items: center;
          }

          .hero-eyebrow {
            align-self: center !important;
          }

          .hero-right-visual {
            padding-left: 0;
            align-items: center;
            margin-right: auto;
          }

          .upcoming-card {
            margin-right: 0;
          }

          .features-section {
            padding: 80px 24px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cta-banner-container {
            padding: 80px 24px;
          }

          .footer-section {
            padding: 60px 24px 30px;
          }

          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }

          .footer-info-col {
            grid-column: span 3;
          }

          .footer-cta-card {
            grid-column: span 3;
          }
        }

        @media (max-width: 768px) {
          .desktop-nav,
          .desktop-actions {
            display: none;
          }

          .mobile-menu-trigger {
            display: block;
          }

          .hero-title {
            font-size: 38px;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .hero-cta-btn {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .sec-btn {
            width: 100%;
            justify-content: center;
          }

          .hero-cards-row {
            flex-direction: column;
            width: 320px;
          }

          .progress-card,
          .status-list-card {
            width: 100%;
          }

          .trusted-section {
            padding: 24px 0;
          }

          .trusted-container {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            padding: 0 24px;
          }

          .trusted-logos {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .cta-banner-title {
            font-size: 24px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-info-col,
          .footer-cta-card {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  )
}
