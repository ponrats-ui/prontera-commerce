# Sprint 11A Founder Merchant Platform

## Goal

Create the operational platform for recruiting, reviewing, approving, and onboarding the first Founder Merchants.

This sprint turns the Founder Merchant 100 Program from a growth strategy into a working acquisition system for the Revenue Era.

## Product Scope

Sprint 11A includes:

- Founder Merchant landing page
- Founder application form
- Admin application review
- Founder approval and rejection workflow
- Founder badge activation
- 1 month Pro trial activation
- Founder District eligibility
- Merchant dashboard Founder widget
- Public Founder counter
- Founder acquisition metrics

## Web Routes

Public routes:

- `/founders`
- `/founders/apply`

Admin route:

- `/admin/founders`

Merchant dashboard:

- `/dashboard`

## Founder Merchant Landing Page

The Founder Merchant landing page explains:

- What is a Founder Merchant?
- Founder Benefits
- Why Join Early?
- Merchant Civilization Vision
- Apply Now

Founder benefits displayed:

- Founder Badge
- 1 Month Pro Free
- Founder District Placement
- Early Access Features
- Founder Recognition
- Priority Discovery

## Founder Application Form

The application form collects:

- Merchant Name
- Business Name
- Business Type
- Category
- Website
- Facebook Page
- Contact Email
- Phone Number
- Motivation

The form is public because merchant acquisition should not require an account before initial interest is captured.

## Founder Application Management

Admins can review Founder applications at `/admin/founders`.

Admin actions:

- Review Applications
- Approve Founder
- Reject Founder
- Add Notes
- View Status

Admin approval may include a `shopId`. If a shop is not provided, the platform attempts to resolve a matching shop by applicant email or business name.

## Data Model

Sprint 11A introduces:

```text
FounderApplication
```

Fields:

- `id`
- `merchantName`
- `businessName`
- `businessType`
- `category`
- `website`
- `facebookPage`
- `email`
- `phone`
- `motivation`
- `status`
- `reviewedBy`
- `reviewNotes`
- `submittedAt`
- `reviewedAt`

Status:

- `PENDING`
- `APPROVED`
- `REJECTED`

## Approval Flow

When an application is approved and a shop is available:

- Founder Merchant record is created or reactivated.
- Founder Badge is assigned.
- Founder District eligibility is enabled.
- 1 month Pro trial is activated.
- Merchant world location receives Founder placement.
- Merchant building is marked published and receives Founder storefront treatment.

If no shop is available yet, the application is approved and benefits can activate once the merchant has a matching shop.

## API

Public:

```text
GET /founders/metrics
POST /founders/applications
```

Merchant:

```text
GET /founders/me
```

Admin:

```text
GET /admin/founders
PATCH /admin/founders/:id/approve
PATCH /admin/founders/:id/reject
```

## Metrics

Sprint 11A tracks:

- Applications
- Approved Founders
- Active Founders
- Founder Conversion Rate

The public counter supports the Founder Merchant 100 target and the early 25-founder visibility milestone.

## Governance

COM / Ponrat / Founder remains the final decision-maker for Founder Merchant eligibility, public recognition, and program policy.

Founder approval remains Human-in-the-Loop because it affects merchant trust, public visibility, subscription benefits, and Founder District placement.

## Related Documents

- [Founder Merchant 100 Program](../growth/founder-merchant-100-program.md)
- [Merchant Acquisition Playbook](../growth/merchant-acquisition-playbook.md)
- [Merchant Personas](../growth/merchant-personas.md)
- [Revenue Era Roadmap](../strategy/revenue-era-roadmap.md)
