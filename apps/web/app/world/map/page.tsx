"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";
import { worldApi } from "../../../lib/api";
import type { WorldMap } from "../../../lib/api";

export default function WorldMapPage() {
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    worldApi
      .map()
      .then(setWorldMap)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load map."),
      );
  }, []);

  return (
    <main className="content">
      <PageHeader eyebrow="World Navigation" title="World Map">
        <Link className="button" href="/world">
          Portal
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      <div className="grid four">
        <MetricCard label="Regions" value={worldMap?.totals.regions ?? 0} />
        <MetricCard label="Cities" value={worldMap?.totals.cities ?? 0} />
        <MetricCard label="Founders" value={worldMap?.totals.founders ?? 0} />
        <MetricCard label="Live" value={worldMap?.totals.live ?? 0} />
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Cities</h2>
        {worldMap?.cities.length ? (
          <div className="grid three">
            {worldMap.cities.map((city) => (
              <Link
                className="card"
                href={`/world/cities/${city.slug}`}
                key={city.id}
              >
                <p className="eyebrow">{city.region?.name ?? "Region"}</p>
                <h3>{city.name}</h3>
                <p className="muted">
                  {city.districtLocations?.length ?? 0} placed districts
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Apply the Sprint 10 migration to seed the first world cities."
            title="No cities available"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>District Locations</h2>
        {worldMap?.districts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Category</th>
                  <th>City Placement</th>
                </tr>
              </thead>
              <tbody>
                {worldMap.districts.map((district) => (
                  <tr key={district.id}>
                    <td>
                      <Link href={`/world/districts/${district.slug}`}>
                        {district.name}
                      </Link>
                    </td>
                    <td>{district.category}</td>
                    <td>
                      {district.cityLocations?.[0]?.city.name ??
                        "Not placed yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStateCard
            description="District placement connects commerce categories to visible cities."
            title="No districts placed"
          />
        )}
      </section>
    </main>
  );
}
