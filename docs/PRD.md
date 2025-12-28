# Arthawork - Product Requirements Document (PRD)

## Product Overview
**Arthawork** adalah platform SaaS untuk freelancer dan profesional kreatif Indonesia untuk mengelola invoice, proposal, dan klien dengan profesional.

## Target Users
- Freelancers (designers, developers, writers)
- Creative agencies (small teams 1-10)
- Consultants & service providers

---

## Core Features

### 1. Client Management
- Add/edit/delete clients
- Store: name, email, phone, company, address
- Auto-populate in invoices/proposals

### 2. Invoice Management
- Create professional invoices
- Multiple line items
- Tax calculation (PPN support)
- Status tracking: draft, sent, paid, overdue
- PDF export
- Payment link (guest access)

### 3. Proposal Management
- Agency-quality proposals
- Sections: About, Services, Timeline, Investment, Terms
- Status: draft, sent, approved, rejected
- PDF export

### 4. Payment Integration
- **Midtrans** gateway
- Methods: QRIS, Virtual Account, E-Wallet
- Webhook-based status updates
- Payment history tracking

### 5. Subscription Tiers
| Tier | Price | Limits |
|------|-------|--------|
| Free | Rp 0 | 3 invoices/mo, 5 proposals/mo |
| Pro | Rp 50k/mo | Unlimited |
| Business | Rp 199k/mo | Team features, API |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Payments | Midtrans Snap |
| Hosting | Vercel/Lovable |

---

## Security Requirements
- ✅ Row Level Security (RLS)
- ✅ UUID-based IDs
- ✅ 2FA support
- ✅ Session timeout
- ✅ Rate limiting
- ✅ Webhook signature verification
- ✅ Audit logging

---

## Non-Functional Requirements
- Response time < 2s
- 99.9% uptime
- Mobile responsive
- PWA support
- HTTPS only

---

## Future Roadmap
1. Team collaboration (multi-user)
2. Recurring invoices
3. Client portal
4. WhatsApp integration
5. Accounting sync (Jurnal.id)
