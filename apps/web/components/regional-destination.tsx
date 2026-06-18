"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WorldMap } from "../lib/api";
import { worldApi } from "../lib/api";
import { getRegionShops, type CommerceRegion } from "../lib/regional-world";
import { MerchantBuildingFacade } from "./merchant-building-facade";
import { RegionalLeader } from "./regional-leader";
import { WorldStatRibbon } from "./world-stat-ribbon";

export function RegionalDestination({ region }: { region: CommerceRegion }) {
  const [world, setWorld] = useState<WorldMap | null>(null);

  useEffect(() => {
    worldApi
      .map()
      .then(setWorld)
      .catch(() => setWorld(null));
  }, []);

  const shops = useMemo(
    () => getRegionShops(region, world?.shops ?? []),
    [region, world],
  );

  return (
    <main className={`regional-destination region-${region.palette}`}>
      <WorldStatRibbon world={world} />
      <section className="regional-arrival-hero">
        <div className="arrival-copy">
          <p className="world-kicker">Commerce Gate arrival</p>
          <h1>Welcome to {region.name}</h1>
          <strong>{region.theme}</strong>
          <p>{region.description}</p>
          <div className="regional-arrival-stats">
            <span>
              <strong>{region.population.toLocaleString()}</strong>
              <small>Merchant population</small>
            </span>
            <span>
              <strong>{region.activityValue.toLocaleString()}</strong>
              <small>{region.activityLabel}</small>
            </span>
            <span>
              <strong>{region.reputation}</strong>
              <small>Regional reputation</small>
            </span>
          </div>
          <div className="button-row">
            <Link className="world-button primary" href="#regional-merchants">
              Explore destinations
            </Link>
            <Link className="world-button" href="/world-map">
              Return to world map
            </Link>
          </div>
        </div>
        <RegionalLandscape region={region} />
      </section>

      <section className="regional-identity-grid">
        <article>
          <p className="world-kicker">Regional economy</p>
          <h2>What moves here</h2>
          <div className="region-token-row">
            {region.economy.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article>
          <p className="world-kicker">Culture & place</p>
          <h2>{region.architecture}</h2>
          <p>{region.climate}</p>
        </article>
        <article>
          <p className="world-kicker">Your reputation</p>
          <h2>{region.reputation} / 100</h2>
          <div className="region-reputation-track">
            <span style={{ width: `${region.reputation}%` }} />
          </div>
          <p>Display-only foundation. Regional travel perks arrive later.</p>
        </article>
      </section>

      <RegionalLeader region={region} />

      {region.slug === "merchant-city" ? <FounderMonument /> : null}

      <section className="regional-merchant-section" id="regional-merchants">
        <div className="section-heading">
          <p className="world-kicker">Regional merchant discovery</p>
          <h2>Destinations in {region.name}</h2>
          <p>
            Merchants appear here because they belong to the regional economy,
            not because they won a generic search result.
          </p>
        </div>
        {shops.length ? (
          <div className="regional-shop-grid">
            {shops.map((shop) => (
              <Link href={`/town/shop/${shop.slug}`} key={shop.id}>
                <div className="regional-shop-facade">
                  <MerchantBuildingFacade shop={shop} />
                </div>
                <div>
                  <small>{shop.category}</small>
                  <h3>{shop.name}</h3>
                  <p>{shop.district.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="regional-coming-soon">
            <span className="regional-shop-silhouette" />
            <div>
              <h3>Merchant destinations are opening</h3>
              <p>
                {region.specialties.join(", ")} merchants will appear here as
                the regional network grows.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function RegionalLandscape({ region }: { region: CommerceRegion }) {
  return (
    <div className={`regional-landscape landscape-${region.palette}`}>
      <span className="landscape-sun" />
      <span className="landscape-cloud cloud-a" />
      <span className="landscape-cloud cloud-b" />
      <span className="landscape-hill hill-a" />
      <span className="landscape-hill hill-b" />
      <span className="landscape-road" />
      <span className="landscape-building building-a" />
      <span className="landscape-building building-b" />
      <span className="landscape-building building-c" />
      <span className="landscape-gate" />
      <strong>{region.shortName}</strong>
    </div>
  );
}

function FounderMonument() {
  return (
    <section className="founder-monument-section">
      <div className="founder-monument-visual">
        <span className="monument-star">F</span>
        <span className="monument-column" />
        <span className="monument-base">Founder Merchant Hall</span>
      </div>
      <div>
        <p className="world-kicker">Merchant City Center</p>
        <h2>Founder Monument</h2>
        <p>
          A civic landmark celebrating the merchants who helped establish the
          first living commerce city.
        </p>
        <dl>
          <div>
            <dt>Founding date</dt>
            <dd>June 2026</dd>
          </div>
          <div>
            <dt>Recognition</dt>
            <dd>Founder Merchant 100</dd>
          </div>
          <div>
            <dt>Top contribution</dt>
            <dd>Building the first trusted trade roads</dd>
          </div>
        </dl>
        <Link className="world-text-link" href="/discover/founders">
          Enter Founder Merchant Hall
        </Link>
      </div>
    </section>
  );
}
