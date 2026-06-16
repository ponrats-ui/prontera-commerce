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
import type { WorldDistrict, WorldShop } from "../../../../lib/api";

type DistrictDetail = WorldDistrict & { shops?: WorldShop[] };

export default function WorldDistrictPage() {
  const params = useParams<{ slug: string }>();
  const [district, setDistrict] = useState<DistrictDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    worldApi
      .district(params.slug)
      .then(setDistrict)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load district.",
        ),
      );
  }, [params.slug]);

  return (
    <main className="content">
      <PageHeader
        eyebrow={district?.category ?? "District"}
        title={district?.name ?? "District"}
      >
        <Link className="button" href="/world/map">
          Map
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      <section className="panel">
        <p className="muted">
          {district?.description ??
            "A commerce district organized around merchant discovery."}
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>City Placement</h2>
        {district?.cityLocations?.length ? (
          <div className="grid three">
            {district.cityLocations.map((location) => (
              <Link
                className="card"
                href={`/world/cities/${location.city.slug}`}
                key={location.id}
              >
                <p className="eyebrow">
                  {location.coordinateX}, {location.coordinateY}
                </p>
                <h3>{location.city.name}</h3>
                <p className="muted">{location.city.region?.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="This district is ready for placement in a city map."
            title="No placement yet"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Storefronts</h2>
        {district?.shops?.length ? (
          <div className="grid three">
            {district.shops.map((shop) => (
              <Link
                className="card"
                href={`/world/shops/${shop.slug}`}
                key={shop.id}
              >
                <div className="button-row" style={{ marginBottom: 10 }}>
                  {shop.liveNow ? <span className="badge">LIVE</span> : null}
                  {shop.isFounderMerchant ? (
                    <span className="badge warn">Founder</span>
                  ) : null}
                </div>
                <p className="eyebrow">{shop.city.name}</p>
                <h3>{shop.name}</h3>
                <p className="muted">{shop.buildingStyle.replace(/_/g, " ")}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Merchants assigned to this district will appear here."
            title="No storefronts placed"
          />
        )}
      </section>
    </main>
  );
}
