"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DistrictTile,
  MerchantBuildingCard,
} from "../../../components/buyer-world";
import { EmptyStateCard, ErrorMessage } from "../../../components/ui";
import { worldApi } from "../../../lib/api";
import type { CommerceGate, WorldMap } from "../../../lib/api";

export default function MerchantCityPage() {
  const [world, setWorld] = useState<WorldMap | null>(null);
  const [gates, setGates] = useState<CommerceGate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([worldApi.overview(), worldApi.availableGates()])
      .then(([overview, availableGates]) => {
        setWorld(overview);
        setGates(availableGates);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to enter Merchant City.",
        ),
      );
  }, []);

  const city = world?.cities.find((item) => item.slug === "merchant-city");
  const shops = useMemo(
    () =>
      (world?.shops ?? []).filter((shop) => shop.city.slug === "merchant-city"),
    [world],
  );
  const liveStores = shops.filter((shop) => shop.liveNow);
  const founderStores = shops.filter((shop) => shop.isFounderMerchant);
  const districts = city?.districtLocations?.map((item) => item.district) ?? [];
  const gate = gates[0];

  return (
    <main className="town-content">
      <ErrorMessage message={error} />
      <section className="city-header">
        <div>
          <p className="world-kicker">Central Trade Region</p>
          <h1>Merchant City</h1>
          <p>
            Shops are buildings here. Explore districts, step inside merchant
            storefronts, follow live signals, and travel through the gate
            network.
          </p>
        </div>
        <div className="city-stat-grid">
          <span>
            <strong>{shops.length}</strong>
            <small>Buildings</small>
          </span>
          <span>
            <strong>{districts.length}</strong>
            <small>Districts</small>
          </span>
          <span>
            <strong>{liveStores.length}</strong>
            <small>Live now</small>
          </span>
        </div>
      </section>

      <section className="city-map" aria-label="Merchant City 2D map">
        <div className="map-label north">North Trade Road</div>
        <div className="map-label center">Central Market Square</div>
        <div className="map-canal" />
        <div className="map-road horizontal" />
        <div className="map-road vertical" />
        <div className="map-landmark guild">Merchant Guild</div>
        <div className="map-landmark fountain">Market Fountain</div>
        <Link className="map-landmark gate" href="/world/travel">
          Warp Gate
        </Link>
        {shops.slice(0, 4).map((shop, index) => (
          <Link
            className={`map-shop map-shop-${index + 1}`}
            href={`/town/shop/${shop.slug}`}
            key={shop.id}
          >
            <span>{shop.liveNow ? "LIVE" : shop.buildingType}</span>
            <strong>{shop.signText ?? shop.name}</strong>
          </Link>
        ))}
      </section>

      <section className="world-section">
        <div className="section-heading with-action">
          <div>
            <p className="world-kicker">Choose a neighborhood</p>
            <h2>City Districts</h2>
          </div>
          <Link className="world-text-link" href="/world/map">
            Open world map
          </Link>
        </div>
        {districts.length ? (
          <div className="district-grid">
            {districts.map((district) => (
              <DistrictTile district={district} key={district.id} />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Run the demo seed to populate Merchant City districts."
            title="Districts are being prepared"
          />
        )}
      </section>

      <section className="world-section" id="merchant-buildings">
        <div className="section-heading with-action">
          <div>
            <p className="world-kicker">Walk the main streets</p>
            <h2>Merchant Buildings</h2>
          </div>
          <Link className="world-text-link" href="/town/merchant-city/shops">
            View all shops
          </Link>
        </div>
        {shops.length ? (
          <div className="building-grid">
            {shops.map((shop) => (
              <MerchantBuildingCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Published merchant buildings appear here after the demo seed."
            title="No merchant buildings yet"
          />
        )}
      </section>

      <section className="world-section split-world-section">
        <div id="live-stores">
          <div className="section-heading">
            <p className="world-kicker">Broadcasting now</p>
            <h2>Live Stores</h2>
          </div>
          <div className="compact-shop-list">
            {liveStores.length ? (
              liveStores.map((shop) => (
                <Link href={`/town/shop/${shop.slug}`} key={shop.id}>
                  <span className="live-dot" />
                  <div>
                    <strong>{shop.name}</strong>
                    <small>{shop.district.name}</small>
                  </div>
                </Link>
              ))
            ) : (
              <p className="muted">No merchants are live right now.</p>
            )}
          </div>
        </div>
        <div>
          <div className="section-heading">
            <p className="world-kicker">Early city builders</p>
            <h2>Founder Stores</h2>
          </div>
          <div className="compact-shop-list">
            {founderStores.length ? (
              founderStores.map((shop) => (
                <Link href={`/town/shop/${shop.slug}`} key={shop.id}>
                  <span className="founder-dot">F</span>
                  <div>
                    <strong>{shop.name}</strong>
                    <small>Founder Merchant</small>
                  </div>
                </Link>
              ))
            ) : (
              <p className="muted">Founder storefronts are opening soon.</p>
            )}
          </div>
        </div>
      </section>

      <section className="warp-gate-section">
        <div className="warp-gate-visual">
          <span>GATE</span>
        </div>
        <div>
          <p className="world-kicker">Commerce Gate Network</p>
          <h2>{gate?.title ?? "Merchant City Warp Gate"}</h2>
          <p>
            {gate?.description ??
              "Travel between commerce districts without losing your place in the world."}
          </p>
        </div>
        <Link className="world-button primary" href="/world/travel">
          Travel through gate
        </Link>
      </section>
    </main>
  );
}
