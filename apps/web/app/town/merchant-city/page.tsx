"use client";

import { useEffect, useState } from "react";
import { TownshipWorld } from "../../../components/township-world";
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

  return <TownshipWorld error={error} gates={gates} world={world} />;
}
