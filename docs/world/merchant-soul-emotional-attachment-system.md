# Merchant Soul & Emotional Attachment System

Sprint 17B adds the emotional layer beneath Prontera's commerce world.

It does not add marketplace mechanics, monetization, creator economy, or heavy
new backend systems. It makes the existing world easier to care about.

## Philosophy

People remember:

- characters
- stories
- places
- moments

They do not remember menus, dashboards, or databases.

## Implemented Foundation

### Merchant stories

Merchants now have a richer authored identity foundation:

- journey
- background
- motivation
- dream
- challenge
- memory hook

Storefront pages display these prominently so buyers can like the merchant
before they evaluate the product shelf.

### Favorite merchant and follow-story layer

Existing follow/favorite actions now feel more personal:

- Follow Merchant
- Favorite Shop
- Follow Story
- Visible follower count

These remain local-state foundations for now and can later connect to accounts,
notifications, and merchant CRM.

### Merchant journals

Merchants can have journal entries:

- Daily Notes
- Announcements
- Personal Stories
- World Events

Journal entries appear in shop pages, Commerce Square, and the buyer journey.

### Memory system

The local journey memory tracks:

- first shop visited
- favorite merchant
- first purchase placeholder
- most visited city
- most visited region
- shop visits
- story follows
- NPC conversation count

The `/journey` page displays this as a nostalgic "Your Journey" surface.

### Regional stories

Regions now carry lore and local sayings:

- Merchant City — The Capital of Commerce
- Harbor Kingdom — Gateway of Global Trade
- Artisan Valley — Home of Makers and Creators
- Tech Republic — Land of Innovation
- Creator Island — Signal Home of Digital Creators
- Industrial District — Powerhouse of Production

Regional pages display these as place-memory, not corporate category text.

### NPC conversation memory

Merchant City includes a lightweight town memory card that can say welcome back
and remember the last visited shop. This is intentionally local and simple, but
it establishes the future direction for persistent NPC context.

### Founder legacy

Founder Hall now acts more like a permanent museum:

- Founder Museum
- Founder Timeline
- Milestone Wall
- Alpha Contributors

## Design Constraints

- No schema changes.
- No new monetization.
- No heavy rendering.
- No full 3D.
- No social-network bloat.
- Buyer world remains warm, friendly, human, and memorable.
- Merchant OS remains professional.

## North Star

Users should say:

```text
I like this merchant.
```

before:

```text
I like this product.
```

If users love the people, they will return to the world.
