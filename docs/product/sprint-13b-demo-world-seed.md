# Sprint 13B Demo World Seed

## Goal

Sprint 13B guarantees that a clean local database can immediately demonstrate the Prontera buyer world after:

```bash
npm.cmd run seed:demo
```

The seed is idempotent and can be rerun without duplicating canonical world records.

## Required Demo World

### City

- Merchant City
- Central Trade Region
- Merchant World zone

### Core District

- Central Market District
- General commerce category
- City coordinates assigned

### Core Shop

- Demo General Store
- Published Small building
- Classic storefront theme
- World location in Central Market District
- Featured discovery placement
- LIVE signal

### Core Product

- Demo Potion
- Active product and variant
- Demo inventory
- Buyer-visible price

### Promotion Placeholder

- Welcome to Merchant City
- Active 10 percent discount rule targeting Demo Potion
- Discovery banner visible on the storefront

### Live Commerce Placeholder

- Merchant City Welcome Live
- Public LIVE signal for world discovery
- Demo-only video and embed URLs

## Additional Seeded Shops

- Tech Bazaar Keyboard Store
- Artisan Coffee House
- Harbor Supply Shop

These shops provide:

- Multiple building types and storefront themes
- Official Store discovery
- Founder Merchant discovery
- Multiple districts and categories
- A populated 2D city experience

## Commerce Gate

The seed creates the Central Market Warp Gate from Central Market District to Tech Bazaar.

This provides a visible travel route for the buyer experience without introducing gameplay mechanics.

## Seed Safety

The seed:

- Uses upsert or lookup-and-update patterns
- Preserves stable shop slugs
- Reuses existing migration-seeded city and district records
- Creates world locations and buildings by unique shop ID
- Does not require a new schema migration

## Demo Credentials

```text
Email: demo@prontera.local
Password: DemoPass123!
```

The demo merchant owns the seeded shops. When signed in as this user, the buyer storefront can display the merchant dashboard link for owned shops.
