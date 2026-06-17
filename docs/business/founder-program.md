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

## Founder Application Platform

Sprint 11A adds the operational Founder Merchant Platform:

```text
GET /founders/metrics
POST /founders/applications
GET /founders/me
GET /admin/founders
PATCH /admin/founders/:id/approve
PATCH /admin/founders/:id/reject
```

The approval flow activates Founder status, 1 month Pro trial access, Founder District eligibility, and Founder world placement when a matching shop is available.

## Governance

COM / Ponrat / Founder retains final authority over Founder Merchant program policy, eligibility, and public usage.

Founder Merchant access should be used carefully because it may affect priority placement, early feature access, and merchant-facing recognition.
