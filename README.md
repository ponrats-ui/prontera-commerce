# Prontera Commerce

Prontera Commerce is a production-oriented commerce platform monorepo. Sprint 0 establishes the workspace, runtime boundaries, database foundation, and Docker services needed for feature delivery in Sprint 1.

## Architecture

```text
apps/
  web/      Next.js 15 customer storefront
  api/      NestJS backend API
  mobile/   Flutter application placeholder
  admin/    Admin console placeholder

packages/
  database/ Prisma schema and database client boundary
  shared/   Cross-platform domain primitives and contracts
  ui/       Shared UI package for web-facing applications
  sdk/      Typed client SDK for consumers of the API
```

The monorepo uses Turborepo with npm workspaces. Shared code is intentionally split by responsibility so domain contracts, persistence, UI, and API client concerns can evolve independently.

## Technical Decisions

- **TypeScript first:** all JavaScript application and package boundaries are typed from the start.
- **Clean Architecture:** app entrypoints depend inward on shared contracts and package APIs instead of coupling directly to infrastructure details.
- **Domain Driven Design:** core commerce concepts begin in the database model and will be promoted into explicit domain modules during Sprint 1.
- **Docker ready:** PostgreSQL and Redis run through Docker Compose with health checks and persisted volumes.
- **CI/CD ready:** root scripts expose consistent `build`, `lint`, `test`, and `typecheck` commands through Turborepo.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start infrastructure:

   ```bash
   npm run docker:up
   ```

4. Generate the Prisma client:

   ```bash
   npm run db:generate
   ```

5. Create a development migration:

   ```bash
   npm run db:migrate
   ```

## Sprint 1 Readiness

Sprint 1 can begin by implementing authentication, shop onboarding, subscription lifecycle workflows, and the first API modules on top of the `User`, `Shop`, and `Subscription` models.
