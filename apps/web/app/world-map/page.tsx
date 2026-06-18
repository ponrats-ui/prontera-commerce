"use client";

import { useEffect, useState } from "react";
import { BuyerWorldNav } from "../../components/buyer-world-nav";
import { RegionalWorldMap } from "../../components/regional-world-map";
import type { WorldMap } from "../../lib/api";
import { worldApi } from "../../lib/api";

export default function RegionalWorldMapPage() {
  const [world, setWorld] = useState<WorldMap | null>(null);

  useEffect(() => {
    worldApi
      .map()
      .then(setWorld)
      .catch(() => setWorld(null));
  }, []);

  return (
    <div className="buyer-world-shell">
      <BuyerWorldNav />
      <main className="regional-world-page">
        <RegionalWorldMap world={world} />
      </main>
    </div>
  );
}
