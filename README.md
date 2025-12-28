# Arthawork

Platform profesional untuk freelancer Indonesia - kelola invoice, proposal, dan klien dengan mudah.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Variables

Create `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Midtrans (optional)
VITE_MIDTRANS_CLIENT_KEY=your-client-key

# Analytics (optional)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📁 Project Structure

```
src/
├── components/     # React components
│   ├── auth/       # Auth (login, signup)
│   ├── dashboard/  # Dashboard widgets
│   ├── invoice/    # Invoice components
│   ├── layout/     # Layout (sidebar, header)
│   ├── payment/    # Payment selector
│   ├── settings/   # Settings tabs
│   └── ui/         # shadcn/ui components
├── hooks/          # Custom React hooks
├── lib/            # Utilities & services
├── pages/          # Route pages
└── integrations/   # External integrations

supabase/
├── functions/      # Edge Functions
│   ├── create-midtrans-transaction/
│   └── midtrans-webhook/
└── migrations/     # Database migrations
```

## 🗄️ Database

Tables:
- `profiles` - User profiles
- `clients` - Client contacts
- `services` - Service catalog
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `proposals` - Proposal documents
- `business_settings` - Business config
- `subscriptions` - User subscriptions
- `payment_history` - Payment records
- `audit_logs` - Audit trail

## 📦 Key Dependencies

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- @tanstack/react-query
- Supabase JS
- Midtrans Snap

## 🔐 Security

- Row Level Security (RLS) on all tables
- UUID-based IDs
- 2FA support (TOTP)
- Session timeout (30 min)
- Rate limiting
- Audit logging

## 📄 Documentation

- [PRD](docs/PRD.md) - Product Requirements
- [Technical Audit](docs/technical_audit.md) - Architecture review

## 📜 License

Proprietary - All rights reserved
