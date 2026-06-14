# Shops API

The Shops API provides the Sprint 2 Shop Management foundation for authenticated merchants. It supports shop profile creation, owner and staff membership, soft deletion, invitations, and global commerce preferences.

All endpoints require JWT authentication.

## Shop Profile Endpoints

### POST /shops

Creates a shop for the authenticated user.

Required fields:

- `name`
- `slug`
- `countryCode`
- `preferredLocale`
- `preferredCurrency`
- `timeZone`

Optional fields:

- `description`
- `logoUrl`
- `bannerUrl`
- `contactEmail`
- `contactPhone`

Business rules:

- The creator becomes the shop owner.
- An active `OWNER` staff record is created for the creator.
- `slug` must be unique among active shops.
- `slug` must use lowercase letters, numbers, and hyphens.
- `countryCode`, `preferredLocale`, `preferredCurrency`, and `timeZone` are validated before creation.

### GET /shops/me

Returns shops where the authenticated user is the owner or an active staff member.

### GET /shops/:id

Returns shop details when the user is owner or staff, or when the shop is public or active.

### PATCH /shops/:id

Updates shop profile fields.

Allowed fields:

- `name`
- `description`
- `logoUrl`
- `bannerUrl`
- `contactEmail`
- `contactPhone`
- `preferredLocale`
- `preferredCurrency`
- `countryCode`
- `timeZone`
- `status`

Authorization:

- `OWNER` can update the shop.
- `MANAGER` can update the shop.
- `CASHIER` and `STAFF` cannot update the shop profile.

### DELETE /shops/:id

Soft deletes a shop by setting `deletedAt` and archiving the shop status.

Authorization:

- Only `OWNER` can delete a shop.
- Shops are never hard deleted by this endpoint.

## Staff Endpoints

### GET /shops/:id/staff

Returns active and historical staff records for a shop.

Authorization:

- Any active shop staff member can view staff records.

### POST /shops/:id/staff

Adds an existing user as shop staff.

Fields:

- `email`
- `role`
- `title`

Authorization:

- `OWNER` can add any staff role.
- `MANAGER` can add `CASHIER` or `STAFF`.
- `MANAGER` cannot add `OWNER` or another `MANAGER`.

### PATCH /shops/:id/staff/:staffId

Updates a staff member role, status, or title.

Authorization:

- `OWNER` can update any staff member.
- `MANAGER` can update `CASHIER` and `STAFF`.
- `MANAGER` cannot update `OWNER` or `MANAGER`.
- The final active `OWNER` cannot be removed or demoted.

### DELETE /shops/:id/staff/:staffId

Soft removes a staff member by setting status to `REMOVED` and `deletedAt`.

Authorization:

- `OWNER` can remove any staff member.
- `MANAGER` can remove `CASHIER` and `STAFF`.
- The final active `OWNER` cannot be removed.

## Invitation Endpoints

### POST /shops/:id/invitations

Creates a shop invitation record.

Fields:

- `email`
- `role`
- `expiresAt`

Business rules:

- `expiresAt` must be in the future.
- Email delivery is not implemented in Sprint 2.
- Invitation records are stored for future onboarding workflows.

### GET /shops/:id/invitations

Lists shop invitations for the shop.

Authorization:

- `OWNER` and `MANAGER` can view invitations.

## Staff Roles

- `OWNER`: Full access to shop profile, staff, invitations, and deletion.
- `MANAGER`: Can manage shop profile and non-owner, non-manager staff.
- `CASHIER`: Reserved for future POS permissions.
- `STAFF`: Limited read access.

## Global Fields

Shops are global-ready from creation:

- `countryCode`
- `preferredLocale`
- `preferredCurrency`
- `timeZone`

These fields align with user global preferences and prepare shops for localized catalog, tax, payment, and fulfillment features.

## Future Roadmap

Future shop API extensions may include:

- Product catalog management
- Inventory and stock locations
- POS permissions for `CASHIER`
- Payment gateway onboarding
- Tax profile management
- Shipping zone management
- Marketplace visibility controls
- AI-assisted shop operations with Human-in-the-Loop approval workflows
