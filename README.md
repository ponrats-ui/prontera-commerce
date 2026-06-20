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

Current release: `v1.0.0-commerce-civilization-alpha`

Latest completed sprint: Sprint 18A Merchant Soul System

Next planned release: Sprint 18B Regional Belonging Foundation

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
- [x] Founder Merchant Platform
- [x] Founder Launch Campaign
- [x] Merchant Building System
- [x] Merchant Discovery Engine
- [x] Buyer World Entry
- [x] Demo World Seed
- [x] Living Commerce World Foundation
- [x] Living Citizens & AI Merchant Foundation
- [x] Regional Commerce Network
- [x] Social Commerce Civilization Foundation
- [x] Immersion & Living World Enhancement
- [x] Merchant Soul & Emotional Attachment System
- [x] Real AI Shopkeeper & 2.5D Town Upgrade
- [x] Merchant Soul System & Emotional World Layer
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
- `v1.0.0-commerce-civilization-alpha`: Commerce World, regional network, social civilization, and living-world immersion alpha.

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

## Merchant Discovery

Sprint 13 introduces the Merchant Discovery Engine so customers can discover merchants through search, categories, Founder Merchant views, Official Store views, featured placement, ranking signals, and discovery metrics.

Reference:

- [Sprint 13 Merchant Discovery Engine](docs/product/sprint-13-merchant-discovery-engine.md)

## Buyer World Entry

Buyers can now enter Prontera without an account, choose a starter avatar, explore a two-dimensional Merchant City, visit merchant buildings, view products, see live and promotion signals, and travel through Commerce Gates.

Start locally at `/play`.

The living world foundation adds playable characters, smooth town movement,
populated city citizens, memorable merchant owners, shop interior scenes, and a
governed mock AI shopkeeper built for future provider integration.

Sprint 18A deepens the soul layer with MerchantSoul profiles, personality-aware
AI shopkeeper responses, civilian NPC dialogue, regional lore, ambient
storytelling objects, and Founder Museum exhibits.

Reference:

- [Merchant Soul System](docs/world/merchant-soul-system.md)
- [Regional Lore System](docs/world/regional-lore-system.md)
- [Merchant Personality Engine](docs/ai/merchant-personality-engine.md)
- [Founder Museum](docs/social/founder-museum.md)
- [Prontera Art Bible](docs/design/prontera-art-bible.md)

Sprint 16 expands Merchant City into a connected regional commerce network.
Buyers can open `/world-map`, travel through animated Warp Gates, meet regional
leaders, discover merchants by regional economy, and visit the Founder
Monument.

Sprint 17 adds the social civilization foundation. `/commerce-square` becomes
the community homepage with commerce friends, merchant follows and favorites,
guild halls, customer and merchant reputation, commerce events, daily life,
messenger previews, Founder Hall, and a disclosed AI Town Guide.

Reference:

- [Sprint 13A Buyer World Entry](docs/product/sprint-13a-buyer-world-entry.md)
- [Sprint 13B Demo World Seed](docs/product/sprint-13b-demo-world-seed.md)
- [Sprint 14 Living Commerce World Foundation](docs/product/sprint-14-living-commerce-world-foundation.md)
- [Sprint 15 Living Citizens and AI Merchant Foundation](docs/product/sprint-15-living-citizens-ai-merchant.md)
- [World Expansion Roadmap](docs/world/world-expansion-roadmap.md)
- [Regional Commerce Network](docs/world/regional-commerce-network.md)
- [Buyer World Experience Roadmap](docs/vision/buyer-world-experience-roadmap.md)
- [Social Commerce Civilization](docs/social/social-commerce-civilization.md)
- [Guild System](docs/social/guild-system.md)
- [Merchant Reputation System](docs/social/merchant-reputation-system.md)
- [Customer Reputation System](docs/social/customer-reputation-system.md)
- [Commerce Square](docs/social/commerce-square.md)

## Founder Merchant Program

The Founder Merchant 100 Program is Prontera Commerce's first official merchant acquisition strategy for the Revenue Era.

It focuses on recruiting the first 100 founder merchants across computer stores, IT equipment sellers, gaming shops, handmade businesses, coffee shops, local brands, hobby stores, educational businesses, creator businesses, and SME retailers.

Sprint 11A adds the operational Founder Merchant Platform for public applications, admin review, Founder benefit activation, dashboard status, and public Founder counters.

Sprint 12A adds the first Founder Launch Campaign with landing page optimization, waitlist capture, referral foundation, campaign tracking, metrics, and success story placeholders.

Reference:

- [Founder Merchant 100 Program](docs/growth/founder-merchant-100-program.md)
- [Merchant Acquisition Playbook](docs/growth/merchant-acquisition-playbook.md)
- [Merchant Personas](docs/growth/merchant-personas.md)
- [Sprint 11A Founder Merchant Platform](docs/product/sprint-11a-founder-merchant-platform.md)
- [Sprint 12A Founder Launch Campaign](docs/growth/sprint-12a-founder-launch-campaign.md)

## Roadmap

Next priorities:

- Promotion & Pricing Engine expansion
- Merchant Subscription expansion
- Merchant Onboarding World expansion
- Merchant Building System expansion
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
- [Sprint 11A Founder Merchant Platform](docs/product/sprint-11a-founder-merchant-platform.md)
- [Sprint 12 Merchant Building System](docs/product/sprint-12-merchant-building-system.md)
- [Sprint 12A Founder Launch Campaign](docs/growth/sprint-12a-founder-launch-campaign.md)
- [Sprint 13 Merchant Discovery Engine](docs/product/sprint-13-merchant-discovery-engine.md)
- [Sprint 13A Buyer World Entry](docs/product/sprint-13a-buyer-world-entry.md)
- [Sprint 13B Demo World Seed](docs/product/sprint-13b-demo-world-seed.md)
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
