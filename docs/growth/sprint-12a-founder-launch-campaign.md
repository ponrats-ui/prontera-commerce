# Sprint 12A Founder Launch Campaign

## Goal

Launch the first merchant acquisition campaign and optimize the Founder Merchant funnel.

Sprint 12A turns the Founder Merchant 100 Program into a measurable launch campaign.

## Campaign Scope

Included:

- Founder Landing Page Optimization
- Founder Counter
- Founder Waitlist
- Referral Foundation
- Founder Metrics Dashboard
- Founder Success Stories Placeholder
- Campaign Tracking

Not included:

- paid ads automation
- email marketing automation
- reward payouts
- affiliate program
- external CRM integration

## Founder Landing Page Optimization

The `/founders` page now supports:

- Founder Merchant counter
- campaign funnel metrics
- waitlist capture
- referral capture
- success story placeholders
- direct application CTA tracking

## Founder Counter

The public counter displays:

```text
{approvedFounders} Founders Joined
```

The launch campaign uses:

- 100 Founder Merchant goal
- 25 Founder public milestone

## Founder Waitlist

Waitlist entries capture:

- merchant name
- business name
- email
- category
- source
- referral code

API:

```text
POST /founders/waitlist
```

## Referral Foundation

The referral foundation captures:

- referrer email
- referred merchant email
- referral code
- referral status

API:

```text
POST /founders/referrals
```

This is a foundation only. Rewards, payouts, and affiliate logic are not implemented.

## Campaign Tracking

Tracked events:

- `LANDING_VIEW`
- `APPLY_CLICK`
- `APPLICATION_SUBMITTED`
- `WAITLIST_JOINED`
- `REFERRAL_CAPTURED`
- `STORY_INTEREST`

API:

```text
POST /founders/campaign-events
```

## Founder Metrics Dashboard

The admin Founder dashboard shows:

- applications
- approved founders
- active founders
- conversion rate
- waitlist count
- referral count
- landing views
- apply clicks

API:

```text
GET /founders/campaign
GET /admin/founders/campaign-metrics
```

## Success Stories Placeholder

The launch page includes placeholders for:

- Computer Shop Founder
- Coffee Shop Founder
- Handmade Creator Founder

These placeholders should later be replaced with real approved merchant stories.

## Success Metrics

Primary:

- 100 Founder Merchants
- 25 public milestone founders
- waitlist growth
- referral growth
- application conversion

Supporting:

- landing views
- apply clicks
- application submissions
- approved founders
- active founders

## Related Documents

- [Founder Merchant 100 Program](./founder-merchant-100-program.md)
- [Merchant Acquisition Playbook](./merchant-acquisition-playbook.md)
- [Merchant Personas](./merchant-personas.md)
- [Sprint 11A Founder Merchant Platform](../product/sprint-11a-founder-merchant-platform.md)
- [Revenue Era Roadmap](../strategy/revenue-era-roadmap.md)
