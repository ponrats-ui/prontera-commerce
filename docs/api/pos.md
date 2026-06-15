# POS API

Sprint 5 introduces POS session and shift foundations for cashier operations.

All endpoints require JWT authentication and platform RBAC access as `admin` or `merchant`.

## Authorization

- `OWNER`, `MANAGER`, and `CASHIER` can open and close POS sessions.
- `STAFF` can read only.

## Endpoints

### POST /pos/open

Opens a POS session and initial shift for the authenticated cashier.

Fields:

- `shopId`
- `openingCash`

Rules:

- One open POS session per cashier and shop.
- Opening cash is stored in minor currency units.

### POST /pos/close

Closes the POS session and its open shifts.

Fields:

- `sessionId`
- `closingCash`

### GET /pos/current

Returns the current open POS session for the authenticated cashier.

Query parameters:

- `shopId`

## Future Roadmap

Future POS work may connect confirmed POS orders to terminals, receipts, cashier reports, tax receipts, and payment gateway settlement.

Sprint 5 does not implement payment gateways, checkout terminals, or fiscal integrations.
