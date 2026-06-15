# Commerce Gate Network Architecture

The Commerce Gate Network is the fast travel foundation for the future Prontera Commerce Open World platform.

Customers should be able to explore immersive cities and districts, but they should never be forced to walk long distances before shopping. Commerce Gates preserve the feeling of a living world while prioritizing convenience, conversion, and merchant discovery.

## Concept

Internal name:

- Commerce Gate

Alternative customer-facing labels:

- Merchant Portal
- Commerce Portal
- Warp Gate

Purpose:

- Instant travel between cities
- Instant travel between districts
- Fast access to commercial zones
- Future sponsored and featured merchant destinations

## Core Principle

Travel must never block shopping.

Prontera Commerce supports both:

- Immersive exploration
- Fast commerce navigation

When these goals conflict, commerce convenience takes priority over realism.

## Data Model

### WorldZone

Represents a city or major commerce region.

Examples:

- `PRONTERA`
- `GEFFEN`
- `PAYON`
- `MORROC`
- `ALBERTA`
- `JUNO`

Fields include:

- `code`
- `name`
- `description`
- `status`
- `thumbnailUrl`
- `mapImageUrl`
- `sortOrder`

### WorldDistrict

Represents a commercial district inside a city.

Examples:

- Fashion Street
- Food Market
- AI District
- Wholesale Market
- Pet Market
- Electronics Zone

Fields include:

- `zoneId`
- `code`
- `name`
- `description`
- `category`
- `sortOrder`

### CommerceGate

Represents a travel connection between zones or districts.

Gate types:

- `CITY_GATE`
- `DISTRICT_GATE`
- `SPECIAL_GATE`

Statuses:

- `ACTIVE`
- `DISABLED`

A gate may connect:

- City to city
- City to district
- District to district
- Special future event destinations

## City Travel

City gates connect major world zones such as Prontera, Geffen, Payon, Morroc, Alberta, and Juno.

These gates will support future city-to-city travel from world maps, storefront portals, or customer quick navigation menus.

## District Travel

District gates connect specialized commercial areas such as Fashion Street, Food Market, AI District, and Wholesale Market.

District travel helps customers quickly reach the most relevant merchant cluster instead of searching the entire world manually.

## Smart Travel Foundation

`TravelRecommendationService` is future-ready and non-AI in this sprint.

Current keyword examples:

- `keyboard` routes toward AI District
- `fashion` routes toward Fashion Street
- `wholesale` routes toward Morroc Wholesale Zone

Future versions may use search behavior, product taxonomy, customer intent, merchant ranking, availability, and AI-assisted recommendations.

## Future AI Travel Assistant

A future AI travel assistant may:

- Interpret customer intent
- Recommend destinations
- Explain why a district is relevant
- Suggest nearby merchants
- Surface sponsored or featured destinations with clear labeling

AI recommendations must follow Human-in-the-Loop governance rules where high-impact policy or monetization decisions are involved.

## Merchant Benefits Roadmap

Future Pro plan capabilities:

- Featured gate placement
- Sponsored destination placement

Future Business plan capabilities:

- District sponsorship

Future Enterprise capabilities:

- Custom zone branding

No monetization implementation is included in this foundation sprint.

## Open World Integration

Future customer flow:

1. Customer avatar enters a city.
2. Customer may walk manually.
3. Customer may click a Commerce Gate.
4. Customer may quick travel.
5. Customer may search for a destination.
6. Customer arrives at a commercial city, district, or shop-adjacent zone.

This architecture prepares for world maps, avatar navigation, district portals, and future virtual shop interiors without implementing a 3D world or game engine yet.

## Out of Scope

This sprint does not implement:

- Avatar rendering
- 3D world
- Game engine
- AI travel routing
- Marketplace search engine
- Sponsored placement monetization
