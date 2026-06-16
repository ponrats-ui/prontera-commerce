# Founder Merchant Program

The Founder Merchant program is an early merchant access and recognition layer for Prontera Commerce.

It supports the merchants who help validate the platform during early internal alpha and launch phases.

## Data Fields

Founder Merchant records support:

- `isFounderMerchant`
- `founderGrantedAt`
- `founderExpiresAt`

## Benefits

Founder Merchant benefits:

- Founder badge
- Pro access
- Priority placement
- Early feature access

Founder Merchant status is independent from paid payment gateway integration in Sprint 9A.

## Access Model

If a shop has an active Founder Merchant record, it receives Pro-level access even if its base merchant subscription is Starter.

A Founder Merchant record is active when:

- `isFounderMerchant = true`
- `deletedAt = null`
- `founderExpiresAt` is empty or in the future

## Admin Grant

Admins may grant Founder Merchant access through:

```text
POST /admin/subscriptions/founders
```

Fields:

- `shopId`
- `founderExpiresAt`

## Governance

COM / Ponrat / Founder retains final authority over Founder Merchant program policy, eligibility, and public usage.

Founder Merchant access should be used carefully because it may affect priority placement, early feature access, and merchant-facing recognition.
