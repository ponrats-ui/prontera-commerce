"use client";

import { useEffect, useState } from "react";
import {
  buildingsApi,
  type MerchantBuilding,
  type MerchantBuildingMetrics,
} from "../../../lib/api";
import { ErrorMessage, MetricCard, PageHeader } from "../../../components/ui";

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<MerchantBuilding[]>([]);
  const [metrics, setMetrics] = useState<MerchantBuildingMetrics | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [nextBuildings, nextMetrics] = await Promise.all([
      buildingsApi.adminList(),
      buildingsApi.metrics(),
    ]);
    setBuildings(nextBuildings);
    setMetrics(nextMetrics);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load buildings.",
      ),
    );
  }, []);

  async function updateBuilding(id: string, isOfficialStore: boolean) {
    setError(null);
    try {
      const body: { isOfficialStore: boolean; signText?: string } = {
        isOfficialStore,
      };
      const signText = notes[id]?.trim();
      if (signText) body.signText = signText;
      await buildingsApi.adminUpdate(id, body);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update building.",
      );
    }
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Admin" title="Building Management" />
      <ErrorMessage message={error} />
      <div className="grid four">
        <MetricCard
          label="Published"
          value={metrics?.publishedBuildings ?? 0}
        />
        <MetricCard label="Founder" value={metrics?.founderBuildings ?? 0} />
        <MetricCard label="Official" value={metrics?.officialStores ?? 0} />
        <MetricCard label="Live" value={metrics?.liveStores ?? 0} />
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Review Buildings</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Building</th>
                <th>Status</th>
                <th>Visuals</th>
                <th>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map((building) => (
                <tr key={building.id}>
                  <td>
                    <strong>{building.signText}</strong>
                    <p className="muted">{building.shopName}</p>
                  </td>
                  <td>
                    <div className="button-row">
                      {building.isFounder ? (
                        <span className="badge warn">Founder</span>
                      ) : null}
                      {building.isOfficialStore ? (
                        <span className="badge">Official</span>
                      ) : null}
                      {building.isLive ? (
                        <span className="badge">LIVE</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {building.buildingType} / {building.storefrontTheme}
                    <p className="muted">
                      x {building.xCoordinate}, y {building.yCoordinate}
                    </p>
                  </td>
                  <td>
                    <div className="form-grid">
                      <input
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [building.id]: event.target.value,
                          }))
                        }
                        placeholder="Moderated sign text"
                        value={notes[building.id] ?? ""}
                      />
                      <div className="button-row">
                        <button
                          className="button primary"
                          onClick={() => void updateBuilding(building.id, true)}
                          type="button"
                        >
                          Assign Official Store
                        </button>
                        <button
                          className="button"
                          onClick={() =>
                            void updateBuilding(building.id, false)
                          }
                          type="button"
                        >
                          Save Signage
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
