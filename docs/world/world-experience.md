# Prontera World Experience

Sprint 10 introduces the first visible commerce world layer for Prontera Commerce.

Prontera is not a game. The world experience exists to help customers discover real merchants through cities, districts, storefronts, live commerce signals, founder placement, and promotion visibility.

## Scope

Included:

- World regions
- World cities
- District locations
- Merchant storefront placement
- Live storefront priority
- Founder Merchant visibility
- Promotion discovery badges
- Public world pages

Excluded:

- Combat
- Leveling
- Equipment
- Quests
- MMORPG mechanics
- Inventory avatars
- Monster systems

## World Structure

The world hierarchy is:

```text
World Region
  World City
    World District Location
      Merchant World Location
```

World regions group related cities. Cities represent commerce destinations such as Merchant City, Harbor Market, Artisan Valley, Tech Bazaar, Wholesale Quarter, Creator Square, and Founder District.

Districts remain commerce functions, not copied fantasy locations. A district can be placed inside a city map with coordinate data.

## Public Experience

The web app exposes:

- `/world`
- `/world/map`
- `/world/cities/[slug]`
- `/world/districts/[slug]`
- `/world/shops/[slug]`

These pages are customer-facing discovery surfaces. They show where merchants belong in the commerce world and expose signals that help customers choose where to go next.

## Visual Direction

All world visuals must follow:

- [Prontera Art Bible](../brand/prontera-art-bible.md)
- [IP Safety Guidelines](../brand/ip-safety-guidelines.md)

The style must remain original, warm, commerce-first, and business-ready. Do not copy cities, maps, UI, NPCs, mascots, names, silhouettes, or visual identities from existing franchises.

## Foundation Rule

The world layer is a navigation and discovery system. It should always support the Merchant OS, Marketplace, Live Commerce, and subscription model before adding any deeper interactive world features.
