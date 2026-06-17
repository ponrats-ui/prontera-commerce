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

export default function OfficialStoreDiscoveryPage() {
  const [merchants, setMerchants] = useState<WorldShop[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void discoveryApi.track({
      eventType: "OFFICIAL_FILTER",
      source: "discover-official",
    });
    void loadOfficialStores();
  }, []);

  async function loadOfficialStores() {
    try {
      setError(null);
      const data = await discoveryApi.official();
      setMerchants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load official stores.",
      );
    }
  }

  function trackMerchantClick(shop: WorldShop) {
    void discoveryApi.track({
      eventType: "MERCHANT_CLICK",
      shopId: shop.id,
      source: "discover-official",
    });
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Official Store Discovery" title="Official Stores">
        <div className="button-row">
          <Link className="button" href="/discover">
            Discovery Home
          </Link>
          <Link className="button" href="/discover/founders">
            Founders
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
          description="Official Stores appear here after admin verification."
          title="No official stores yet"
        />
      )}
    </main>
  );
}
