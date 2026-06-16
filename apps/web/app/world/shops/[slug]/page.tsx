"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../../components/ui";
import { worldApi } from "../../../../lib/api";
import type { WorldShop } from "../../../../lib/api";

export default function WorldShopPage() {
  const params = useParams<{ slug: string }>();
  const [shop, setShop] = useState<WorldShop | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    worldApi
      .shop(params.slug)
      .then(setShop)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load storefront.",
        ),
      );
  }, [params.slug]);

  return (
    <main className="content">
      <PageHeader
        eyebrow={shop?.city.name ?? "Storefront"}
        title={shop?.name ?? "Storefront"}
      >
        <Link className="button" href="/world">
          World
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      {shop ? (
        <>
          <section className="panel">
            <div className="button-row" style={{ marginBottom: 12 }}>
              {shop.liveNow ? <span className="badge">LIVE</span> : null}
              {shop.isFounderMerchant ? (
                <span className="badge warn">Founder Merchant</span>
              ) : null}
              {shop.promotionBadge ? (
                <span className="badge">{shop.promotionBadge}</span>
              ) : null}
            </div>
            <p className="muted">{shop.description ?? "Merchant storefront"}</p>
            <div className="grid four" style={{ marginTop: 16 }}>
              <div>
                <p className="eyebrow">District</p>
                <p>{shop.district.name}</p>
              </div>
              <div>
                <p className="eyebrow">Category</p>
                <p>{shop.category}</p>
              </div>
              <div>
                <p className="eyebrow">Building</p>
                <p>{shop.buildingStyle.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="eyebrow">Plan</p>
                <p>{shop.subscriptionTier}</p>
              </div>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 16 }}>
            <h2>Featured Products</h2>
            {shop.featuredProducts.length ? (
              <div className="grid three">
                {shop.featuredProducts.map((product) => (
                  <article className="card" key={product.id}>
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="muted">
                      {product.priceCents == null
                        ? "Price pending"
                        : `$${(product.priceCents / 100).toFixed(2)}`}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                description="Featured products appear after the merchant publishes active products."
                title="No featured products"
              />
            )}
          </section>

          {shop.campaignBadge ? (
            <section className="panel" style={{ marginTop: 16 }}>
              <h2>Active Promotion</h2>
              <div className="card">
                <p className="eyebrow">{shop.promotionBadge}</p>
                <h3>{shop.campaignBadge}</h3>
                <p className="muted">
                  Promotion signals are shown for discovery only; checkout keeps
                  final pricing authority.
                </p>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <EmptyStateCard
          description="Storefront details will appear after the shop is placed in the world."
          title="No storefront loaded"
        />
      )}
    </main>
  );
}
