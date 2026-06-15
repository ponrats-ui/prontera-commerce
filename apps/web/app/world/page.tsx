"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../components/ui";
import { worldApi } from "../../lib/api";
import type { CommerceGate, WorldDistrict, WorldZone } from "../../lib/api";

export default function WorldPage() {
  const [zones, setZones] = useState<WorldZone[]>([]);
  const [districts, setDistricts] = useState<WorldDistrict[]>([]);
  const [gates, setGates] = useState<CommerceGate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorld() {
      const [nextZones, nextDistricts, nextGates] = await Promise.all([
        worldApi.zones(),
        worldApi.districts(),
        worldApi.availableGates(),
      ]);
      setZones(nextZones);
      setDistricts(nextDistricts);
      setGates(nextGates);
    }

    loadWorld().catch((err) =>
      setError(err instanceof Error ? err.message : "Unable to load world."),
    );
  }, []);

  return (
    <main className="content">
      <PageHeader eyebrow="Open World Commerce" title="Commerce Gate Network">
        <Link className="button primary" href="/world/travel">
          Quick Travel
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      <div className="grid three">
        <MetricCard label="Cities" value={zones.length} />
        <MetricCard label="Districts" value={districts.length} />
        <MetricCard label="Available Gates" value={gates.length} />
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Cities</h2>
        {zones.length ? (
          <div className="grid three">
            {zones.map((zone) => (
              <article className="card" key={zone.id}>
                <p className="eyebrow">{zone.code}</p>
                <h3>{zone.name}</h3>
                <p className="muted">
                  {zone.description ?? "Commerce city destination"}
                </p>
                <p className="muted">
                  {zone.districts?.length ?? 0} districts available
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="World zones will appear here after admin setup."
            title="No cities yet"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Districts</h2>
        {districts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Category</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district.id}>
                    <td>{district.name}</td>
                    <td>{district.category}</td>
                    <td>{district.zone?.name ?? district.zoneId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStateCard
            description="Districts organize commercial zones such as Fashion Street, Food Market, and AI District."
            title="No districts yet"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Available Gates</h2>
        {gates.length ? (
          <div className="grid two">
            {gates.map((gate) => (
              <article className="card" key={gate.id}>
                <p className="eyebrow">{gate.gateType}</p>
                <h3>{gate.title}</h3>
                <p className="muted">
                  {gate.sourceZone?.name ?? "Source"} to{" "}
                  {gate.destinationDistrict?.name ??
                    gate.destinationZone?.name ??
                    "Destination"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Commerce Gates will connect cities, districts, and future sponsored destinations."
            title="No gates available"
          />
        )}
      </section>
    </main>
  );
}
