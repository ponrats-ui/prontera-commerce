# Sprint 15 Living Citizens and AI Merchant Foundation

## Goal

Sprint 15 makes Merchant City feel inhabited and gives every demonstrated shop
a memorable human identity.

The buyer loop becomes:

```text
Walk through a populated city
  -> notice citizens talking and moving
  -> approach a recognizable store
  -> meet the merchant owner
  -> enter a composed interior
  -> ask the disclosed AI shopkeeper about published information
```

The implementation remains lightweight, two-dimensional, public, and
mobile-friendly. It does not introduce 3D rendering, multiplayer simulation, or
a schema migration.

## Sprint 15A: Player Character Entity

The local player entity contains:

- `id`
- `name`
- `class`
- `avatar`
- `title`
- `positionX`
- `positionY`

It is created from the selected starter character and the locally persisted
Merchant City position.

Movement continues to support:

- WASD
- Arrow keys
- Click or tap to move
- Holdable on-screen direction controls
- Smooth animation-frame movement

The city nameplate displays the character name, class, and title.

## Sprint 15B: Living Citizens

Merchant City includes six original citizen profiles:

| Citizen        | Role                  | Area           |
| -------------- | --------------------- | -------------- |
| Mira           | Town Guide            | Central plaza  |
| Cedric         | Merchant Guild Master | Merchant Guild |
| Luna           | Coffee Merchant       | Market road    |
| Captain Arlo   | Harbor Captain        | Harbor route   |
| Professor Byte | Tech Inventor         | Tech route     |
| Orin           | Warp Gate Keeper      | Warp Gate      |

Citizen profiles contain:

- `name`
- `role`
- `portrait`
- `greeting`
- `location`
- lightweight walking route

Citizens appear directly in the town, follow small CSS-based routes, and display
timed speech bubbles. Fewer citizens and animations are shown on small screens
to preserve legibility and performance.

## Sprint 15C: Merchant Identity

Store identity is paired with a merchant profile containing:

- `merchantId`
- `merchantName`
- `merchantTitle`
- `merchantStory`
- `merchantAvatar`
- `merchantReputation`
- `personality`
- `greeting`

Canonical demo identities include:

- Luna, Coffee Roaster — Artisan Coffee House
- Captain Arlo, Harbor Quartermaster — Harbor Supply Shop
- Professor Byte, Keyboard Inventor — Tech Bazaar Keyboard Store
- Mae, Neighborhood Shopkeeper — Demo General Store

Unknown shops receive a category-aware fallback profile without changing the
database contract.

## Sprint 15D: AI Shopkeeper V1

The AI foundation separates:

```text
WorldShop + MerchantIdentity
  -> AiMerchantContext
  -> Prompt Builder
  -> Provider Adapter
  -> AiMerchantResult
```

Sprint 15 ships a mock provider. The UI does not depend on an external SDK, so a
future OpenAI provider can implement the same adapter contract.

The context contains:

- Store profile
- Merchant profile and personality
- Published featured products
- Published promotions
- Merchant-approved operating boundaries

The mock assistant can answer questions about recommendations, published
products, current promotions, and the merchant story.

Safety boundaries:

- The assistant identifies itself as AI.
- It does not invent products, prices, discounts, stock, or policies.
- It cannot approve refunds, pricing exceptions, legal claims, or policy
  changes.
- Checkout remains the final pricing authority.
- Sensitive or uncertain requests must escalate to the human merchant.

## Sprint 15E: Shop Interior Scene

The buyer storefront now presents a composed place containing:

- Visible merchant owner character
- Merchant greeting
- Owner name, title, story, personality, and reputation
- Product shelving
- Promotion board
- Live commerce room
- Shop counter
- AI merchant conversation area

The exterior remains visible before the interior so entering the route preserves
the feeling of moving from city street to merchant location.

## Sprint 15F: Ambient World Effects

Lightweight CSS effects include:

- Fountain water and spray
- Moving citizens
- Timed speech bubbles
- Crossing birds
- Swaying shop signs
- Moving market flags
- Lantern glow
- Floating merchant greeting

Animations are disabled when the operating system requests reduced motion.

## Validation

- Existing repository tests pass
- Workspace typechecks pass
- Production build passes
- Desktop and mobile browser checks pass
- No schema changes
- No external AI provider or credential required
- Existing unrelated worktree changes remain untouched
