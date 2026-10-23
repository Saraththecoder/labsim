# LabSim — Complete SaaS Architecture & Transformation Blueprint

This document details the architectural, technical, product, and business components required to transform **LabSim (Virtual Science Laboratory & AR Studio)** into a scalable, enterprise-ready **Software-as-a-Service (SaaS)** platform.

---

## 1. Business & Revenue Model

LabSim is uniquely positioned for a **Hybrid B2B + B2C SaaS Model**:

```
                              ┌─────────────────────────────┐
                              │       LabSim Platform       │
                              └──────────────┬──────────────┘
                                             │
             ┌───────────────────────────────┼──────────────────────────────┐
             ▼                               ▼                              ▼
 ┌────────────────────────┐      ┌────────────────────────┐     ┌────────────────────────┐
 │   B2B School License   │      │   B2C Student Pro      │     │   B2G Government/ATL   │
 │ ₹25,000 - ₹75,000/yr   │      │   ₹149/mo or ₹999/yr   │     │   Tenders & Grants     │
 └────────────────────────┘      └────────────────────────┘     └────────────────────────┘
```

### 1.1 B2B School Tier (Primary Revenue Engine — 80% ARR)
- **Target Buyer**: School Principals, Science Department HODs, School Trust Trustees.
- **Value Proposition**:
  - Saves ₹3,00,000+ annually on glassware breakage, burnt ammeters, chemical restocking, and lab maintenance.
  - Zero chemical hazard risk; complies with CBSE/State practical mandates.
  - 100% of students complete mandatory experiments even with limited lab periods.
- **Pricing**:
  - *Tier 1 (Up to 250 students)*: ₹25,000 / year.
  - *Tier 2 (Up to 1,000 students)*: ₹50,000 / year.
  - *Enterprise (Multiple campuses)*: Custom quote with SLA and teacher training.

### 1.2 B2C Student Pro Tier (High-Volume Self-Serve — 20% ARR)
- **Target Buyer**: High school students (Classes 9–12) and parents preparing for CBSE, ICSE, and State Board exams.
- **Value Proposition**: "Master all 15 board practicals and crack the 20-mark practical viva without needing a physical lab."
- **Pricing**: ₹149/month or ₹999/year.

---

## 2. Multi-Tenant Architecture & Role-Based Access Control (RBAC)

To serve multiple institutions securely while isolating data, LabSim uses **Multi-Tenant Row-Level Security (RLS)** in PostgreSQL.

### Role Hierarchy & Permissions

| Role | Access Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Super Admin** (You) | Global Platform | Manage tenant subscriptions, platform feature flags, billing analytics, global experiment catalog. |
| **School Admin** (Principal / HOD) | Single School (`tenant_id`) | Invite teachers, bulk-import students via CSV, assign seat licenses, view school completion dashboards. |
| **Teacher** | Assigned Classes / Batches | Create lab assignments with deadlines, monitor real-time class progress, auto-grade observation tables, assess viva answers. |
| **Student** | Enrolled Classes | Conduct interactive simulations, fill observation tables, generate certified PDF lab records, earn XP & badges. |
| **Parent** (Optional) | Child's Progress | View weekly practical completion reports and viva performance analytics via email digests. |

---

## 3. Database Schema (PostgreSQL / Supabase / Prisma)

Below is the production-ready PostgreSQL relational schema powering multi-tenancy, assignments, real-time telemetry, and gamification:

```sql
-- 1. INSTITUTIONS / SCHOOLS (Multi-Tenant Core)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(63) UNIQUE NOT NULL, -- e.g., dps-rkpuram.labsim.app
    board VARCHAR(50) DEFAULT 'CBSE',     -- CBSE, ICSE, Cambridge, State Board
    license_type VARCHAR(50) DEFAULT 'trial', -- trial, active, expired
    max_seats INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student', 'parent');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLASSROOMS & BATCHES
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,            -- e.g., 'Class 10 - Section A'
    academic_year VARCHAR(20) NOT NULL,    -- e.g., '2026-2027'
    invite_code VARCHAR(12) UNIQUE NOT NULL
);

-- 4. LAB ASSIGNMENTS
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    experiment_id VARCHAR(100) NOT NULL,   -- 'convex-lens', 'ohms-law', 'ph-indicators'
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    target_readings_count INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STUDENT SUBMISSIONS & OBSERVATION DATA
CREATE TABLE lab_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'in_progress', -- in_progress, submitted, graded
    observation_data JSONB NOT NULL,          -- Array of { u, v, f } or { V, I, R }
    calculated_results JSONB,                 -- Mean focal length, resistance
    accuracy_percentage NUMERIC(5,2),         -- Calculated against ground truth
    viva_score INT DEFAULT 0,                 -- Marks from Labby AI Viva
    viva_answers JSONB,
    teacher_remarks TEXT,
    teacher_score NUMERIC(5,2),
    pdf_report_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STUDENT GAMIFICATION & XP
CREATE TABLE student_gamification (
    student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    unlocked_badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    streak_days INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE
);
```

---

## 4. Key SaaS Modules to Implement

### 4.1 Authentication & Single Sign-On (SSO)
- **Google Workspace for Education**: Schools operate on `@school.edu` Google accounts. 1-click Sign in with Google automatically detects student domain and enrolls them into the school's workspace.
- **Microsoft 365 Education**: Standard for government and central schools.

### 4.2 Teacher LMS & Live Classroom Dashboard
1. **Live Classroom Telemetry**:
   - In a 45-minute lab period, teacher sees real-time status cards for all 40 students:
     - 🟢 *Green*: Connected and recording valid data.
     - 🟡 *Yellow*: Ray diagram out of focus or open circuit.
     - 🔴 *Red*: Circuit short-circuited or no activity.
2. **Auto-Grading Observation Tables**:
   - Compares student values to physics formulas ($1/f = 1/v - 1/u$, $V = IR$) with $\pm 5\%$ tolerance.
3. **Plagiarism & Anti-Cheat**:
   - Randomizes default parameters per student ($f = 15\text{ cm}$ vs $20\text{ cm}$).

### 4.3 Automated PDF Lab Manual Export
- 1-click CBSE format report with School Logo, Roll No, live tables, ray diagrams, and verification QR code.

### 4.4 Payments & Subscription Engine
- **India**: Razorpay Subscriptions (Net Banking, UPI AutoPay, GST Invoicing with HSN 9992).
- **Global**: Stripe Billing (Multi-currency, School Net 30 invoices).

---

## 5. 5-Phase Implementation Roadmap

1. **Phase 1 (Weeks 1–2)**: Auth & Workspace Multi-Tenancy (Supabase + Google SSO).
2. **Phase 2 (Week 3)**: Cloud Observation & Gamification Sync (Postgres migration).
3. **Phase 3 (Weeks 4–5)**: Teacher Portal (`/teacher`) with live class grid & auto-grader.
4. **Phase 4 (Week 6)**: Billing & Subscriptions (Razorpay/Stripe checkout).
5. **Phase 5 (Weeks 7–8)**: School Pilot Launch with 3–5 partner schools.
