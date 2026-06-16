# Merchant Subscription Model

Sprint 9A introduces merchant subscription lifecycle management for Prontera Commerce.

The subscription foundation supports:

- 30-day free trial
- Starter Free Forever
- Pro subscription
- Founder Merchant program integration

Payment gateway integration is intentionally excluded from this sprint.

## Plans

### Starter Free Forever

Starter is free forever.

Limits:

- 20 products
- 50 orders per month
- No live commerce
- No advanced analytics
- No multi-staff
- No AI merchant assistant

Starter is the fallback plan after trial expiration or subscription cancellation.

### Pro

Pro supports:

- Live Commerce
- Unlimited products
- Unlimited orders
- CRM advanced features
- Promotion Engine full access
- Multi-staff
- Analytics dashboard

During the 30-day trial, merchants receive Pro-level access.

### Enterprise

Enterprise is reserved for future custom merchant contracts, larger operators, and platform-managed commercial agreements.

## Trial Lifecycle

When a merchant creates a shop, Prontera Commerce automatically creates a merchant subscription:

- `status = TRIAL`
- `trialStartAt = shop creation time`
- `trialEndAt = trialStartAt + 30 days`
- initial plan = Pro trial access

After the trial ends, the shop downgrades to Starter unless the merchant upgrades to Pro.

## Subscription Statuses

Sprint 9A lifecycle statuses:

- `TRIAL`
- `ACTIVE`
- `GRACE_PERIOD`
- `EXPIRED`
- `CANCELLED`

Legacy billing statuses may still exist in the database for earlier billing skeleton compatibility.

## API Surface

- `GET /subscriptions/plans`
- `GET /subscriptions/me`
- `POST /subscriptions/upgrade`
- `POST /subscriptions/cancel`
- `GET /subscriptions/founder`
- `POST /admin/subscriptions/founders`

## Access Rules

Starter blocks Live Commerce and future advanced features.

Pro enables Live Commerce, unlimited products, unlimited orders, advanced CRM, full Promotion Engine access, multi-staff, and analytics.

Founder Merchant status grants Pro access while active.

## Future Work

Future subscription sprints may add:

- External payment gateway checkout
- Invoice automation
- Grace period billing recovery
- Usage limit enforcement
- Analytics entitlement checks
- AI Merchant entitlement checks
