# Sprint 13A Buyer World Entry

## Goal

Sprint 13A gives buyers and first-time visitors a direct entrance into Prontera as a commerce world.

The experience is public, two-dimensional, and commerce-first. It does not introduce combat, leveling, quests, equipment, or other MMORPG mechanics.

## Buyer Routes

- `/play`
- `/town`
- `/town/merchant-city`
- `/town/merchant-city/shops`
- `/town/shop/[slug]`

## Entry Experience

The `/play` route explains the platform within the first viewport:

- Prontera is a commerce world.
- Buyers enter Merchant City.
- Shops exist as merchant buildings.
- Visitors can discover merchants, live stores, and active deals.
- Commerce Gates connect districts and future cities.

No account is required.

## Starter Avatars

Buyers can select one of four starter identities:

- Adventurer
- Merchant
- Creator
- Explorer

The choice is stored in browser `localStorage` under `prontera_buyer_avatar`. Sprint 13A does not create avatar accounts, inventories, progression, or multiplayer presence.

## Merchant City

Merchant City is presented as an original flat 2D commerce map with:

- City identity and visitor context
- District cards
- Merchant building markers
- Published building cards
- Live merchant signals
- Founder Merchant signals
- A Commerce Gate entry

The page uses existing world, building, discovery, promotion, live commerce, and Founder Merchant data.

## Shop Visits

The public storefront route displays:

- Merchant building and sign
- Shop description and district
- Founder, Official Store, and LIVE badges
- Featured products and prices
- Live commerce status
- Active promotion signal

The merchant dashboard link is displayed only when the locally authenticated user owns the storefront.

## Buyer Navigation

The buyer shell provides direct navigation to:

- World
- Merchant City
- Discover
- Founder Stores
- Warp Gate

## Public APIs

Sprint 13A uses public, unauthenticated reads:

- `GET /world`
- `GET /world/map`
- `GET /world/gates/available`
- `GET /world/shops/:slug`
- `GET /buildings`
- `GET /merchant/:id`
- `GET /discover/merchants`

## Constraints

This sprint does not include:

- 3D rendering
- Buyer accounts
- Avatar progression
- Game mechanics
- Checkout redesign
- Social chat
- Multiplayer presence

The goal is to establish a clear buyer-facing world entrance before adding visual or social complexity.
