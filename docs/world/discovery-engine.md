# World Discovery Engine

`WorldDiscoveryService` is the Sprint 10 foundation for browsing merchants inside the commerce world.

## Browse Modes

The world API supports discovery by:

- city
- district
- category
- live now
- Founder Merchants
- featured merchants
- merchant search

Public endpoints:

- `GET /world/regions`
- `GET /world/cities`
- `GET /world/districts`
- `GET /world/shops`
- `GET /world/live`
- `GET /world/founders`
- `GET /world/map`

## Ranking Hierarchy

Sprint 10 uses simple deterministic ranking:

1. Live storefronts
2. Founder Merchants
3. Founder district placement
4. Featured storefronts
5. Active promotions
6. Paid subscription tier signals

This is not AI pricing, paid ad bidding, or marketing automation. It is a transparent foundation for world discovery.

## Live Commerce Integration

If a merchant has a live channel with `LIVE` status, the world discovery output includes:

- `liveNow`
- `LIVE` badge
- higher ranking score

Live commerce is a discovery signal only. The Live Commerce module remains the source of truth for channel status.

## Founder Integration

Founder Merchants can receive:

- Founder badge
- Founder district placement
- priority storefront visibility
- Founder profile card data

The Founder Merchant Program remains the source of truth for founder status and expiry.

## Promotion Integration

If a merchant has an active promotion campaign, discovery can show:

- discount badge
- campaign badge
- flash sale badge
- voucher-style badge

Promotion display is informational. The Promotion Engine and checkout flow remain the source of truth for final pricing and eligibility.

## Safety Rules

Discovery must remain commerce-first. Do not add:

- combat ranking
- character level ranking
- equipment bonuses
- quest rewards
- monster drops
- avatar inventories

Future discovery work should remain auditable, explainable, and attached to real merchant business value.
