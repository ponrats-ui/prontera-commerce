# Sprint 14 Living Commerce World Foundation

## Goal

Sprint 14 changes the buyer experience from looking at a commerce map to
inhabiting a lightweight two-dimensional town.

The city remains public, mobile-friendly, and commerce-first. The emotional
loop is:

```text
Choose a character
  -> enter Merchant City
  -> walk through a handcrafted town
  -> recognize a merchant building
  -> approach and enter the shop
```

No full 3D engine, physics engine, buyer account, combat, progression, or
multiplayer system is introduced.

## Sprint 14A: Playable Character System

The character model contains:

- `id`
- `name`
- `class`
- `sprite`
- `title`
- `level` reserved for future use
- `reputation` reserved for future use

Starter characters:

| Class      | Character | Title             | Sprite identity     |
| ---------- | --------- | ----------------- | ------------------- |
| Adventurer | Ari       | Curious Wayfinder | Suntrail Adventurer |
| Merchant   | Milo      | Friendly Trader   | Brassbell Merchant  |
| Creator    | Cora      | Market Maker      | Blueink Creator     |
| Explorer   | Elio      | Gate Seeker       | Greenway Explorer   |

Character selection persists in browser storage under
`prontera_buyer_avatar`.

The first sprite system is CSS-native, original, scalable, and direction-aware.
It provides reusable walking characters without introducing copied franchise
assets or a heavy bitmap pipeline. It can later be replaced with approved
original sprite sheets without changing the character data contract.

## Sprint 14B: Walking System

Merchant City supports:

- WASD
- Arrow keys
- Click or tap to move
- Holdable on-screen directional controls
- Diagonal movement normalization
- Smooth `requestAnimationFrame` movement
- Directional character facing
- Walking animation

The last position persists under
`prontera_buyer_position_merchant_city`.

The implementation intentionally avoids a physics dependency. Movement is a
discovery interaction, not a simulation system.

## Sprint 14C: Merchant City Visual Upgrade

The city scene now includes:

- Central market road
- Wish Fountain
- Merchant Guild
- Warp Gate
- Market bridge and canal
- Trees
- Street lamps
- City banners
- Market stalls
- Green spaces
- Town plaza

All scenery is an original Prontera Commerce composition built from lightweight
web-native shapes. Named visual inspirations define the desired emotional
quality only; no external maps, layouts, characters, or assets are copied.

## Sprint 14D: Building Exterior System

Every merchant is represented by a facade before the buyer enters the shop.

Supported facade identities:

- General Store
- Coffee House
- Restaurant
- Harbor Supply
- Tech Shop
- Artisan Workshop

Each identity can vary:

- Wall and roof palette
- Roof treatment
- Signboard treatment
- Awning
- Window display
- Door
- Exterior decoration
- Live commerce signal

The same facade component is reused on the town map, merchant discovery cards,
and the storefront exterior. Merchant category, name, and storefront theme
select the closest facade identity without a database migration.

## Proximity Discovery

Approaching a merchant building:

- Highlights the facade
- Updates the character status
- Reveals an `Enter shop` action

This binds exploration directly to real merchant discovery.

## Accessibility and Mobile

- Town controls have accessible labels.
- The map remains keyboard operable.
- Pointer movement works with touch.
- On-screen controls support press-and-hold movement.
- Character and facade visuals use semantic labels.
- Layout and scene geometry adapt at mobile breakpoints.

## Validation

Sprint 14 requires:

- Web typecheck passes
- Production build passes
- Existing repository tests pass
- No schema changes
- Desktop and mobile browser verification
- No browser console errors

## Next World Milestones

### Sprint 15

- Merchant NPC profiles and original NPC characters
- Shop interior scenes
- Merchant-approved AI context builder
- Mock AI shopkeeper before external model integration

### Sprint 16

- Regional world map
- Merchant City
- Tech Republic
- Harbor Kingdom
- Artisan Valley
- Creator Island
- Industrial District
- Locked future regions and connected Warp Gates

### Sprint 17

- Follow merchant
- Favorite shop
- Reputation and reviews
- Guilds and commerce friends
- Visitor and follower signals
