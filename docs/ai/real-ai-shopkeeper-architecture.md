# Real AI Shopkeeper Architecture

Sprint 17C introduces a real AI shopkeeper architecture with safe local fallback.

## Goal

Inside a shop, visitors should feel they are talking to a merchant character,
not reading static product copy.

## Runtime Flow

```text
Visitor question
  ↓
AI context builder
  ↓
Provider route: /api/ai-shopkeeper
  ↓
OpenAI provider if OPENAI_API_KEY exists
  ↓
Contextual mock provider if no key or provider fails
  ↓
Shopkeeper response
```

## Context Builder

The context builder gathers:

- shop profile
- merchant identity
- merchant story and backstory
- products
- published prices
- promotions
- live commerce status
- region, city, and district
- merchant reputation
- visitor question
- safety boundaries

## Provider Strategy

`OPENAI_API_KEY` is optional.

If present, the server route calls OpenAI through the Responses API.

If absent, local development uses contextual mock mode. The mock responds
differently to:

- recommendations
- prices
- discounts/promotions
- product questions
- shop/merchant story questions
- live commerce questions

## Safety Boundaries

The shopkeeper must not invent:

- products
- prices
- stock
- discounts
- policies
- shipping guarantees
- refunds or exceptions

Uncertain or sensitive requests should be redirected to the human merchant,
checkout, or product details.

## Future Work

- account-aware memory
- merchant-configurable tone
- retrieval over catalog and policy data
- moderation and audit logs
- analytics for unanswered questions
