# Inventory API

The Inventory API provides the Sprint 4 Inventory and Warehouse Foundation for Prontera Commerce. It supports warehouses, inventory items, stock movements, adjustments, reservations, and low stock alerts.

All endpoints require JWT authentication and platform RBAC access as `admin` or `merchant`.

## Authorization

Inventory authorization uses the existing shop permission architecture.

- `OWNER`: manage warehouses and inventory.
- `MANAGER`: manage warehouses and inventory.
- `CASHIER`: view inventory and create `OUTBOUND` movements.
- `STAFF`: read only.

## Warehouse Endpoints

### POST /shops/:shopId/warehouses

Creates a warehouse for a shop.

Fields:

- `name`
- `code`
- `address`
- `countryCode`
- `timezone`
- `status`

Rules:

- Warehouse belongs to a shop.
- Warehouse code is unique per active shop.
- Warehouse deletion is soft delete only.

### GET /shops/:shopId/warehouses

Lists warehouses for a shop.

### GET /warehouses/:id

Returns warehouse details.

### PATCH /warehouses/:id

Updates warehouse profile fields.

### DELETE /warehouses/:id

Soft deletes a warehouse and marks it `INACTIVE`.

## Inventory Item Endpoints

### POST /inventory/items

Creates an inventory item for a product variant in a warehouse.

Fields:

- `warehouseId`
- `productVariantId`
- `sku`
- `quantityOnHand`
- `quantityReserved`
- `reorderPoint`
- `reorderQuantity`
- `status`

Computed field:

- `quantityAvailable = quantityOnHand - quantityReserved`

## Movement Endpoints

### POST /inventory/movements

Creates an immutable inventory movement and updates item quantities.

Movement types:

- `INBOUND`
- `OUTBOUND`
- `TRANSFER_IN`
- `TRANSFER_OUT`
- `ADJUSTMENT`
- `RESERVATION`
- `RELEASE`

Fields:

- `inventoryItemId`
- `movementType`
- `quantity`
- `referenceNumber`
- `notes`
- `performedBy`

### GET /inventory/movements

Lists movements. Optional query:

- `inventoryItemId`

### GET /inventory/movements/:id

Returns one movement.

Movements are never deleted.

## Adjustment Endpoints

### POST /inventory/adjustments

Creates a stock adjustment and writes a paired movement audit record.

Reasons:

- `COUNT_CORRECTION`
- `DAMAGED`
- `LOST`
- `EXPIRED`
- `MANUAL`

Fields:

- `inventoryItemId`
- `reason`
- `afterQuantity`
- `notes`

### GET /inventory/adjustments

Lists adjustments. Optional query:

- `inventoryItemId`

## Reservation Endpoints

### POST /inventory/reservations

Creates an inventory reservation for future order allocation.

Fields:

- `inventoryItemId`
- `quantity`
- `expiresAt`

Rules:

- Reservation expiry must be in the future.
- Reservation quantity cannot exceed available inventory.
- Orders are not implemented in Sprint 4.

### GET /inventory/items/:inventoryItemId/reservations

Lists reservations for an item.

## Alert Endpoints

### GET /inventory/alerts

Lists low stock and out-of-stock alerts.

Optional query:

- `inventoryItemId`

Alert types:

- `LOW_STOCK`
- `OUT_OF_STOCK`

Statuses:

- `OPEN`
- `RESOLVED`

## Out of Scope

Sprint 4 does not implement POS, orders, payments, checkout, marketplace search, AI agents, avatars, guilds, or virtual world systems.
