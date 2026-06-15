"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../components/ui";
import { worldApi } from "../../../lib/api";
import type {
  CommerceGate,
  TravelOverview,
  WorldDistrict,
  WorldZone,
} from "../../../lib/api";

export default function WorldTravelPage() {
  const [overview, setOverview] = useState<TravelOverview | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGate, setSelectedGate] = useState<CommerceGate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zones = overview?.zones ?? [];
  const districts = overview?.districts ?? [];
  const gates = overview?.gates ?? [];

  const zoneDistricts = useMemo(
    () =>
      zoneId
        ? districts.filter((district) => district.zoneId === zoneId)
        : districts,
    [districts, zoneId],
  );

  useEffect(() => {
    void loadTravel();
  }, []);

  async function loadTravel(nextSearch = searchTerm) {
    try {
      const data = await worldApi.travel(nextSearch);
      setOverview(data);
      setZoneId((current) => current || data.zones[0]?.id || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load travel network.",
      );
    }
  }

  function quickTravel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gate = findMatchingGate(gates, zoneId, districtId);
    setSelectedGate(gate ?? null);
  }

  function searchDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadTravel(searchTerm);
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Fast Commerce Navigation" title="World Travel">
        <Link className="button" href="/world">
          Gate Network
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />

      <div className="grid two">
        <section className="panel">
          <h2>Quick Travel</h2>
          <form className="form-grid" onSubmit={quickTravel}>
            <label>
              City
              <select
                onChange={(event) => {
                  setZoneId(event.target.value);
                  setDistrictId("");
                }}
                value={zoneId}
              >
                {zones.map((zone: WorldZone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              District
              <select
                onChange={(event) => setDistrictId(event.target.value)}
                value={districtId}
              >
                <option value="">Any district</option>
                {zoneDistricts.map((district: WorldDistrict) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary" type="submit">
              Quick Travel
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Search Destination</h2>
          <form className="form-grid" onSubmit={searchDestination}>
            <label>
              Search
              <input
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="keyboard, fashion, wholesale"
                value={searchTerm}
              />
            </label>
            <button className="button primary" type="submit">
              Search Destination
            </button>
          </form>
          <div className="stack" style={{ marginTop: 16 }}>
            {overview?.recommendations.length ? (
              overview.recommendations.map((recommendation) => (
                <div className="card" key={recommendation.label}>
                  <p className="eyebrow">{recommendation.destinationType}</p>
                  <h3>{recommendation.label}</h3>
                  <p className="muted">{recommendation.reason}</p>
                </div>
              ))
            ) : (
              <EmptyStateCard
                description="Try a commerce intent such as keyboard, fashion, or wholesale."
                title="No recommendation selected"
              />
            )}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Travel Result</h2>
        {selectedGate ? (
          <div className="card">
            <p className="eyebrow">{selectedGate.gateType}</p>
            <h3>{selectedGate.title}</h3>
            <p className="muted">
              {selectedGate.sourceZone?.name ?? "Source"} to{" "}
              {selectedGate.destinationDistrict?.name ??
                selectedGate.destinationZone?.name ??
                "Destination"}
            </p>
          </div>
        ) : (
          <EmptyStateCard
            description="Choose a city or district, then quick travel through the best available Commerce Gate."
            title="Ready to travel"
          />
        )}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Available Gates</h2>
        {gates.length ? (
          <div className="grid three">
            {gates.map((gate) => (
              <article className="card" key={gate.id}>
                <p className="eyebrow">{gate.status}</p>
                <h3>{gate.title}</h3>
                <p className="muted">
                  {gate.destinationDistrict?.name ??
                    gate.destinationZone?.name ??
                    "Destination"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="No active gates are configured yet."
            title="No gates available"
          />
        )}
      </section>
    </main>
  );
}

function findMatchingGate(
  gates: CommerceGate[],
  zoneId: string,
  districtId: string,
) {
  if (districtId) {
    return (
      gates.find((gate) => gate.destinationDistrictId === districtId) ?? null
    );
  }

  if (zoneId) {
    return gates.find((gate) => gate.destinationZoneId === zoneId) ?? null;
  }

  return gates[0] ?? null;
}
