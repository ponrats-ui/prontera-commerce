# Customers API

The Customers API provides the CRM foundation for Prontera Merchant OS. Customer records are scoped to shops and protected by shop staff permissions.

## Customers

| Method   | Path                       | Description                     |
| -------- | -------------------------- | ------------------------------- |
| `POST`   | `/shops/:shopId/customers` | Create a customer profile.      |
| `GET`    | `/shops/:shopId/customers` | List customers for a shop.      |
| `GET`    | `/customers/:id`           | Get a customer profile.         |
| `PATCH`  | `/customers/:id`           | Update a customer profile.      |
| `DELETE` | `/customers/:id`           | Soft delete a customer profile. |

Customer statuses are `ACTIVE`, `INACTIVE`, and `BLOCKED`. Customer sources are `POS`, `ONLINE`, `MANUAL`, and `IMPORTED`.

## Addresses

| Method   | Path                                  | Description                     |
| -------- | ------------------------------------- | ------------------------------- |
| `POST`   | `/customers/:id/addresses`            | Add a customer address.         |
| `GET`    | `/customers/:id/addresses`            | List customer addresses.        |
| `PATCH`  | `/customers/:id/addresses/:addressId` | Update a customer address.      |
| `DELETE` | `/customers/:id/addresses/:addressId` | Soft delete a customer address. |

Each customer can have multiple addresses. The API enforces one default shipping address and one default billing address per active customer.

## Notes

| Method | Path                   | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| `POST` | `/customers/:id/notes` | Add an audit-sensitive customer note. |
| `GET`  | `/customers/:id/notes` | List customer notes.                  |

Note visibility values are `INTERNAL` and `MANAGER_ONLY`. Notes are audit-sensitive and should not be hard deleted by normal CRM workflows.

## Tags

| Method   | Path                           | Description                       |
| -------- | ------------------------------ | --------------------------------- |
| `POST`   | `/shops/:shopId/customer-tags` | Create a customer tag.            |
| `GET`    | `/shops/:shopId/customer-tags` | List customer tags.               |
| `PATCH`  | `/customer-tags/:id`           | Update a customer tag.            |
| `DELETE` | `/customer-tags/:id`           | Soft delete a customer tag.       |
| `POST`   | `/customers/:id/tags/:tagId`   | Assign a tag to a customer.       |
| `DELETE` | `/customers/:id/tags/:tagId`   | Remove a customer tag assignment. |

## Groups

| Method   | Path                             | Description                   |
| -------- | -------------------------------- | ----------------------------- |
| `POST`   | `/shops/:shopId/customer-groups` | Create a customer group.      |
| `GET`    | `/shops/:shopId/customer-groups` | List customer groups.         |
| `PATCH`  | `/customer-groups/:id`           | Update a customer group.      |
| `DELETE` | `/customer-groups/:id`           | Soft delete a customer group. |
| `POST`   | `/customers/:id/groups/:groupId` | Assign a customer to a group. |
| `DELETE` | `/customers/:id/groups/:groupId` | Remove a group assignment.    |

## Activity

| Method | Path                      | Description                 |
| ------ | ------------------------- | --------------------------- |
| `GET`  | `/customers/:id/activity` | List customer CRM activity. |

Tracked activity types include customer creation, customer updates, address additions, note additions, group assignments, tag assignments, and future order references.

## Loyalty

| Method  | Path                     | Description                       |
| ------- | ------------------------ | --------------------------------- |
| `GET`   | `/customers/:id/loyalty` | Get a customer loyalty account.   |
| `PATCH` | `/customers/:id/loyalty` | Update loyalty foundation fields. |

Loyalty tiers are `BRONZE`, `SILVER`, `GOLD`, and `PLATINUM`. Redemption is intentionally outside Sprint 7.

## Authorization

- `OWNER` and `MANAGER`: full CRM management.
- `CASHIER`: create and update customers, add addresses, add notes, and view loyalty.
- `STAFF`: read customers only.
