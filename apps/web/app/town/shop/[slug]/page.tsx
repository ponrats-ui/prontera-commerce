"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyStateCard, ErrorMessage } from "../../../../components/ui";
import { MerchantBuildingFacade } from "../../../../components/merchant-building-facade";
import { getStoredUser } from "../../../../lib/auth";
import { worldApi } from "../../../../lib/api";
import type { WorldShop } from "../../../../lib/api";

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

  return (
    <main className="town-content">
      <ErrorMessage message={error} />
      {shop ? (
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

          <section className="world-section">
            <div className="section-heading">
              <p className="world-kicker">Inside the shop</p>
              <h2>Featured Products</h2>
            </div>
            {shop.featuredProducts.length ? (
              <div className="product-shelf">
                {shop.featuredProducts.map((product) => (
                  <article key={product.id}>
                    <div className="product-object">
                      <span>{product.name.slice(0, 1)}</span>
                    </div>
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.name}</h3>
                    <strong>
                      {product.priceCents == null
                        ? "Ask merchant"
                        : `$${(product.priceCents / 100).toFixed(2)}`}
                    </strong>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                description="This merchant is preparing the product shelf."
                title="Products coming soon"
              />
            )}
          </section>

          <section className="world-section split-world-section">
            <div className="shop-signal-panel live-panel">
              <p className="world-kicker">Live Commerce</p>
              <h2>{shop.liveNow ? "This store is live now" : "Live room"}</h2>
              <p>
                {shop.liveNow
                  ? "The merchant is broadcasting from Merchant City. The demo world displays the live signal without requiring buyer login."
                  : "Follow this storefront to see its next live commerce session."}
              </p>
              <span
                className={
                  shop.liveNow ? "signal-status active" : "signal-status"
                }
              >
                {shop.liveNow ? "Broadcast active" : "Currently offline"}
              </span>
            </div>
            <div className="shop-signal-panel promotion-panel">
              <p className="world-kicker">Promotion</p>
              <h2>{shop.campaignBadge ?? "Merchant offer space"}</h2>
              <p>
                {shop.promotionBanner
                  ? `${shop.promotionBanner} is visible as a discovery signal. Checkout remains the final pricing authority.`
                  : "This storefront is ready to display an active campaign or voucher."}
              </p>
              <span className="signal-status">
                {shop.promotionBadge ?? "No active offer"}
              </span>
            </div>
          </section>
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
