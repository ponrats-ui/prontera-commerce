"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../components/ui";
import { worldApi } from "../../lib/api";
import type { WorldMap, WorldShop } from "../../lib/api";

export default function WorldPage() {
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadWorld();
  }, []);

  async function loadWorld(nextSearch = search) {
    try {
      setError(null);
      const data = await worldApi.map(nextSearch ? { search: nextSearch } : {});
      setWorldMap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load world.");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadWorld(search);
  }

  const shops = worldMap?.shops ?? [];
  const cities = worldMap?.cities ?? [];

  return (
    <main className="content">
      <PageHeader eyebrow="Commerce World" title="Prontera World">
        <div className="button-row">
          <Link className="button" href="/world/travel">
            Travel
          </Link>
          <Link className="button primary" href="/world/map">
            World Map
          </Link>
        </div>
      </PageHeader>
      <ErrorMessage message={error} />

      <section className="panel" style={{ marginBottom: 16 }}>
        <form className="form-grid two" onSubmit={submitSearch}>
          <label>
            Search merchants, cities, or categories
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="live, founder, fashion, wholesale"
              value={search}
            />
          </label>
          <div style={{ alignSelf: "end" }}>
            <button className="button primary" type="submit">
              Search World
            </button>
          </div>
        </form>
      </section>

      <div className="grid four">
        <MetricCard label="Cities" value={worldMap?.totals.cities ?? 0} />
        <MetricCard label="Districts" value={worldMap?.totals.districts ?? 0} />
        <MetricCard label="Storefronts" value={worldMap?.totals.shops ?? 0} />
        <MetricCard label="Live Now" value={worldMap?.totals.live ?? 0} />
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>World Cities</h2>
        {cities.length ? (
          <div className="grid three">
            {cities.map((city) => (
              <Link
                className="card"
                href={`/world/cities/${city.slug}`}
                key={city.id}
              >
                <p className="eyebrow">{city.region?.name ?? "Region"}</p>
                <h3>{city.name}</h3>
                <p className="muted">
                  {city.description ?? "Original commerce city"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="World cities appear after the Sprint 10 migration is applied."
            title="No cities yet"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Merchant Discovery</h2>
        {shops.length ? (
          <div className="grid three">
            {shops.map((shop) => (
              <StorefrontCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Placed merchant storefronts will appear here with live, founder, promotion, and product signals."
            title="No storefronts placed"
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
        {shop.promotionBadge ? (
          <span className="badge">{shop.promotionBadge}</span>
        ) : null}
      </div>
      <p className="eyebrow">
        {shop.city.name} / {shop.district.name}
      </p>
      <h3>{shop.name}</h3>
      <p className="muted">{shop.category}</p>
      <p className="muted">
        {shop.buildingStyle.replace(/_/g, " ")} /{" "}
        {shop.subscriptionTier.toLowerCase()}
      </p>
    </Link>
  );
}
