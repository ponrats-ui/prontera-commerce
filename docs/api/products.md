# Products API

The Products API provides the Sprint 3 Product Catalog Foundation for Prontera Commerce. It supports shop-owned categories, products, translations, product images, and product variants.

All endpoints require JWT authentication and platform RBAC access as `admin` or `merchant`.

## Authorization

Catalog authorization uses the existing shop permission architecture.

- `OWNER`: can create, read, update, and delete catalog records.
- `MANAGER`: can create, read, update, and delete catalog records.
- `STAFF`: can read catalog records.
- `CASHIER`: reserved for future POS workflows.

## Category Endpoints

### POST /categories

Creates a category for a shop.

Fields:

- `shopId`
- `slug`
- `status`
- `translations`

Translation fields:

- `locale`
- `name`
- `description`

Supported locales:

- `th-TH`
- `en-US`
- `ja-JP`
- `zh-CN`

### GET /categories

Lists categories for a shop.

Query parameters:

- `shopId`
- `status`

### GET /categories/:id

Returns one category.

### PATCH /categories/:id

Updates category slug, status, or translations.

### DELETE /categories/:id

Soft deletes a category by setting `deletedAt` and archiving its status.

## Product Endpoints

### POST /shops/:shopId/products

Creates a product in a shop.

Fields:

- `sku`
- `slug`
- `status`
- `categoryId`
- `translations`

Business rules:

- Product belongs to the shop in the path.
- Product must belong to a category in the same shop.
- Product slug is unique per active shop.
- Product SKU is unique per active shop.

### GET /shops/:shopId/products

Lists products for a shop.

Query parameters:

- `status`

### GET /products/:id

Returns one product with category, translations, images, and variants.

### PATCH /products/:id

Updates product SKU, slug, status, category, or translations.

### DELETE /products/:id

Soft deletes a product by setting `deletedAt` and archiving its status.

## Product Translation Fields

- `locale`
- `name`
- `shortDescription`
- `description`

Supported locales:

- `th-TH`
- `en-US`
- `ja-JP`
- `zh-CN`

## Product Image Endpoints

### POST /products/:id/images

Adds a product image.

Fields:

- `imageUrl`
- `altText`
- `sortOrder`

### GET /products/:id/images

Lists product images ordered by `sortOrder`.

### DELETE /products/:id/images/:imageId

Soft deletes a product image.

## Product Variant Endpoints

### POST /products/:id/variants

Creates a product variant.

Fields:

- `sku`
- `name`
- `price`
- `compareAtPrice`
- `status`

Prices are stored in minor currency units using the shop preferred currency when available, otherwise the shop base currency.

### GET /products/:id/variants

Lists product variants.

### PATCH /products/:id/variants/:variantId

Updates variant SKU, name, price, compare-at price, or status.

### DELETE /products/:id/variants/:variantId

Soft deletes and archives a variant.

## Out of Scope

Sprint 3 does not implement inventory, warehouse, stock movement, POS, orders, payments, marketplace search, recommendations, AI agents, or virtual world features.
