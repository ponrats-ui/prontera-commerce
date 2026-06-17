# Sprint 12 Merchant Building System

## Goal

Transform shops from database records into visible merchant buildings inside the Merchant Civilization world.

Sprint 12 establishes the first visual identity layer for Prontera Commerce.

## Building System

Every published merchant receives a building.

Building types:

- Small Shop
- Medium Shop
- Large Shop
- Official Store

Data enum:

```text
BuildingType
SMALL
MEDIUM
LARGE
OFFICIAL
```

## Storefront Themes

Merchant buildings support storefront themes:

- Classic
- Modern
- Tech
- Artisan
- Harbor
- Wholesale

These themes follow the Prontera original art direction and must remain non-infringing.

## Visual Identity

Buildings display:

- Store Sign
- Store Logo
- Founder Badge
- Official Store Badge
- Live Commerce Indicator
- Promotion Banner

## World Integration

The world portal and world map display merchant buildings with:

- shop name
- building type
- founder status
- official store status
- live status
- promotion banner

Public merchant profiles are available at:

```text
/merchant/:id
```

The `id` can resolve a shop slug or shop id.

## Building Customization

Merchant dashboard route:

```text
/dashboard/building-settings
```

Merchants can:

- choose theme
- set logo URL
- edit store sign
- set banner URL

## Founder Features

Founder merchants automatically receive:

- Founder Badge
- Founder Building Decoration
- Founder Highlight Frame

Founder state is derived from the Founder Merchant Program and stored on the building foundation for visibility.

## Live Commerce Integration

When a merchant is live:

- the building displays `LIVE`
- live stores receive priority visibility in world ranking
- public profiles show live status

## Admin Tools

Admin route:

```text
/admin/buildings
```

Admins can:

- review buildings
- assign official store status
- moderate signage

## Metrics

The platform tracks:

- published buildings
- founder buildings
- official stores
- live stores

## Future Hooks

Sprint 12 prepares placeholders for:

- Rooftop Billboard
- District Sponsorship
- Advertising Zones
- Seasonal Decorations

No advertising functionality is implemented in this sprint.

## API

Public:

```text
GET /buildings
GET /buildings/metrics
GET /merchant/:id
```

Merchant:

```text
GET /buildings/me
PATCH /buildings/me
```

Admin:

```text
GET /admin/buildings
PATCH /admin/buildings/:id
```

## Related Documents

- [World Experience](../world/world-experience.md)
- [Storefront System](../world/storefront-system.md)
- [Discovery Engine](../world/discovery-engine.md)
- [Revenue Era Roadmap](../strategy/revenue-era-roadmap.md)
