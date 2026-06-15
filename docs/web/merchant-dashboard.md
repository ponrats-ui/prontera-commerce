# Merchant Dashboard

The Sprint 6 Merchant Dashboard is the first usable web interface for Prontera Merchant OS. It gives authenticated merchants a focused operations workspace for shops, products, inventory, orders, and POS sessions.

## Page Structure

| Path                   | Purpose                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/login`               | Email and password sign-in for merchant users.                                                                |
| `/dashboard`           | Merchant overview with shop count, product count, inventory alerts, orders today, and sales summary.          |
| `/dashboard/shops`     | Shop list, shop creation, basic profile editing, and shop detail view.                                        |
| `/dashboard/products`  | Product list, product creation, basic product editing, and read views for variants, translations, and images. |
| `/dashboard/inventory` | Warehouse list, inventory item table shape, quantity columns, and low stock alerts.                           |
| `/dashboard/orders`    | Order list, selected order details, item snapshots, payment records, and order status.                        |
| `/dashboard/pos`       | Open POS session, view current session, close POS session, and cart/order placeholder.                        |

## Auth Flow

The web app calls `POST /auth/login` and stores the development access token in browser local storage. The authenticated dashboard layout checks for a token before rendering protected pages and redirects unauthenticated users to `/login`.

The logout action clears the local session and redirects back to `/login`.

## API Integration

The API base URL is read from:

```text
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The web app includes lightweight API clients for:

- Auth
- Shops
- Products
- Inventory
- Orders
- POS

All authenticated requests attach the JWT bearer token from local storage.

## Dashboard Roadmap

Future dashboard work should add richer merchant workflows without mixing in customer marketplace or virtual world concerns:

- Category management
- Product image upload UX
- Variant editor
- Inventory item listing endpoint integration
- Warehouse creation and editing
- Checkout and cart UI
- Order status transitions
- Merchant analytics
- Staff and invitation management

## Future Marketplace UI Separation

The Merchant Dashboard is an operator workspace. Customer marketplace, virtual world, avatar, social commerce, and AI agent interfaces should be built as separate surfaces with their own navigation, route groups, and interaction model.
