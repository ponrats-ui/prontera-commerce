# Merchant Personality Engine

Sprint 18A upgrades the AI shopkeeper from generic contextual assistance into a
personality-aware merchant voice.

The engine remains safe, local-development friendly, and ready for a future
OpenAI provider.

## Context stack

```text
Merchant Soul
+ Store Context
+ Product Context
+ Promotions
+ Live Status
+ Region
+ Reputation
+ Customer Message
↓
Prompt Builder
↓
Provider Abstraction
↓
Response
```

## Mock mode

Mock mode remains the default when no provider key is available. It now varies
responses using:

- personality type
- communication style
- merchant class
- favorite product
- catch phrase
- store category
- published products
- promotion state

Example:

Luna answers with warmth and hospitality.

Captain Arlo answers directly and practically.

Professor Byte answers with curiosity and education.

## Safety boundaries

The AI shopkeeper must not invent:

- unpublished products
- prices
- discounts
- stock
- shipping promises
- checkout totals
- refunds or exceptions
- medical, legal, financial, or safety claims

Checkout and product detail screens remain the source of truth.
