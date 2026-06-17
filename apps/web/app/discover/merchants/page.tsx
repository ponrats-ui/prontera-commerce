"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../components/ui";
import { discoveryApi } from "../../../lib/api";
import type { WorldShop } from "../../../lib/api";
import { DiscoverySearchBox, MerchantDiscoveryCard } from "../discovery-ui";

export default function DiscoverMerchantsPage() {
  const [merchants, setMerchants] = useState<WorldShop[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadMerchants();
  }, []);

  async function loadMerchants(search?: string) {
    try {
      setError(null);
      const data = await discoveryApi.merchants(search ? { search } : {});
      setMerchants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load merchants.",
      );
    }
  }

  function searchMerchants(search: string) {
    void discoveryApi.track({
      eventType: "MERCHANT_SEARCH",
      searchTerm: search,
      source: "discover-merchants",
    });
    void loadMerchants(search);
  }

  function trackMerchantClick(shop: WorldShop) {
    void discoveryApi.track({
      eventType: "MERCHANT_CLICK",
      shopId: shop.id,
      source: "discover-merchants",
    });
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Merchant Search" title="Browse Merchants">
        <div className="button-row">
          <Link className="button" href="/discover">
            Discovery Home
          </Link>
          <Link className="button" href="/discover/founders">
            Founders
          </Link>
          <Link className="button" href="/discover/official">
            Official Stores
          </Link>
        </div>
      </PageHeader>
      <ErrorMessage message={error} />

      <section className="panel" style={{ marginBottom: 16 }}>
        <DiscoverySearchBox onSearch={searchMerchants} />
      </section>

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
          description="Try searching by merchant name, district, or category."
          title="No merchants found"
        />
      )}
    </main>
  );
}
