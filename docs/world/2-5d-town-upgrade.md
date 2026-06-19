# 2.5D Town Upgrade

Sprint 17C upgrades Merchant City from a flat 2D town board into a lightweight
pseudo-isometric commerce world.

## Goal

Make visitors feel:

```text
I am walking into a shop.
```

not:

```text
I am browsing cards.
```

## Implementation

The upgrade remains CSS/HTML based. It does not introduce a 3D engine, canvas,
WebGL, or copyrighted game assets.

Merchant City now includes:

- pseudo-isometric cobblestone paths
- layered plaza depth
- building clusters with shadows
- shopkeeper NPCs near store entrances
- market stalls, lamps, benches, trees, banners, birds, and crowd ambience
- player character positioned inside the town
- clickable merchant buildings

## Building Direction

Building facades continue to be original CSS-native designs. Each shop type can
express unique roofs, signboards, windows, doors, and decorations:

- General Store
- Coffee House
- Harbor Supply
- Tech Shop
- Artisan Workshop
- Merchant Guild

## Performance Constraints

- Mobile-friendly CSS transforms only.
- No heavy rendering.
- Reduced-motion support remains important.
- Buyer world is warm, playful, and emotional.
- Merchant OS remains professional and clean.

## Future Expansion

- time-of-day lighting
- seasonal overlays
- richer NPC route authoring
- region-specific town layouts
- shop entrance micro-interactions
