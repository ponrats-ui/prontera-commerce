# Regional Commerce Network

## System Overview

Sprint 16 introduces a frontend regional composition layer over the existing
World API.

```text
World API commerce data
  + Regional identity definitions
  + Leadership and lore
  + Region discovery rules
  + Display-only reputation
  -> Connected buyer world
```

No schema migration is required.

The API remains the source of truth for published shops, live status, products,
Founder Merchant signals, cities, and districts. Region definitions provide
the buyer-world culture and presentation needed before every region has
production database records.

## Routes

- `/world-map`
- `/world/merchant-city`
- `/world/harbor-kingdom`
- `/world/tech-republic`
- `/world/artisan-valley`
- `/world/creator-island`
- `/world/industrial-district`

The legacy `/world/map` route redirects to `/world-map`.

## Travel Flow

Selecting a region from the world atlas initiates:

1. Commerce Gate charging
2. Regional trade-route traversal
3. Destination reached state
4. Regional arrival page

The transition intentionally takes a short amount of time so travel feels like
movement through the world rather than ordinary website navigation.

Reduced-motion users receive a stable presentation without decorative motion.

## Regional Identity Contract

Each region defines:

- Slug and display name
- Theme and description
- Economy and merchant specialties
- Architecture and climate
- Visual palette
- Atlas coordinates
- Merchant population signal
- Regional activity signal
- Display-only reputation
- Leadership profile

Leadership profiles define:

- Name
- Title
- Original portrait identity
- Greeting
- Backstory
- Regional lore
- Future quest hook

## Regional Merchant Discovery

Published World API shops are associated with the most relevant regional
economy using category, district, name, and theme signals.

Examples:

- Harbor and supply merchants appear in Harbor Kingdom.
- Technology and keyboard merchants appear in Tech Republic.
- Coffee and artisan merchants appear in Artisan Valley.
- All current merchants remain discoverable from Merchant City.

Regions without matching published merchants show an opening-soon destination
scene and describe the specialties expected there. They do not fabricate shops.

## Reputation Foundation

Sprint 16 displays:

- Player-facing regional reputation
- Existing merchant reputation in shop interiors
- Regional reputation progress

Regional reputation is presentation-only. It does not grant access, discounts,
rankings, or privileges yet.

## Founder Monument

Merchant City contains the Founder Monument and Founder Merchant Hall.

It records:

- Founding date
- Founder Merchant 100 recognition
- Symbolic contribution to the first trade roads
- Entry into the Founder Merchant discovery surface

## Dynamic World Statistics

The world atlas and regional destinations display:

- Active merchants
- Live stores
- Products listed
- Transactions
- Visitors
- Regions online

Published shop, live, and product values are incorporated from the World API.
Network-scale values are clearly presentation signals for the expanding world
and can later be replaced by dedicated analytics endpoints.

## Constraints

- No 3D rendering
- No heavy map engine
- No multiplayer simulation
- No schema-breaking changes
- No fabricated published merchants
- No progression rewards in Sprint 16
- Original visual compositions only
