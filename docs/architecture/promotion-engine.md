# Promotion & Pricing Engine Architecture

The Promotion & Pricing Engine is the first pricing intelligence layer for Prontera Commerce Merchant OS.

Its purpose is to let merchants run campaigns, vouchers, and customer-specific pricing while keeping checkout totals explainable and auditable.

## Scope

Sprint 8 includes:

- Promotion campaigns
- Promotion rules
- Vouchers
- Customer pricing tiers
- Customer group discounts
- Checkout promotion snapshots
- BEST_DISCOUNT_WINS evaluation

Sprint 8 does not include:

- Loyalty points
- Referral system
- Affiliate program
- AI pricing
- Payment gateways
- Marketing automation

## Data Model

### PromotionCampaign

Represents a merchant promotion campaign.

Campaigns belong to a shop, have a promotion type and status, and may contain one or more rules.

### PromotionRule

Defines campaign eligibility and discount logic.

Rules may target:

- Minimum order amount
- Minimum quantity
- Discount percent
- Fixed discount amount
- Buy quantity / get quantity
- Product
- Category
- Customer group

### Voucher

Represents a customer-entered voucher code linked to a campaign.

Voucher codes are unique per shop and have independent status, usage count, usage limit, and date windows.

### CustomerPricingTier

Represents customer group pricing.

Examples:

- VIP
- Wholesale
- Employee
- Partner

Pricing tiers connect Sprint 7 Customer CRM groups to order pricing.

## Promotion Evaluation Flow

1. Load order items and calculate base subtotal from product variant prices.
2. Load customer group memberships if a CRM customer is provided.
3. Load active campaigns for the shop.
4. Enforce campaign date windows.
5. Evaluate each campaign rule.
6. Evaluate voucher code if supplied.
7. Enforce voucher status, date window, usage limit, and linked campaign eligibility.
8. Evaluate active customer pricing tiers for the customer's groups.
9. Select the highest discount using `BEST_DISCOUNT_WINS`.
10. Return applied promotion context, discount amount, and final subtotal.

## Pricing Hierarchy

Sprint 8 does not stack discounts.

The hierarchy is:

1. Product variant base price
2. Automatic campaign candidates
3. Voucher campaign candidate
4. Customer pricing tier candidates
5. Best discount wins
6. Final subtotal is written to checkout payment amount

If two discounts have the same amount, campaign priority is used as a tie breaker when a campaign is involved.

## Checkout Integration

Checkout evaluates promotions before creating a pending order.

The order stores:

- `subtotal`
- `discount`
- `total`
- `appliedPromotionSnapshot`

The snapshot preserves the strategy, eligible candidates, applied campaign, applied voucher, applied pricing tier, discount amount, and final subtotal at purchase time. This protects historical order integrity if campaigns change later.

## Customer Pricing Integration

Customer pricing tiers use Sprint 7 Customer CRM groups.

When checkout or evaluation receives a CRM `customerId`, the engine loads the customer's active group memberships and evaluates active pricing tiers for those groups.

`CUSTOMER_GROUP_DISCOUNT` campaigns can also target a customer group through promotion rules.

## Future Loyalty Support

Loyalty points are intentionally excluded from Sprint 8.

Future loyalty work should integrate after the promotion engine has stable:

- Evaluation snapshots
- Discount auditability
- Customer group pricing
- Voucher redemption rules
- Non-stacking and stacking strategies

Loyalty should be treated as a separate earning and redemption layer, not mixed into the first campaign engine foundation.
