# Customer CRM Foundation

Sprint 7 introduces the Customer & CRM Foundation for Prontera Merchant OS. The goal is to give merchants a shop-scoped customer record system that supports POS, online, manual, and imported customer profiles without introducing campaigns, external messaging, promotions, or loyalty redemption.

## Data Model

Core entities:

- `Customer`
- `CustomerAddress`
- `CustomerGroup`
- `CustomerTag`
- `CustomerNote`
- `CustomerActivity`
- `CustomerLoyaltyAccount`

Customers belong to a shop. Addresses, notes, tags, groups, activities, and loyalty records hang from the customer profile.

Customer email and phone are normalized for lookup and uniqueness. Partial unique indexes enforce shop-scoped uniqueness only for active, non-deleted records when email or phone is provided.

## Customer Lifecycle

Customer statuses are `ACTIVE`, `INACTIVE`, and `BLOCKED`.

Customer sources are `POS`, `ONLINE`, `MANUAL`, and `IMPORTED`.

Delete operations are soft deletes. This preserves CRM history and supports future compliance, analytics, and audit workflows.

## Address Rules

Customers can have multiple addresses. The system supports one default shipping address and one default billing address per active customer through soft-delete-aware partial unique indexes.

## Authorization Rules

- `OWNER` and `MANAGER` can manage all CRM records.
- `CASHIER` can create and update customers, add addresses, add notes, and view loyalty.
- `STAFF` can read customer records.

The CRM module uses the existing shop permission architecture so authorization remains consistent with shops, products, inventory, orders, and POS.

## CRM Activity Log

The customer activity log records:

- `customer_created`
- `customer_updated`
- `address_added`
- `note_added`
- `group_assigned`
- `tag_assigned`
- `order_created_reference`

Activity records include metadata and the user who performed the action when available. The log is append-oriented and should support future audit and analytics features.

## Loyalty Foundation

`CustomerLoyaltyAccount` stores points balance, lifetime points, tier, and status.

Initial tiers are `BRONZE`, `SILVER`, `GOLD`, and `PLATINUM`.

Sprint 7 does not implement point redemption, promotions, rewards, or campaign automation.

## Order Integration

Existing order behavior is preserved. Orders still support the existing user customer reference, and Sprint 7 adds an optional CRM customer profile reference for future order-to-customer linking.

## Dashboard

The Merchant Dashboard adds `/dashboard/customers` with:

- Customer list
- Customer creation form
- Basic customer profile view
- Status display
- Tags and groups placeholders
- Loyalty summary placeholder

The UI remains internal-alpha quality and intentionally avoids marketplace storefront and AI features.

## Future Roadmap

- Customer import tools
- Customer search and filters
- Customer order history
- CRM segmentation
- Marketing consent tracking
- Email and SMS provider integration
- Loyalty earn and redemption rules
- Customer-facing marketplace accounts
- AI-assisted customer support recommendations under Human-in-the-Loop governance
