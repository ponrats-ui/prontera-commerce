"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { buildingsApi, type MerchantBuilding } from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../components/ui";

export default function MerchantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [building, setBuilding] = useState<MerchantBuilding | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    buildingsApi
      .merchant(id)
      .then(setBuilding)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load merchant profile.",
        ),
      );
  }, [id]);

  return (
    <main className="content">
      <PageHeader
        eyebrow="Merchant Profile"
        title={building?.signText ?? "Storefront"}
      >
        <Link className="button" href="/world">
          Back to World
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />
      {building ? (
        <div className="grid two">
          <section className="panel">
            <div className="button-row" style={{ marginBottom: 12 }}>
              {building.isFounder ? (
                <span className="badge warn">Founder</span>
              ) : null}
              {building.isOfficialStore ? (
                <span className="badge">Official Store</span>
              ) : null}
              {building.isLive ? <span className="badge">LIVE</span> : null}
            </div>
            <p className="eyebrow">{building.storefrontTheme}</p>
            <h2>{building.signText}</h2>
            <p className="muted">
              {building.description ?? "Merchant storefront"}
            </p>
            <p>
              {building.buildingType} building / level {building.buildingLevel}
            </p>
            {building.promotionBanner ? (
              <div className="success">{building.promotionBanner}</div>
            ) : null}
          </section>
          <section className="panel">
            <h2>Products</h2>
            {building.featuredProducts.length ? (
              <div className="grid">
                {building.featuredProducts.map((product) => (
                  <div className="card" key={product.id}>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.slug}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                description="Featured products appear after the merchant publishes a catalog."
                title="No featured products"
              />
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
