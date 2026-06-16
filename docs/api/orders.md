# Orders and Checkout API

Sprint 5 introduces the first transaction layer for Prontera Commerce: carts, checkout, orders, order items, and manual payment records.

All endpoints require JWT authentication and platform RBAC access as `admin` or `merchant`.

## Authorization

- `OWNER`, `MANAGER`, and `CASHIER` can create orders and checkout.
- `STAFF` can read only.

## Cart Endpoints

### GET /cart

Returns the current active or checkout cart. Optional query:

- `shopId`

### POST /cart/items

Adds an item to the active cart.

Fields:

- `shopId`
- `productVariantId`
- `quantity`

### PATCH /cart/items/:id

Updates cart item quantity.

### DELETE /cart/items/:id

Soft deletes a cart item.

Reserved cart items cannot be updated or deleted directly.

## Order Endpoints

### POST /orders

Creates an order manually.

Fields:

- `shopId`
- `status`
- `items`
- `discount`
- `tax`
- `notes`
- `payment`

Order items snapshot product name, variant name, SKU, unit price, and total price at order time.

### GET /shops/:shopId/orders

Lists orders for a shop.

### GET /orders/:id

Returns an order with items and payment records.

## Checkout Endpoints

### POST /checkout

Begins checkout for the current active cart.

Rules:

- Validates inventory availability.
- Creates inventory reservations.
- Creates immutable reservation movements.
- Creates a `PENDING` order.
- Creates order items.
- Creates a manual payment record.

Fields:

- `shopId`
- `customerId`
- `voucherCode`
- `paymentMethod`
- `referenceNumber`
- `notes`

Checkout evaluates the Promotion & Pricing Engine before creating the pending order. The winning promotion discount is stored in `discount`, the final amount is stored in `total`, and the full evaluation context is stored in `appliedPromotionSnapshot`.

### POST /checkout/confirm

Confirms a pending checkout order.

Rules:

- Converts reservations into outbound inventory movements.
- Reduces inventory on hand.
- Marks payment records as `PAID`.
- Marks the order as `CONFIRMED`.

Fields:

- `orderId`

### POST /checkout/cancel

Cancels a draft or pending checkout order.

Rules:

- Releases reservations.
- Records release movements.
- Marks payment records as `FAILED`.
- Marks the order as `CANCELLED`.

Fields:

- `orderId`

## Payment Records

Payment records are internal manual records only.

Methods:

- `CASH`
- `BANK_TRANSFER`
- `PROMPTPAY`
- `MANUAL`

Statuses:

- `PENDING`
- `PAID`
- `FAILED`
- `REFUNDED`

External payment gateways are not implemented in Sprint 5.
