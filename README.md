# Prontera Commerce

The Open World Commerce Platform for Real Businesses

Prontera Commerce is a Merchant OS + Marketplace + AI Commerce + Open World Commerce platform inspired by MMORPG towns, designed for real-world businesses.

## Current Status

Status: Internal Alpha

Current release: `v0.1.0-core-commerce`

Latest completed sprint: Sprint 8A Pro Live Commerce Foundation

Next planned release: `v0.2.0-crm-foundation`

## Completed Modules

- [x] Infrastructure Foundation
- [x] Docker
- [x] PostgreSQL
- [x] Redis
- [x] Prisma
- [x] NestJS API
- [x] Swagger API docs
- [x] Authentication
- [x] JWT
- [x] RBAC
- [x] Session Management
- [x] Shop Management
- [x] Product Catalog
- [x] Inventory & Warehouse
- [x] Orders
- [x] Checkout
- [x] POS
- [x] Merchant Dashboard Foundation
- [x] Developer onboarding / demo login flow
- [x] Customer CRM Foundation
- [x] Pro Live Commerce Foundation
- [x] YouTube Live Channel Embed Support
- [x] Global Commerce Foundation
- [x] Human-in-the-Loop Governance
- [x] AI Executive Board Documentation
- [x] Intellectual Property Foundation

## Architecture Overview

```text
apps/
  api/      NestJS backend API
  web/      Next.js merchant dashboard and web foundation
  admin/    Admin console placeholder
  mobile/   Mobile application placeholder

packages/
  database/ Prisma schema and database client boundary
  shared/   Cross-platform domain primitives and contracts
  ui/       Shared UI package
  sdk/      Typed client SDK boundary

infrastructure/
  docker    PostgreSQL and Redis through Docker Compose
```

The repository is a TypeScript monorepo using npm workspaces and Turborepo.

## Tech Stack

- NestJS
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Redis
- Docker
- Swagger

## Local Development

Copy environment variables:

```bash
copy .env.example .env
```

Start local infrastructure:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm.cmd install
```

Generate Prisma client:

```bash
npm.cmd run db:generate
```

Run migrations:

```bash
npm.cmd run db:migrate
```

Start the API:

```bash
npm.cmd run dev --workspace=@prontera/api
```

Start the web app:

```bash
npm.cmd run dev --workspace=@prontera/web
```

Local URLs:

- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/docs`
- Web: `http://localhost:3000`

## Environment

Example `DATABASE_URL`:

```text
postgresql://prontera:prontera_password@localhost:5432/prontera_commerce?schema=public
```

## Release Milestones

- `v0.1.0-core-commerce`: Core Commerce Engine foundation complete.
- `v0.2.0-crm-foundation`: Planned Customer & CRM release milestone.

## Roadmap

Next priorities:

- Sprint 8B Pricing, Promotions, and Pro Plan Packaging
- Sprint 9 Payment Gateway Foundation
- Sprint 10 Shipping & Fulfillment Foundation
- Marketplace Storefront
- AI Merchant
- Virtual Prontera World

## Governance

COM / Ponrat / Founder has final decision-making authority across Prontera Commerce.

AI agents may assist, recommend, document, analyze, and automate low-risk tasks under Human-in-the-Loop governance. High-impact financial, legal, compliance, moderation, policy, pricing, and strategic decisions remain under human authority.

## AI Partner Continuity

Prontera Commerce uses documented AI operating memory to preserve the working continuity of Mr.P, the CTO AI partner.

Reference: [Mr.P Operating Memory](docs/ai/mr-p-operating-memory.md)

## Documentation

- [Core Commerce Release](docs/releases/v0.1.0-core-commerce.md)
- [Merchant Dashboard](docs/web/merchant-dashboard.md)
- [Customer CRM Foundation](docs/architecture/customer-crm-foundation.md)
- [Live Commerce Architecture](docs/architecture/live-commerce.md)
- [Live Commerce API](docs/api/live-commerce.md)
- [Vision Asset Library](docs/vision/README.md)
- [Master Roadmap](docs/roadmap/master-roadmap.md)
- [Founder Principles](docs/architecture/founder-principles.md)
- [AI Executive Board](docs/governance/ai-executive-board.md)
- [Legal and Ownership Documents](docs/legal/README.md)

## Known Limitations

- Internal alpha UI
- No external payment gateway yet
- No production hosting yet
- No customer marketplace storefront yet
- No AI Merchant UI yet
- No Open World layer yet
