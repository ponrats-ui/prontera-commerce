import Link from "next/link";
import type { WorldDistrict, WorldShop } from "../lib/api";
import { MerchantBuildingFacade } from "./merchant-building-facade";

export function MerchantBuildingCard({ shop }: { shop: WorldShop }) {
  return (
    <Link className="merchant-building-card" href={`/town/shop/${shop.slug}`}>
      <div className="building-visual">
        <MerchantBuildingFacade shop={shop} />
      </div>
      <div className="building-card-copy">
        <div className="world-badge-row">
          {shop.liveNow ? <span className="world-badge live">LIVE</span> : null}
          {shop.isFounderMerchant ? (
            <span className="world-badge founder">Founder</span>
          ) : null}
          {shop.isOfficialStore ? (
            <span className="world-badge official">Official</span>
          ) : null}
        </div>
        <p className="eyebrow">{shop.district.name}</p>
        <h3>{shop.name}</h3>
        <p className="muted">
          {shop.buildingType.replace(/_/g, " ")} / {shop.category}
        </p>
        {shop.promotionBanner ? (
          <p className="promotion-strip">{shop.promotionBanner}</p>
        ) : (
          <p className="promotion-strip placeholder">Promotion space</p>
        )}
      </div>
    </Link>
  );
}

export function DistrictTile({
  district,
}: {
  district: WorldDistrict & { slug?: string };
}) {
  const slug =
    district.slug ??
    district.code
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  return (
    <Link
      className={`district-tile district-${district.category.toLowerCase()}`}
      href={`/world/districts/${slug}`}
    >
      <span className="district-marker">{district.sortOrder + 1}</span>
      <div>
        <p className="eyebrow">{district.category}</p>
        <h3>{district.name}</h3>
        <p>{district.description ?? "A merchant district in Merchant City."}</p>
      </div>
    </Link>
  );
}
