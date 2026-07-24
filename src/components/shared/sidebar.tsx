'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Calendar,
  Mail,
  FileText,
  BarChart2,
  Receipt,
  DollarSign,
  Target,
  Settings,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/emails', label: 'Emails', icon: Mail, badge: 12 },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/salary', label: 'Salary & Offers', icon: DollarSign },
  { href: '/goals', label: 'Goals', icon: Target },
]

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close drawer on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navContent = (
    <>
      {/* Logo */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--color-border)',
          gap: 10,
          flexShrink: 0,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/avenor-logo.png" alt="Avenor Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Avenor
          </span>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 12px',
                height: 40,
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-active-bg)' : 'transparent',
                transition: `background 120ms, color 120ms`,
                position: 'relative',
              }}
              className="sidebar-item"
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2 : 1.5}
                aria-hidden="true"
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  aria-label={`${item.badge} unread`}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                    lineHeight: '16px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '0 8px' }} />

      {/* Bottom items */}
      <div style={{ padding: '8px 8px 4px' }}>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 12px',
                height: 40,
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-active-bg)' : 'transparent',
              }}
              className="sidebar-item"
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* AI Assistant panel */}
      <div style={{ padding: '8px 12px 16px' }}>
        <Link
          href="/assistant"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Sparkles size={16} color="var(--color-primary)" strokeWidth={1.5} />
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-success)',
                border: '1px solid var(--color-surface)',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              AI Assistant
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Online</div>
          </div>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile Hamburger Button ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile Overlay Backdrop ── */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Desktop Sidebar (always visible ≥ 768px) ── */}
      <aside
        className="sidebar-desktop"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {navContent}
      </aside>

      {/* ── Mobile Drawer (slides in < 768px) ── */}
      <aside
        className={`sidebar-mobile-drawer ${isOpen ? 'open' : ''}`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {navContent}
      </aside>

      <style>{`
        /* ── Sidebar: Desktop ── */
        .sidebar-desktop {
          width: var(--sidebar-width);
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 200;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Sidebar: Mobile Drawer ── */
        .sidebar-mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          z-index: 1000;
          flex-direction: column;
          overflow: hidden;
          transform: translateX(-100%);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar-mobile-drawer.open {
          transform: translateX(0);
        }

        /* ── Overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(3px);
          z-index: 999;
        }

        /* ── Hamburger button ── */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 500;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-card);
          color: var(--color-text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        /* ── Close button inside drawer ── */
        .sidebar-close-btn {
          display: none;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-text-secondary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 120ms;
        }
        .sidebar-close-btn:hover {
          background: var(--color-hover-bg);
        }

        /* ── Nav hover states ── */
        .sidebar-item:hover {
          background: var(--color-hover-bg) !important;
          color: var(--color-text-primary) !important;
        }
        .sidebar-item[aria-current="page"]:hover {
          background: var(--color-active-bg) !important;
          color: var(--color-primary) !important;
        }

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }
          .sidebar-mobile-drawer {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .sidebar-close-btn {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
