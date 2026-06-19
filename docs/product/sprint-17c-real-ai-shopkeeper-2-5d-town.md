# Sprint 17C — Real AI Shopkeeper & 2.5D Town Upgrade

## Outcome

Sprint 17C upgrades Prontera's buyer world in two directions:

1. Merchant City feels more like a lightweight 2.5D RPG town.
2. Storefronts include a real conversational AI shopkeeper architecture.

## Implemented

### 2.5D Merchant City

- pseudo-isometric plaza and cobblestone paths
- layered building clusters
- clickable merchant buildings
- visible player character
- NPC citizens
- shopkeeper NPCs near entrances
- warm RPG-style details: flags, lamps, trees, benches, stalls, fountain,
  speech bubbles, and ambient motion

### Building Upgrade

Buildings remain original CSS-native facades with roof, signboard, windows,
doors, decorations, lights, and shadows.

### AI Shopkeeper

- merchant portrait
- merchant name and shop name
- chat history
- user input box
- send button
- loading state
- quick questions
- provider label
- OpenAI-ready server route
- contextual mock fallback

### Shop Interior

- 2.5D interior depth layers
- merchant NPC presence
- product shelves
- promotion board
- live commerce corner
- AI chat panel
- return/shop navigation remains intact

## Non-Goals

- no copyrighted assets
- no full 3D
- no heavy rendering engine
- no schema-breaking changes
- no required OpenAI key for local development

## Validation

Run:

```bash
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test
npm.cmd run test:integration --workspace=@prontera/api
```

Verify:

- `/play`
- `/town/merchant-city`
- `/town/merchant-city/shops`
- `/town/shop/demo-general-store`
- `/town/shop/artisan-coffee-house`
- `/town/shop/harbor-supply-shop`
