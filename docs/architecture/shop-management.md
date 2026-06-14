# Shop Management Architecture

Sprint 2 establishes the merchant shop foundation for Prontera Commerce. The system lets authenticated users create shops, manage shop profiles, assign staff roles, and prepare shop records for global commerce.

This architecture intentionally excludes product catalog, inventory, POS, payments, marketplace search, AI agents, and virtual world behavior.

## Goals

- Allow authenticated users to create and manage merchant shops.
- Create an explicit owner membership record during shop creation.
- Support shop staff roles and future permission expansion.
- Store global shop preferences from day one.
- Keep all high-impact commercial actions ready for future Human-in-the-Loop approval workflows.

## Data Model

### Shop

`Shop` represents a merchant-operated business presence.

Core fields:

- `ownerId`
- `name`
- `slug`
- `description`
- `logoUrl`
- `bannerUrl`
- `contactEmail`
- `contactPhone`
- `status`
- `isPublic`
- `countryCode`
- `localeCode`
- `currencyCode`
- `preferredLocale`
- `preferredCurrency`
- `timeZone`
- `deletedAt`

Global readiness:

- `countryCode` connects the shop to country-specific tax, payment, and fulfillment rules.
- `preferredLocale` prepares the shop for localized presentation.
- `preferredCurrency` prepares the shop for multi-currency pricing and settlement.
- `timeZone` supports local operating hours, reports, and future scheduled workflows.

### ShopStaff

`ShopStaff` connects users to shops with role-based permissions.

Roles:

- `OWNER`
- `MANAGER`
- `CASHIER`
- `STAFF`

The shop creator receives an active `OWNER` staff record at creation time.

### ShopInvitation

`ShopInvitation` stores invitation records for future onboarding workflows.

Fields:

- `email`
- `role`
- `status`
- `expiresAt`

Email delivery is intentionally out of scope for Sprint 2.

## Permission Model

Shop permission logic is centralized in `ShopPermissionsService`.

Supported checks:

- `isShopOwner`
- `isShopStaff`
- `hasShopRole`
- `canManageShop`
- `canManageStaff`

Permission rules:

- `OWNER` has full shop access.
- `MANAGER` can manage shop profile and staff except `OWNER` and `MANAGER`.
- `CASHIER` is reserved for future POS workflows.
- `STAFF` has limited read access.
- Only `OWNER` can remove a `MANAGER`.
- No workflow may remove or demote the last active `OWNER`.

## Business Rules

- Shop creation requires an authenticated user.
- Shop slugs are unique among non-deleted shops.
- Shop slugs must use lowercase letters, numbers, and hyphens.
- Shop deletion is soft deletion only.
- Global fields are validated against country, locale, currency, and IANA timezone data.
- Staff removal is implemented as a soft removal.
- Invitation creation does not send email in Sprint 2.

## API Boundary

Sprint 2 owns:

- Shop profile management
- Staff role assignment
- Invitation record creation
- Shop-level authorization helpers

Sprint 2 does not own:

- Products
- Inventory
- POS
- Payments
- AI agents
- Virtual world behavior
- Marketplace search
- Web or mobile dashboard screens

## Human-in-the-Loop Readiness

Prontera Commerce remains Founder-led and Human-in-the-Loop. Sprint 2 does not implement approval workflows, but the shop management model prepares for them by making ownership, staff roles, and high-impact actions explicit.

Future high-impact shop actions should require human approval when they affect:

- Merchant suspension
- Marketplace moderation
- Pricing policy
- Payment setup
- Tax setup
- Legal or compliance status
- Irreversible data operations

## Future Roadmap

Planned extensions:

- Shop-level tax profiles
- Shipping zones
- Payment gateway onboarding for Stripe and local providers
- Product catalog ownership
- Inventory locations
- Staff permission scopes
- Audit logs for high-impact actions
- Approval requests for sensitive operations
- Shop translations for localized storefronts
