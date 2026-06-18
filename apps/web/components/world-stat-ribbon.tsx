"use client";

import { useEffect, useState } from "react";
import type { WorldMap } from "../lib/api";
import { getRegionalWorldStats } from "../lib/regional-world";

export function WorldStatRibbon({ world }: { world: WorldMap | null }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setPulse((current) => current + 1),
      4200,
    );
    return () => window.clearInterval(timer);
  }, []);

  const stats = getRegionalWorldStats(world, pulse);
  const items = [
    ["Active Merchants", stats.activeMerchants],
    ["Live Stores", stats.liveStores],
    ["Products Listed", stats.productsListed],
    ["Transactions", stats.transactions],
    ["Visitors", stats.visitors],
    ["Regions Online", stats.regionsOnline],
  ];

  return (
    <div className="world-stat-ribbon" aria-label="Live world statistics">
      {items.map(([label, value]) => (
        <span key={label}>
          <strong>{Number(value).toLocaleString()}</strong>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}
