"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../components/ui";
import { discoveryApi } from "../../lib/api";
import type { DiscoveryOverview, WorldShop } from "../../lib/api";
import {
  CategoryGrid,
  DiscoverySearchBox,
  MerchantDiscoveryCard,
} from "./discovery-ui";

export default function DiscoverPage() {
  const [overview, setOverview] = useState<DiscoveryOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void discoveryApi.track({
      eventType: "DISCOVERY_VIEW",
      source: "discover-home",
    });
    void loadOverview();
  }, []);

  async function loadOverview(search?: string, category?: string) {
    try {
      setError(null);
      const query: Record<string, string> = {};
      if (search) query.search = search;
      if (category) query.category = category;
      const data = await discoveryApi.overview(query);
      setOverview(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load discovery.",
      );
    }
  }

  function searchMerchants(search: string) {
    void discoveryApi.track({
      eventType: "MERCHANT_SEARCH",
      searchTerm: search,
      source: "discover-home",
    });
    void loadOverview(search);
  }

  function selectCategory(category: string) {
    void discoveryApi.track({
      eventType: "CATEGORY_FILTER",
      category,
      source: "discover-home",
    });
    void loadOverview(undefined, category);
  }

  function trackMerchantClick(shop: WorldShop) {
    void discoveryApi.track({
      eventType: "MERCHANT_CLICK",
      shopId: shop.id,
      source: "discover-home",
    });
  }

  const metrics = overview?.metrics;
  const merchants = overview?.merchants ?? [];

  return (
    <main className="content">
      <PageHeader eyebrow="Merchant Discovery" title="Discover Merchants">
        <div className="button-row">
          <Link className="button" href="/discover/founders">
            Founders
          </Link>
          <Link className="button" href="/discover/official">
            Official Stores
          </Link>
          <Link className="button primary" href="/discover/merchants">
            Merchant Search
          </Link>
        </div>
      </PageHeader>
      <ErrorMessage message={error} />

      <section className="panel" style={{ marginBottom: 16 }}>
        <DiscoverySearchBox onSearch={searchMerchants} />
      </section>

      <div className="grid four">
        <MetricCard label="Merchants" value={metrics?.totalMerchants ?? 0} />
        <MetricCard label="Founders" value={metrics?.founderMerchants ?? 0} />
        <MetricCard label="Official" value={metrics?.officialStores ?? 0} />
        <MetricCard label="Live Now" value={metrics?.liveMerchants ?? 0} />
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Merchant Categories</h2>
        {overview?.categories.length ? (
          <CategoryGrid
            categories={overview.categories}
            onSelect={selectCategory}
          />
        ) : (
          <EmptyStateCard
            description="Categories appear when merchants are placed in the world."
            title="No categories yet"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Featured Merchant Discovery</h2>
        {merchants.length ? (
          <div className="grid three">
            {merchants.map((shop) => (
              <MerchantDiscoveryCard
                key={shop.id}
                onClick={trackMerchantClick}
                shop={shop}
              />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Published merchant buildings become discoverable here."
            title="No merchants found"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Ranking Foundation</h2>
        <div className="grid three">
          {overview?.ranking.signals.map((signal) => (
            <div className="card" key={signal.signal}>
              <p className="eyebrow">Signal</p>
              <h3>{signal.signal}</h3>
              <p className="muted">{signal.points} ranking points</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
