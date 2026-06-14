# Global Commerce Architecture

Prontera Commerce treats globalization as a first-class platform concern across identity, merchant settings, catalog content, pricing, and storefront routing. The foundation is intentionally normalized so markets can be added without changing core commerce tables.

This architecture implements the Global First principle from the [Prontera Commerce Vision](../vision/prontera-commerce-vision.md).

Global commerce operations follow the [Human-in-the-Loop Governance](human-in-the-loop-governance.md) model. AI agents may recommend market, pricing, tax, payment, compliance, and policy changes, but high-impact actions require human approval before execution.

## Core Concepts

- `Locale` stores BCP 47-style locale codes such as `en-US`, plus language and region metadata for UI and catalog language negotiation.
- `Language` stores ISO-style language codes, native names, direction, and availability for locale grouping.
- `Country` stores ISO 3166-1 alpha-2 country codes, default currency, default locale, default timezone, and market availability.
- `Currency` stores ISO 4217 currency codes, display metadata, decimal precision, and availability.
- `User` stores optional `countryCode`, optional `localeCode`, and a `timeZone` preference for account-level formatting.
- `Shop` stores required `countryCode`, `localeCode`, `currencyCode`, and `timeZone` preferences that define the merchant's default market behavior.

The migrations seed `USD`, `en-US`, and `US` as the initial defaults, then add Phase 2 market data for Thailand, United States, Japan, Singapore, and Vietnam.

## Seeded Markets

| Country       | Code | Currency | Locale  | Timezone           |
| ------------- | ---- | -------- | ------- | ------------------ |
| Thailand      | `TH` | `THB`    | `th-TH` | `Asia/Bangkok`     |
| United States | `US` | `USD`    | `en-US` | `America/New_York` |
| Japan         | `JP` | `JPY`    | `ja-JP` | `Asia/Tokyo`       |
| Singapore     | `SG` | `SGD`    | `en-SG` | `Asia/Singapore`   |
| Vietnam       | `VN` | `VND`    | `vi-VN` | `Asia/Ho_Chi_Minh` |

## Translation Model

Canonical shop, product, and category records keep their existing `name`, `slug`, and `description` fields as the default/fallback content. Localized content lives in translation tables:

- `ShopTranslation`: localized merchant-facing shop name and description.
- `ProductTranslation`: localized product name, slug, and description.
- `CategoryTranslation`: localized category name, slug, and description.

Each translation is scoped to one parent record and one locale. Active-record partial unique indexes ensure there is only one active translation per parent and locale while preserving soft-delete history.

Lookup order for localized content should be:

1. Requested locale translation.
2. Shop default locale translation.
3. Canonical base fields on the parent record.

Localized slugs are stored with translations so storefront URLs can be language-specific without changing the product or category identity.

## Money And Multi-Currency

Currency metadata is centralized in `Currency`. Existing billing and catalog money fields now reference currency codes through foreign keys:

- `Plan.currency`
- `Invoice.currency`
- `ProductVariant.currency`
- `Shop.currencyCode`

`ProductVariantPrice` adds explicit multi-currency price rows per variant and currency. The existing `ProductVariant.priceCents` and `currency` fields remain as the default price for compatibility and quick reads. Commerce services should prefer `ProductVariantPrice` when resolving a shopper's market currency, falling back to the variant default price when no localized price exists.

All monetary values continue to be stored as minor units, for example cents. Formatting should use the selected locale plus the currency's `decimalDigits`.

`CurrencyExchangeRate` stores provider-scoped exchange rates by currency pair and effective time. `CurrencyExchangeService` resolves the latest active rate and converts minor-unit amounts for display, price estimation, and reporting. Order capture should still persist the final charged currency and amount rather than recomputing from historical exchange rates.

## Timezone Policy

All persisted timestamps remain `TIMESTAMPTZ` in PostgreSQL. `User.timeZone`, `Shop.timeZone`, and `Country.defaultTimeZone` store IANA timezone identifiers for presentation, scheduling, reporting, billing windows, and merchant operations.

Services should:

- Store instants in UTC-backed `TIMESTAMPTZ`.
- Convert to user or shop timezone only at display, report, or schedule boundaries.
- Use shop timezone for merchant business dates, subscription period presentation, and local cutoffs.
- Use user timezone for account notifications and staff-facing UI preferences.

## Next.js Web I18n Structure

The web app is prepared for locale-aware routing without introducing a runtime i18n dependency yet:

```text
apps/web/app/[locale]/page.tsx
apps/web/i18n/config.ts
apps/web/i18n/dictionaries.ts
apps/web/messages/en-US.json
```

`/` redirects to the configured default locale, and localized pages validate route params against the supported locale list. Message dictionaries are loaded through `getDictionary(locale)`, which gives the app a single replacement point if the team adopts `next-intl`, `lingui`, or another i18n library later.

Future work should add middleware-based locale negotiation using this priority order:

1. Explicit URL locale.
2. Authenticated user preference.
3. Shop default locale.
4. `Accept-Language` header.
5. Platform default locale.

## Service Boundaries

- Identity owns user locale, country, and timezone preferences.
- Merchant owns shop locale, country, currency, timezone, and supported markets.
- Catalog owns product/category translations and variant price availability.
- Billing owns subscription and invoice currency correctness.
- Web resolves route locale and dictionary content.
- API should expose locale, country, currency, and timezone as explicit request context rather than deriving them deep inside repositories.
- `CurrencyExchangeService` owns rate lookup and minor-unit conversion.
- `TaxProfileService` owns active country-specific tax profile lookup and basis-point tax calculation.
- `ShippingZoneService` owns shippability checks by shop and country.
- `LocalizationService` owns market context resolution and active market listing.
- `PaymentGatewayService` owns gateway capability metadata and active shop gateway configuration lookup.

## Tax Profiles

`TaxProfile` is scoped to a shop and country. It stores a rate in basis points, whether storefront prices include tax, whether shipping is taxable, and an optional registration number. This supports VAT/GST/sales-tax foundations without hardcoding jurisdiction logic into checkout. Future tax-engine integrations should write normalized tax decisions back to order records.

## Shipping Zones

`ShippingZone` groups one or more `ShippingZoneCountry` rows for a shop. The current model is country-level by design; carrier rates, region/province exclusions, postal-code rules, and delivery promises can be layered under a zone later without changing the market reference data.

## Payments

`PaymentGatewayConfiguration` prepares shop-level configuration for Stripe and regional gateways. It stores provider, status, display name, supported countries/currencies, non-secret account references, an external `credentialsRef`, and JSON metadata. Secrets should live in a vault or payment-provider token store, never in this table.

Initial gateway capability metadata covers:

- Stripe for card and wallet-first global coverage.
- Omise for Thailand, Japan, and Singapore local payment support.
- Xendit as a local/regional gateway placeholder for Southeast Asia.
- PromptPay for Thailand.
- PayNow for Singapore.

## Operational Notes

- Add reference data through migrations or seed scripts, not ad hoc writes from application code.
- Keep country and currency activation soft-switchable with `isActive`.
- Avoid deleting reference data that has historical financial records.
- Do not overwrite canonical catalog text during translation imports; translation rows are additive.
- Validate timezone identifiers at the service boundary before writing preferences.
