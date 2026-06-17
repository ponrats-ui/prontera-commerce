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
import { MerchantDiscoveryCard } from "../discovery-ui";

export default function FounderDiscoveryPage() {
  const [merchants, setMerchants] = useState<WorldShop[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void discoveryApi.track({
      eventType: "FOUNDER_FILTER",
      source: "discover-founders",
    });
    void loadFounders();
  }, []);

  async function loadFounders() {
    try {
      setError(null);
      const data = await discoveryApi.founders();
      setMerchants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load founders.");
    }
  }

  function trackMerchantClick(shop: WorldShop) {
    void discoveryApi.track({
      eventType: "MERCHANT_CLICK",
      shopId: shop.id,
      source: "discover-founders",
    });
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Founder Discovery" title="Founder Merchants">
        <div className="button-row">
          <Link className="button" href="/discover">
            Discovery Home
          </Link>
          <Link className="button" href="/founders">
            Founder Program
          </Link>
          <Link className="button primary" href="/discover/merchants">
            Browse All
          </Link>
        </div>
      </PageHeader>
      <ErrorMessage message={error} />

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
          description="Founder merchants appear here after approval and world placement."
          title="No founder merchants yet"
        />
      )}
    </main>
  );
}
