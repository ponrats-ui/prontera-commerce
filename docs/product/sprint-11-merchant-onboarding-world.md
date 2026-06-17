# Sprint 11 Merchant Onboarding World

## Goal

A new merchant can create a shop and appear in the Prontera world within 5 minutes.

Sprint 11 connects merchant onboarding, shop creation, Founder Merchant recognition, merchant buildings, and world discovery into one publish flow.

## Onboarding Wizard

Route:

```text
/onboarding
```

Steps:

1. Merchant Profile
2. Shop Branding
3. District Selection
4. Starter Plan
5. Publish Shop

## Merchant Profile

The merchant provides:

- merchant name
- shop name
- category

The shop name is converted into a unique shop slug during publish.

## Shop Branding

The merchant can provide:

- logo URL
- banner URL

File storage is intentionally deferred. Sprint 11 captures branding assets as URLs until a production upload pipeline exists.

## District Selection

Initial districts:

- Tech Bazaar
- Artisan Valley
- Harbor District
- Wholesale Quarter

The onboarding publish flow ensures these districts and their city placement exist before assigning the merchant.

## Starter Plan and Founder Program

The wizard shows the Founder Merchant Program:

- 1 month free Pro
- Founder Badge
- Early Merchant Recognition

Publishing creates a trial subscription and Founder Merchant Program record for the onboarding foundation.

## Publish Flow

When the merchant publishes:

- a shop is created
- an owner staff record is created
- a Pro trial subscription is created
- a Founder Merchant Program record is created
- a Merchant Building is created
- a Merchant World Location is created
- the shop becomes discoverable in `/world`
- the shop appears in `/world/travel` storefront discovery

## Merchant Building

Sprint 11 introduces `MerchantBuilding`.

Fields:

- `id`
- `shopId`
- `districtId`
- `buildingType`
- `storefrontTheme`
- `xCoordinate`
- `yCoordinate`
- `isPublished`

The building record is the merchant's world presence foundation. The existing `MerchantWorldLocation` remains the public discovery placement used by world views.

## API

Endpoints:

- `POST /merchant-onboarding/start`
- `POST /merchant-onboarding/publish`
- `GET /merchant-onboarding/status`

## Success Screen

Message:

```text
Welcome to Prontera.

Your shop is now part of the Merchant Civilization.
```

Buttons:

- Go To Shop
- Explore World

## Constraints

Sprint 11 does not add:

- payment collection
- file upload storage
- advertising zones
- 3D merchant buildings
- game mechanics
- combat
- quests
- avatar inventories

This is a commerce-world onboarding foundation only.
