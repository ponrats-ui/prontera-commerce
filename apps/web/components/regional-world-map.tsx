"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  commerceRegions,
  lockedFutureRegions,
  type CommerceRegion,
} from "../lib/regional-world";
import type { WorldMap } from "../lib/api";
import { WorldStatRibbon } from "./world-stat-ribbon";

type TravelPhase = "idle" | "charging" | "traveling" | "arrived";

export function RegionalWorldMap({ world }: { world: WorldMap | null }) {
  const router = useRouter();
  const [destination, setDestination] = useState<CommerceRegion | null>(null);
  const [phase, setPhase] = useState<TravelPhase>("idle");

  function travel(region: CommerceRegion) {
    if (phase !== "idle") return;
    setDestination(region);
    setPhase("charging");
    window.setTimeout(() => setPhase("traveling"), 650);
    window.setTimeout(() => setPhase("arrived"), 1500);
    window.setTimeout(() => router.push(`/world/${region.slug}`), 2400);
  }

  return (
    <>
      <WorldStatRibbon world={world} />
      <section className="regional-map-shell">
        <div className="regional-map-heading">
          <div>
            <p className="world-kicker">Regional Commerce Network</p>
            <h1>The Merchant World</h1>
            <p>
              Follow trade roads, sea routes, and sky gates into regions with
              distinct cultures, economies, merchants, and leaders.
            </p>
          </div>
          <div className="map-compass-rose">
            <span>N</span>
            <strong>P</strong>
            <small>World Gate Atlas</small>
          </div>
        </div>

        <div className="regional-world-map" aria-label="Prontera world map">
          <div className="world-sea sea-one" />
          <div className="world-sea sea-two" />
          <div className="world-route route-harbor" />
          <div className="world-route route-industrial" />
          <div className="world-route route-tech" />
          <div className="world-route route-artisan" />
          <div className="world-route route-creator" />
          <div className="world-cloud cloud-one" />
          <div className="world-cloud cloud-two" />
          <div className="world-cloud cloud-three" />

          {commerceRegions.map((region) => (
            <button
              className={`world-region-node region-${region.palette}`}
              key={region.slug}
              onClick={() => travel(region)}
              style={{
                left: `${region.mapPosition.x}%`,
                top: `${region.mapPosition.y}%`,
              }}
              type="button"
            >
              <span className="region-landmark">
                <i />
                <i />
                <i />
              </span>
              <span className="region-node-copy">
                <small>{region.theme}</small>
                <strong>{region.name}</strong>
                <em>{region.activityValue.toLocaleString()} active signals</em>
              </span>
            </button>
          ))}

          <div className="future-region-cluster">
            {lockedFutureRegions.map((region) => (
              <span key={region.name}>
                <strong>?</strong>
                <small>{region.name}</small>
              </span>
            ))}
            <em>Future routes locked</em>
          </div>
        </div>

        <div className="regional-map-legend">
          <span>
            <i className="online" /> Region online
          </span>
          <span>
            <i className="locked" /> Future route
          </span>
          <p>Select a region to travel through the Commerce Gate Network.</p>
        </div>
      </section>

      {destination && phase !== "idle" ? (
        <div className={`warp-travel-overlay phase-${phase}`} role="status">
          <div className="warp-travel-scene">
            <span className="warp-ring ring-one" />
            <span className="warp-ring ring-two" />
            <span className="warp-ring ring-three" />
            <div className="travel-spark spark-one" />
            <div className="travel-spark spark-two" />
            <div className="travel-spark spark-three" />
            <div className="travel-copy">
              <p>
                {phase === "charging"
                  ? "Commerce Gate charging"
                  : phase === "traveling"
                    ? "Following the regional trade route"
                    : "Destination reached"}
              </p>
              <h2>{destination.name}</h2>
              <span>{destination.theme}</span>
              {phase === "arrived" ? (
                <strong>Welcome to {destination.name}</strong>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
