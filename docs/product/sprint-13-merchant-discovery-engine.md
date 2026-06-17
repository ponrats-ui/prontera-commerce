# Sprint 13 Merchant Discovery Engine

## Goal

Sprint 13 enables customers to discover merchants, not only products.

Prontera Commerce discovery is merchant-first. A shop is treated as a visible place inside the Merchant Civilization, with ranking signals based on storefront status, founder participation, live activity, official store trust, featured placement, and active promotions.

## Customer Routes

- `/discover`
- `/discover/merchants`
- `/discover/founders`
- `/discover/official`

## API Routes

- `GET /discover`
- `GET /discover/merchants`
- `GET /discover/categories`
- `GET /discover/founders`
- `GET /discover/official`
- `GET /discover/featured`
- `GET /discover/metrics`
- `POST /discover/events`

## Discovery Features

### Merchant Search

Customers can search discoverable merchants by name, slug, description, category, city, and district signals already present in the world storefront layer.

### Merchant Categories

The discovery engine summarizes categories from published world merchants and returns merchant counts and live merchant counts per category.

### Founder Merchant Discovery

Founder merchants receive a dedicated discovery route and ranking priority. Founder status comes from the Founder Merchant Program and active founder placement signals.

### Official Store Discovery

Official stores receive a dedicated discovery route. Official Store status is managed through the Merchant Building System and supports future verified merchant and media network programs.

### Featured Merchants

Featured merchants are exposed through the discovery API as a foundation for editorial placement, revenue experiments, and future Merchant Media Network inventory.

### Merchant Ranking Foundation

Sprint 13 uses a deterministic signal score:

- Live Commerce: 1000 points
- Founder Merchant: 500 points
- Founder Placement: 250 points
- Featured Merchant: 150 points
- Active Promotion: 75 points
- Enterprise Subscription: 80 points
- Pro Subscription: 50 points

This is a foundation only. It is not AI ranking, paid search, or automated marketplace bidding.

## Discovery Metrics

Sprint 13 introduces discovery event tracking for:

- Discovery views
- Merchant searches
- Merchant clicks
- Category filters
- Founder filters
- Official Store filters
- Featured merchant filters

Metrics are stored in `merchant_discovery_events` and exposed through `GET /discover/metrics`.

## Business Value

Merchant Discovery moves Prontera toward the Revenue Era by making merchant visibility measurable and navigable.

This foundation supports:

- Founder Merchant activation
- Official Store visibility
- Future premium placement
- Merchant Media Network inventory
- Customer exploration through the commerce world

## Constraints

Sprint 13 does not implement:

- Paid advertising auctions
- AI ranking
- Personalized recommendation engines
- Loyalty programs
- Affiliate programs
- Marketplace-style sponsored product ads

Commerce discovery remains merchant-first and world-aware.
