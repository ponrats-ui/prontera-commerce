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
import type { WorldCity, WorldShop } from "../../../../lib/api";

export default function WorldCityPage() {
  const params = useParams<{ slug: string }>();
  const [city, setCity] = useState<WorldCity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    worldApi
      .city(params.slug)
      .then(setCity)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load city."),
      );
  }, [params.slug]);

  return (
    <main className="content">
      <PageHeader
        eyebrow={city?.region?.name ?? "World City"}
        title={city?.name ?? "City"}
      >
        <Link className="button" href="/world/map">
          Map
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      <section className="panel">
        <p className="muted">
          {city?.description ?? "A commerce city for merchant discovery."}
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Districts</h2>
        {city?.districtLocations?.length ? (
          <div className="grid three">
            {city.districtLocations.map((location) => (
              <Link
                className="card"
                href={`/world/districts/${location.district.slug ?? location.district.code.toLowerCase().replace(/_/g, "-")}`}
                key={location.id}
              >
                <p className="eyebrow">
                  {location.coordinateX}, {location.coordinateY}
                </p>
                <h3>{location.district.name}</h3>
                <p className="muted">{location.district.category}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Districts will appear here after city placement is configured."
            title="No district placement"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Storefronts</h2>
        {city?.shops?.length ? (
          <div className="grid three">
            {city.shops.map((shop) => (
              <StorefrontCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Placed merchant storefronts will appear here."
            title="No storefronts in this city"
          />
        )}
      </section>
    </main>
  );
}

function StorefrontCard({ shop }: { shop: WorldShop }) {
  return (
    <Link className="card" href={`/world/shops/${shop.slug}`}>
      <div className="button-row" style={{ marginBottom: 10 }}>
        {shop.liveNow ? <span className="badge">LIVE</span> : null}
        {shop.isFounderMerchant ? (
          <span className="badge warn">Founder</span>
        ) : null}
      </div>
      <p className="eyebrow">{shop.district.name}</p>
      <h3>{shop.name}</h3>
      <p className="muted">{shop.category}</p>
    </Link>
  );
}
