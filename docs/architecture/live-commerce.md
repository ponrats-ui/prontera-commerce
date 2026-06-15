# Live Commerce Architecture

Live Commerce is a Pro-plan storefront capability that lets merchants show YouTube live streams or video embeds inside their shop experience.

The Sprint 8A foundation is intentionally lightweight. It stores live channel metadata, validates YouTube URLs, normalizes embed URLs, enforces plan access, and provides merchant dashboard controls. It does not implement native streaming, WebRTC, video uploads, or YouTube API integrations.

## Business Purpose

Live Commerce differentiates the Pro tier by helping merchants:

- Attract customers into their shop
- Run live selling sessions
- Host product demos
- Create a stronger virtual storefront experience
- Prepare for future Open World shop screens

## Data Model

`ShopLiveChannel` belongs to `Shop` and optionally references the creating `User`.

Key fields:

- `shopId`
- `provider`
- `title`
- `description`
- `videoUrl`
- `embedUrl`
- `thumbnailUrl`
- `status`
- `startsAt`
- `endsAt`
- `createdById`
- `deletedAt`

The model is soft-deletable. Historical channel records remain available for audit and future analytics.

## Provider Strategy

Sprint 8A fully supports:

- `YOUTUBE`

Future-ready providers:

- `FACEBOOK`
- `TIKTOK`
- `CUSTOM_EMBED`

YouTube support is URL based only. The platform does not call the YouTube API or perform OAuth in this sprint.

## Plan Access

Live Commerce is enabled for:

- `PRO`
- `BUSINESS`
- `ENTERPRISE`

Live Commerce is disabled for:

- `STARTER`

The API uses a feature-flag style helper, `canUseLiveCommerce(shopId)`, based on the current shop subscription plan. Starter shops receive:

```text
Live Commerce is available on Pro plan and above.
```

## Authorization

- `OWNER` and `MANAGER` can manage live channels.
- `CASHIER` and `STAFF` can read live channels.
- Public storefront access is a future feature.

This follows the existing shop permission architecture used by catalog, inventory, orders, and CRM modules.

## Active Channel Rule

Each shop can keep multiple live channel records for history and scheduling, but only one non-deleted channel may have status `LIVE` at a time.

The database uses a partial unique index for this rule, and the service rejects conflicting go-live attempts with `409 Conflict`.

## Merchant Dashboard

The dashboard route is:

```text
/dashboard/live-commerce
```

Capabilities:

- List shop live channels
- Create a YouTube live channel
- Paste a YouTube URL
- Preview the embedded video
- Go live
- End live
- Disable a channel
- Show the Pro-plan access message for Starter shops

The sidebar labels the feature with a `Pro` badge.

## Future Storefront Support

Future public route:

```text
/shops/:shopSlug/live
```

This route should display the current active live channel for customer-facing storefront and marketplace experiences.

## Future Open World Integration

Live Commerce is designed to become a screen or media surface inside future virtual shops in the Open World Commerce layer. The current API stores enough structured metadata for future rendering in:

- Merchant shop pages
- Marketplace storefronts
- Virtual shop interiors
- Event-driven commerce spaces

## Out of Scope

Sprint 8A does not implement:

- Native live streaming infrastructure
- Video uploads
- WebRTC
- YouTube API OAuth
- Payment gateways
- Marketplace search
- Virtual world systems
- AI agents
