# Product Catalog Architecture

Sprint 3 establishes the Product Catalog Foundation for Prontera Commerce. The catalog is shop-owned, multilingual, multi-currency ready, and designed for Merchant OS workflows before marketplace expansion.

## Data Model

### Category

`Category` groups products inside a shop.

Core fields:

- `shopId`
- `slug`
- `status`
- `deletedAt`

Translations are stored in `CategoryTranslation`.

### CategoryTranslation

Localized category content.

Fields:

- `categoryId`
- `localeCode`
- `name`
- `description`

Supported locales for Sprint 3:

- `th-TH`
- `en-US`
- `ja-JP`
- `zh-CN`

### Product

`Product` represents a merchant product inside a shop.

Core fields:

- `shopId`
- `categoryId`
- `sku`
- `slug`
- `status`
- `deletedAt`

Business rules:

- Product belongs to one shop.
- Product belongs to one category.
- Slug is unique per active shop.
- SKU is unique per active shop.

### ProductTranslation

Localized product content.

Fields:

- `productId`
- `localeCode`
- `name`
- `shortDescription`
- `description`

### ProductImage

Product media records.

Fields:

- `productId`
- `imageUrl`
- `altText`
- `sortOrder`

Images are soft deleted.

### ProductVariant

Sellable product options such as size, color, or package.

Fields:

- `productId`
- `sku`
- `name`
- `priceCents`
- `compareAtPriceCents`
- `currency`
- `status`

Inventory fields are not used in Sprint 3.

## Product Lifecycle

Products move through three statuses:

- `DRAFT`: product is being prepared.
- `ACTIVE`: product is ready for merchant operations and future marketplace visibility.
- `ARCHIVED`: product is retired through soft deletion or explicit archive.

## Product Status Flow

```mermaid
flowchart LR
  Draft["DRAFT"] --> Active["ACTIVE"]
  Active --> Archived["ARCHIVED"]
  Draft --> Archived
```

Archived records remain in the database for auditability and future recovery workflows.

## Translation Strategy

Catalog translations align with the Global Commerce Foundation.

Rules:

- Translatable user-facing fields live in translation tables.
- Sprint 3 supports `th-TH`, `en-US`, `ja-JP`, and `zh-CN`.
- Services validate locale records before writing translations.
- The product/category base name is derived from `en-US` when present, otherwise from the first translation.

## Variant Strategy

Variants represent purchasable product options without implementing inventory.

Examples:

- Size
- Color
- Package

Variant prices are stored in minor currency units. The currency is inherited from the shop preferred currency when available, otherwise from the shop base currency.

## Permission Model

Catalog permission checks use Sprint 2 shop permissions.

- `OWNER` and `MANAGER` can create, update, and delete catalog records.
- `STAFF` can read catalog records.
- Product catalog permissions are centralized in `ProductPermissionsService`.

## API Boundary

Sprint 3 owns:

- Category CRUD
- Product CRUD
- Product translations
- Product images
- Product variants

Sprint 3 does not own:

- Inventory
- Warehouse
- Stock movement
- POS
- Orders
- Payments
- Marketplace search
- Recommendation engine
- AI agents
- Virtual world systems

## Future Roadmap

Planned extensions:

- Inventory and stock movement
- Variant option normalization
- Product publishing workflows
- Marketplace indexing
- Localized SEO metadata
- Catalog import and export
- HITL approval workflows for high-impact catalog operations
