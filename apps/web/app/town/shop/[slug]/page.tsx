"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyStateCard, ErrorMessage } from "../../../../components/ui";
import { MerchantBuildingFacade } from "../../../../components/merchant-building-facade";
import { MerchantRelationshipActions } from "../../../../components/merchant-relationship-actions";
import { ShopInterior } from "../../../../components/shop-interior";
import { getStoredUser } from "../../../../lib/auth";
import { worldApi } from "../../../../lib/api";
import type { WorldShop } from "../../../../lib/api";
import { getMerchantIdentity } from "../../../../lib/living-world";

export default function TownShopPage() {
  const params = useParams<{ slug: string }>();
  const [shop, setShop] = useState<WorldShop | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    worldApi
      .shop(params.slug)
      .then((result) => {
        setShop(result);
        setIsOwner(getStoredUser()?.id === result.ownerId);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to enter this shop.",
        ),
      );
  }, [params.slug]);

  const merchant = shop ? getMerchantIdentity(shop) : null;

  return (
    <main className="town-content">
      <ErrorMessage message={error} />
      {shop && merchant ? (
        <>
          <section className="storefront-hero">
            <div className="storefront-building">
              <MerchantBuildingFacade shop={shop} storefront />
            </div>
            <div className="storefront-copy">
              <div className="world-badge-row">
                {shop.liveNow ? (
                  <span className="world-badge live">LIVE</span>
                ) : null}
                {shop.isFounderMerchant ? (
                  <span className="world-badge founder">Founder Merchant</span>
                ) : null}
                {shop.isOfficialStore ? (
                  <span className="world-badge official">Official Store</span>
                ) : null}
              </div>
              <p className="world-kicker">
                {shop.city.name} / {shop.district.name}
              </p>
              <h1>{shop.name}</h1>
              <p>{shop.description ?? "A merchant storefront in Prontera."}</p>
              <div className="storefront-owner-line">
                <strong>{merchant.merchantName}</strong>
                <span>{merchant.merchantTitle}</span>
                <small>
                  {merchant.merchantReputation.toFixed(1)} reputation
                </small>
              </div>
              <MerchantRelationshipActions
                merchantName={merchant.merchantName}
                shopSlug={shop.slug}
              />
              <div className="button-row">
                <Link className="world-button" href="/town/merchant-city/shops">
                  Return to shops
                </Link>
                {isOwner ? (
                  <Link
                    className="world-button primary"
                    href="/dashboard/shops"
                  >
                    Open merchant dashboard
                  </Link>
                ) : null}
              </div>
            </div>
          </section>

          <ShopInterior merchant={merchant} shop={shop} />
        </>
      ) : (
        <EmptyStateCard
          description="The storefront will appear when its published building is available."
          title="Opening storefront"
        />
      )}
    </main>
  );
}
