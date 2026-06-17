# Storefront System

The Sprint 10 storefront system gives each placed merchant a world location without creating 3D assets or game mechanics.

## Sprint 12 Building Layer

Sprint 12 introduces merchant buildings as the visible identity layer for storefronts.

Buildings support:

- store signs
- logos
- banners
- Founder badges
- Official Store badges
- Live Commerce indicators
- promotion banners
- future advertising hooks

Reference:

- [Sprint 12 Merchant Building System](../product/sprint-12-merchant-building-system.md)

## Merchant World Location

`MerchantWorldLocation` connects a shop to:

- `WorldCity`
- `WorldDistrict`
- building style
- storefront theme
- featured placement
- Founder Merchant placement

Each shop can have one world location in this foundation.

## Building Styles

Supported data-only building styles:

- `CLASSIC_SHOP`
- `MODERN_SHOP`
- `MARKET_STALL`
- `TECH_STORE`
- `PREMIUM_HALL`

These are storefront abstractions for UI and future asset pipelines. They are not 3D models.

## Storefront Themes

Supported themes:

- `WARM_MARKET`
- `HARBOR_TRADE`
- `ARTISAN_LIGHT`
- `TECH_BAZAAR`
- `FOUNDER_GOLD`

Themes must follow the original Prontera Commerce art direction and pass IP review before production use.

## Storefront Preview

The public storefront preview can display:

- shop name
- category
- city
- district
- live status
- Founder Merchant badge
- promotion badge
- featured products
- subscription tier
- building style

Checkout, payments, and order authority remain in the commerce engine. Storefront pages are discovery surfaces, not financial source-of-truth records.

## Future Expansion

Future sprints may add richer storefront visuals, merchant banners, approved map art, and interactive district browsing. Those additions must remain commerce-first and should not introduce combat, quests, leveling, equipment, or MMORPG systems.
