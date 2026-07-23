# Product Overview

> **Document Owner:** Product Team
> **Last Updated:** 2026-07-13
> **Status:** Active

---

## What Is Avenor?

Avenor is an **AI-Powered Career Management Platform** that helps job seekers manage their entire career journey from first application to signed offer — and beyond.

It replaces fragmented spreadsheets, email searches, and calendar events with a unified, intelligent platform.

---

## The Problem We Solve

Job seekers today manage their search across:
- A spreadsheet tracking applications
- Gmail threads they manually search
- Google Calendar for interview dates
- Notion or paper notes for interview prep
- Mental models for salary comparison

This is fragmented, error-prone, and stressful. Important follow-ups are missed. Offer deadlines slip by. Salary comparisons are done in the head.

Avenor makes this **automatic, organized, and intelligent**.

---

## Core User Value

| User Pain | Avenor Solution |
|---|---|
| "I forgot to follow up with Company X" | Automated follow-up reminders |
| "I can't find that interview confirmation email" | Gmail integration with AI classification |
| "I don't know which offer is actually better" | Total compensation comparison with offer analyzer |
| "My resume isn't working — I don't know why" | AI resume analysis with specific recommendations |
| "I wasted time tailoring a cover letter that took 2 hours" | AI cover letter generation in 30 seconds |
| "I don't know what interview rate I should expect" | Career analytics and funnel visualization |

---

## Feature Domains

### 1. Application Tracking
- Create, update, and track job applications
- Status pipeline (Applied → Screening → Interviewing → Offered → Decision)
- Timeline of all events per application
- Company and role information

### 2. Interview Management
- Track all interviews per application
- Interview types (phone, technical, behavioral, final)
- Interview notes and feedback
- Google Calendar sync
- AI-powered prep question generation

### 3. Gmail Integration
- Connect Gmail account
- Automatic email detection and classification
- Link emails to applications
- Rejection, offer, and interview invite detection

### 4. Document Management
- Resume storage with version history
- Cover letter library
- AI resume analysis (ATS compatibility, keywords, improvements)
- AI cover letter generation tailored to each role
- Link documents to specific applications

### 5. Salary & Offers
- Track salary expectations per application
- Record complete offer packages (base, equity, bonus, benefits)
- Total compensation calculator
- Side-by-side offer comparison
- Negotiation history tracking

### 6. Career Analytics
- Application funnel (applied → interviewed → offered rates)
- Average time-to-offer by industry / role type
- Monthly application volume
- Interview-to-offer conversion rate
- Salary trend visualization

### 7. Notifications & Reminders
- Follow-up reminders (configurable per application)
- Interview preparation reminders
- Offer deadline alerts
- Weekly summary digest

### 8. Expense Tracking
- Track job-search-related expenses
- Course, certification, and interview travel costs
- Tax deduction tracking

---

## User Personas

### Primary Persona: Active Job Seeker

**Alex, 28, Software Engineer**
- Applying to 10–20 companies simultaneously
- Spending 3+ hours/week managing the job search
- Main pain: losing track of where they are with each company
- Primary value: Application tracking + Gmail integration + reminders

### Secondary Persona: Passive Job Seeker

**Jordan, 35, Product Manager**
- Has a job, exploring opportunities
- Applying selectively (2–5 companies at a time)
- Main pain: Comparing compensation packages
- Primary value: Offer comparison + salary analytics

---

## Product Roadmap

| Phase | Timeline | Focus |
|---|---|---|
| Phase 1 | Foundation | Auth, application tracking, basic dashboard |
| Phase 2 | Communication | Gmail integration, email classification |
| Phase 3 | Intelligence | AI features (resume analysis, cover letters) |
| Phase 4 | Calendar | Google Calendar sync, interview scheduling |
| Phase 5 | Analytics | Career analytics dashboard |
| Phase 6 | Offers | Salary tracking, offer comparison |
| Phase 7 | Polish | Notifications, reminders, mobile optimization |

Full roadmap → [`roadmap.md`](./roadmap.md)

---

## Domain Specifications

Each domain has a detailed product specification:

- [`domains/applications.md`](./domains/applications.md) — Application tracking states and rules
- [`domains/interviews.md`](./domains/interviews.md) — Interview management rules
- [`domains/documents.md`](./domains/documents.md) — Document management and AI features
- [`domains/emails.md`](./domains/emails.md) — Gmail integration rules
- [`domains/analytics.md`](./domains/analytics.md) — Analytics metrics definitions
- [`domains/offers.md`](./domains/offers.md) — Offer comparison logic
- [`domains/salary.md`](./domains/salary.md) — Salary and expense tracking
