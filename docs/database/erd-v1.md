# Prontera Commerce ERD v1

Sprint 0.5 establishes the first production database foundation for identity, billing, merchant, and catalog domains.

## Domain Boundaries

- **Identity:** `User`, `Role`, `UserRole`
- **Billing:** `Plan`, `Subscription`, `Invoice`
- **Merchant:** `Shop`, `ShopStaff`
- **Catalog:** `Category`, `Product`, `ProductVariant`, `ProductImage`

## Entity Relationship Diagram

```mermaid
erDiagram
  User ||--o{ UserRole : has
  Role ||--o{ UserRole : grants
  User ||--o{ Shop : owns
  User ||--o{ ShopStaff : joins
  Shop ||--o{ ShopStaff : employs
  Shop ||--o{ Subscription : has
  Plan ||--o{ Subscription : prices
  Shop ||--o{ Invoice : receives
  Subscription ||--o{ Invoice : bills
  Shop ||--o{ Category : organizes
  Category ||--o{ Category : parents
  Shop ||--o{ Product : sells
  Category ||--o{ Product : groups
  Product ||--o{ ProductVariant : offers
  Product ||--o{ ProductImage : displays

  User {
    uuid id PK
    varchar email
    varchar name
    UserStatus status
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Role {
    uuid id PK
    varchar code
    varchar name
    text description
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  UserRole {
    uuid id PK
    uuid userId FK
    uuid roleId FK
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Plan {
    uuid id PK
    varchar code
    varchar name
    integer priceCents
    char currency
    BillingInterval interval
    PlanStatus status
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Subscription {
    uuid id PK
    uuid shopId FK
    uuid planId FK
    SubscriptionStatus status
    timestamptz currentPeriodStart
    timestamptz currentPeriodEnd
    timestamptz trialEndsAt
    timestamptz canceledAt
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Invoice {
    uuid id PK
    uuid shopId FK
    uuid subscriptionId FK
    varchar invoiceNumber
    InvoiceStatus status
    integer subtotalCents
    integer taxCents
    integer totalCents
    char currency
    timestamptz dueAt
    timestamptz paidAt
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Shop {
    uuid id PK
    uuid ownerId FK
    varchar name
    varchar slug
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  ShopStaff {
    uuid id PK
    uuid shopId FK
    uuid userId FK
    StaffStatus status
    varchar title
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Category {
    uuid id PK
    uuid shopId FK
    uuid parentId FK
    varchar name
    varchar slug
    text description
    integer sortOrder
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  Product {
    uuid id PK
    uuid shopId FK
    uuid categoryId FK
    varchar name
    varchar slug
    text description
    ProductStatus status
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  ProductVariant {
    uuid id PK
    uuid productId FK
    varchar sku
    varchar title
    integer priceCents
    char currency
    integer inventoryCount
    boolean isDefault
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }

  ProductImage {
    uuid id PK
    uuid productId FK
    text url
    varchar altText
    integer sortOrder
    timestamptz createdAt
    timestamptz updatedAt
    timestamptz deletedAt
  }
```

## PostgreSQL Notes

- Primary keys use UUID columns with `gen_random_uuid()` database defaults.
- Soft delete is represented by nullable `deletedAt` on all domain tables.
- Active-record uniqueness is enforced with partial unique indexes in the migration, for example active shop slugs and active product slugs per shop.
- Tenant-sensitive catalog data is scoped by `shopId`.
- Common query paths are indexed by tenant, status, parent/category, billing period, and soft-delete markers.
