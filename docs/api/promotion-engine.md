# Promotion Engine API

Sprint 8 introduces the first Promotion & Pricing Engine for Prontera Commerce.

All endpoints require JWT authentication and platform RBAC access as `admin` or `merchant`.

## Authorization

- `OWNER` and `MANAGER` can create and manage campaigns, vouchers, and pricing tiers.
- Shop staff can read and evaluate promotions for checkout workflows.

## Campaigns

### POST /promotions/campaigns

Creates a promotion campaign.

Fields:

- `shopId`
- `name`
- `description`
- `promotionType`
- `status`
- `startsAt`
- `endsAt`
- `priority`
- `stackable`
- `rules`

Supported `promotionType` values:

- `PERCENT_DISCOUNT`
- `FIXED_DISCOUNT`
- `BUY_X_GET_Y`
- `FREE_SHIPPING_PLACEHOLDER`
- `CUSTOMER_GROUP_DISCOUNT`

Supported `status` values:

- `DRAFT`
- `ACTIVE`
- `PAUSED`
- `EXPIRED`

### GET /promotions/campaigns

Lists campaigns for a shop.

Query:

- `shopId`

### GET /promotions/campaigns/:id

Returns a campaign with active rules and vouchers.

### PATCH /promotions/campaigns/:id

Updates campaign fields. If `rules` is provided, existing rules are soft deleted and replaced.

### DELETE /promotions/campaigns/:id

Soft deletes a campaign and marks it `EXPIRED`.

## Vouchers

### POST /promotions/vouchers

Creates a voucher code linked to a campaign.

Fields:

- `shopId`
- `campaignId`
- `code`
- `description`
- `status`
- `usageLimit`
- `startsAt`
- `endsAt`

Voucher codes are unique per shop.

### GET /promotions/vouchers

Lists vouchers for a shop.

Query:

- `shopId`

### PATCH /promotions/vouchers/:id

Updates voucher status, description, usage limit, or date window.

## Pricing Tiers

### POST /promotions/pricing-tiers

Creates customer group pricing.

Fields:

- `shopId`
- `customerGroupId`
- `name`
- `discountPercent`
- `status`

Customer groups must belong to the same shop.

### GET /promotions/pricing-tiers

Lists pricing tiers for a shop.

Query:

- `shopId`

### PATCH /promotions/pricing-tiers/:id

Updates pricing tier name, discount percent, or status.

## Evaluation

### POST /promotions/evaluate

Evaluates automatic campaigns, voucher campaigns, and customer pricing tiers.

Input:

- `shopId`
- `customerId`
- `orderItems`
- `voucherCode`

Each order item includes:

- `productVariantId`
- `quantity`

Output:

- `strategy`
- `subtotal`
- `eligiblePromotions`
- `appliedPromotion`
- `appliedCampaign`
- `appliedVoucher`
- `appliedPricingTier`
- `discountAmount`
- `finalSubtotal`

Sprint 8 uses `BEST_DISCOUNT_WINS`. Multiple promotion stacking is not supported yet.

## Checkout Integration

`POST /checkout` accepts:

- `voucherCode`
- `customerId`

Checkout evaluates promotions before payment confirmation, applies the winning discount to the pending order, stores `appliedPromotionSnapshot`, and creates the payment record for the final subtotal.

## Validation Rules

- Voucher codes are unique per shop.
- Expired vouchers cannot be applied.
- Inactive campaigns are ignored.
- Promotion date windows are enforced.
- Customer groups must belong to the shop.
- `FREE_SHIPPING_PLACEHOLDER` exists for future shipping integration but does not discount order subtotal in Sprint 8.
