# Prontera Commerce

The Open World Commerce Platform for Real Businesses

Prontera Commerce is a Merchant Civilization Platform for real businesses.

It combines Merchant OS, Marketplace, Live Commerce, AI Commerce direction, and Commerce World discovery into a connected digital economy for merchants, customers, communities, and stories.

## Platform Positioning

Prontera Commerce is not a marketplace.

Prontera Commerce is not a game.

Prontera Commerce is a Merchant Civilization Platform.

Reference: [Merchant Civilization Platform](docs/vision/merchant-civilization-platform.md)

## Current Status

Status: Internal Alpha

Current release: `v0.1.0-core-commerce`

Latest completed sprint: Sprint 11 Merchant Onboarding World

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
- [x] Promotion & Pricing Engine Foundation
- [x] Merchant Subscription Foundation
- [x] Merchant World Experience Foundation
- [x] Merchant Onboarding World
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

## Current Milestone

v0.3.0 Foundation Complete

Reference:

- [v0.3.0 Foundation Milestone](docs/releases/v0.3.0-foundation-milestone.md)
- [IP Asset Register](docs/legal/ip-asset-register.md)

## Investor Resources

- [Investor One Pager](docs/investors/investor-one-pager.md)

## Company Philosophy

Prontera Commerce is built to restore merchant identity, strengthen merchant relationships, and create a long-term Merchant Civilization Platform.

Reference:

- [Founder Letter](docs/investors/founder-letter.md)
- [Company Manifesto](docs/investors/company-manifesto.md)

## Merchant Media Network

Prontera Commerce is also a future merchant-focused advertising and visibility network.

The Merchant Media Network turns storefronts, districts, warp gates, featured placements, and Official Store status into a future revenue and ecosystem layer for the Merchant Civilization Platform.

Reference:

- [Merchant Media Network](docs/business/merchant-media-network.md)
- [Advertising Economy](docs/business/advertising-economy.md)

## Founder Merchant Program

The Founder Merchant 100 Program is Prontera Commerce's first official merchant acquisition strategy for the Revenue Era.

It focuses on recruiting the first 100 founder merchants across computer stores, IT equipment sellers, gaming shops, handmade businesses, coffee shops, local brands, hobby stores, educational businesses, creator businesses, and SME retailers.

Reference:

- [Founder Merchant 100 Program](docs/growth/founder-merchant-100-program.md)
- [Merchant Acquisition Playbook](docs/growth/merchant-acquisition-playbook.md)
- [Merchant Personas](docs/growth/merchant-personas.md)

## Roadmap

Next priorities:

- Promotion & Pricing Engine expansion
- Merchant Subscription expansion
- Merchant Onboarding World expansion
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

## AI Founder Council

Prontera Commerce uses an AI Founder Council to provide specialized perspectives across strategy, product, engineering, growth, and governance while preserving Founder authority.

Reference: [Prontera AI Founder Council](docs/ai/ai-founder-council.md)

## Vision

Prontera Commerce preserves long-term platform vision documents for the Merchant Civilization Platform, Legacy NPC AI, and future Founder Hall experiences.

Reference: [AI Founder Council NPC System](docs/vision/ai-founder-council-npc-system.md)

## AI Systems

Future AI systems should help merchants learn, operate, grow, and protect their businesses while preserving Human-in-the-Loop governance.

Reference: [AI Documentation](docs/ai/README.md)

## Founder Experience

Founder Hall is a future world-building concept where merchants can visit the AI Founder Council as platform NPC mentors and advisors.

Reference: [AI Founder Council NPC System](docs/vision/ai-founder-council-npc-system.md)

## Original Art Direction and IP Safety

Prontera Commerce uses an original fantasy commerce art direction. It does not clone or copy Ragnarok, Pixar, Disney, Ghibli, Nintendo, or any existing franchise.

Reference:

- [Prontera Art Bible](docs/brand/prontera-art-bible.md)
- [IP Safety Guidelines](docs/brand/ip-safety-guidelines.md)

## Documentation

- [Core Commerce Release](docs/releases/v0.1.0-core-commerce.md)
- [v0.3.0 Foundation Milestone](docs/releases/v0.3.0-foundation-milestone.md)
- [Investor One Pager](docs/investors/investor-one-pager.md)
- [Founder Letter](docs/investors/founder-letter.md)
- [Company Manifesto](docs/investors/company-manifesto.md)
- [Merchant Dashboard](docs/web/merchant-dashboard.md)
- [Customer CRM Foundation](docs/architecture/customer-crm-foundation.md)
- [Live Commerce Architecture](docs/architecture/live-commerce.md)
- [Live Commerce API](docs/api/live-commerce.md)
- [Promotion Engine API](docs/api/promotion-engine.md)
- [Promotion Engine Architecture](docs/architecture/promotion-engine.md)
- [Merchant Subscription Model](docs/business/subscription-model.md)
- [Founder Merchant Program](docs/business/founder-program.md)
- [Founder Merchant 100 Program](docs/growth/founder-merchant-100-program.md)
- [Merchant Acquisition Playbook](docs/growth/merchant-acquisition-playbook.md)
- [Merchant Personas](docs/growth/merchant-personas.md)
- [Merchant Media Network](docs/business/merchant-media-network.md)
- [Advertising Economy](docs/business/advertising-economy.md)
- [Sprint 11 Merchant Onboarding World](docs/product/sprint-11-merchant-onboarding-world.md)
- [World Experience](docs/world/world-experience.md)
- [Storefront System](docs/world/storefront-system.md)
- [World Discovery Engine](docs/world/discovery-engine.md)
- [Vision Asset Library](docs/vision/README.md)
- [AI Founder Council NPC System](docs/vision/ai-founder-council-npc-system.md)
- [Master Roadmap](docs/roadmap/master-roadmap.md)
- [Founder Principles](docs/architecture/founder-principles.md)
- [Brand Documentation](docs/brand/README.md)
- [AI Founder Council](docs/ai/ai-founder-council.md)
- [AI Executive Board](docs/governance/ai-executive-board.md)
- [Legal and Ownership Documents](docs/legal/README.md)

## Known Limitations

- Internal alpha UI
- No external payment gateway yet
- No production hosting yet
- Customer marketplace storefront is foundation-only
- No AI Merchant UI yet
- Open World layer is commerce-discovery foundation only
