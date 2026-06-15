# Web Frontend Architecture

Prontera Commerce web starts with a Merchant OS dashboard built on Next.js and TypeScript. Sprint 6 focuses on authenticated merchant operations and intentionally avoids customer marketplace, virtual world, mobile, AI chat, and external payment gateway interfaces.

## Application Surfaces

The initial web surface is the Merchant Dashboard:

- Login
- Overview dashboard
- Shop management
- Product management
- Inventory management
- Orders
- POS sessions

Future surfaces should be separated by audience and responsibility:

- Merchant OS dashboard for business operators
- Customer marketplace for shoppers
- Virtual Prontera World for immersive commerce
- Admin and governance console for platform operations

## Layout Model

Authenticated dashboard pages use a shared shell with:

- Sidebar navigation
- Top navigation
- Logout action
- Responsive content area

The shell performs a development token check and redirects unauthenticated users to `/login`.

## Data Access

The frontend uses small typed API clients in `apps/web/lib/api.ts`. The shared fetch helper centralizes:

- API base URL resolution
- JSON request headers
- Bearer token attachment
- Error parsing

The current API base URL is configured with `NEXT_PUBLIC_API_URL`.

## Security Notes

JWT storage is intentionally development-oriented for Sprint 6. Before production, the auth flow should be hardened with secure cookie storage, CSRF strategy, refresh-token handling, and stricter session invalidation behavior.

## Global Readiness

The dashboard preserves global commerce fields already exposed by the backend:

- `countryCode`
- `preferredLocale`
- `preferredCurrency`
- `timeZone`

Future UI work should add locale-aware formatting, language switching, currency display preferences, and country-specific tax and shipping configuration screens.

## Roadmap Boundaries

Sprint 6 does not implement:

- Marketplace search
- Virtual world UI
- Avatar UI
- AI agent chat
- Mobile app screens
- Stripe or local payment gateway integrations
- Full design system

These systems should be introduced in later phases with separate route ownership and documentation.
