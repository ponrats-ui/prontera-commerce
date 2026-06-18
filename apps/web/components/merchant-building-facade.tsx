import type { WorldShop } from "../lib/api";

export type MerchantFacadeKind =
  | "general-store"
  | "coffee-house"
  | "restaurant"
  | "harbor-supply"
  | "tech-shop"
  | "artisan-workshop";

export function getMerchantFacadeKind(shop: WorldShop): MerchantFacadeKind {
  const identity =
    `${shop.name} ${shop.category} ${shop.storefrontTheme}`.toLowerCase();

  if (identity.includes("coffee") || identity.includes("cafe"))
    return "coffee-house";
  if (identity.includes("restaurant") || identity.includes("food"))
    return "restaurant";
  if (identity.includes("harbor") || identity.includes("supply"))
    return "harbor-supply";
  if (identity.includes("tech") || identity.includes("keyboard"))
    return "tech-shop";
  if (identity.includes("artisan") || identity.includes("craft"))
    return "artisan-workshop";
  return "general-store";
}

export function MerchantBuildingFacade({
  shop,
  compact = false,
  storefront = false,
}: {
  shop: WorldShop;
  compact?: boolean;
  storefront?: boolean;
}) {
  const kind = getMerchantFacadeKind(shop);

  return (
    <div
      aria-label={`${shop.name} ${kind.replace(/-/g, " ")}`}
      className={`merchant-facade facade-${kind} ${
        compact ? "is-compact" : ""
      } ${storefront ? "is-storefront" : ""}`}
      role="img"
    >
      <span className="facade-chimney" />
      <span className="facade-roof">
        <i />
        <i />
        <i />
      </span>
      <span className="facade-upper-window" />
      <span className="facade-sign">{shop.signText ?? shop.name}</span>
      <span className="facade-awning" />
      <span className="facade-window">
        <i />
      </span>
      <span className="facade-door" />
      <span className="facade-decoration decoration-left" />
      <span className="facade-decoration decoration-right" />
      {shop.liveNow ? <span className="facade-live">LIVE</span> : null}
    </div>
  );
}
