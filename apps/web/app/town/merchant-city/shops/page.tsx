"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MerchantBuildingCard } from "../../../../components/buyer-world";
import { EmptyStateCard, ErrorMessage } from "../../../../components/ui";
import { discoveryApi } from "../../../../lib/api";
import type { WorldShop } from "../../../../lib/api";

export default function MerchantCityShopsPage() {
  const [shops, setShops] = useState<WorldShop[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadShops();
  }, []);

  async function loadShops(nextSearch?: string) {
    try {
      setError(null);
      const query: Record<string, string> = { citySlug: "merchant-city" };
      if (nextSearch) query.search = nextSearch;
      setShops(await discoveryApi.merchants(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shops.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void discoveryApi.track({
      eventType: "MERCHANT_SEARCH",
      searchTerm: search,
      source: "merchant-city-shops",
    });
    void loadShops(search);
  }

  return (
    <main className="town-content">
      <section className="shops-header">
        <div>
          <p className="world-kicker">Merchant City directory</p>
          <h1>Visit a Shop</h1>
          <p>
            Browse merchant buildings by identity, district, live status, and
            active offer.
          </p>
        </div>
        <Link className="world-button" href="/town/merchant-city">
          Back to city
        </Link>
      </section>
      <ErrorMessage message={error} />
      <form className="world-search" onSubmit={submit}>
        <label>
          Search Merchant City
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Demo store, keyboard, coffee, harbor"
            value={search}
          />
        </label>
        <button className="world-button primary" type="submit">
          Search buildings
        </button>
      </form>
      {shops.length ? (
        <div className="building-grid">
          {shops.map((shop) => (
            <MerchantBuildingCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <EmptyStateCard
          description="Try another merchant, category, or district."
          title="No shops found"
        />
      )}
    </main>
  );
}
