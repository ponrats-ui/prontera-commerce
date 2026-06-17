"use client";

import { useEffect, useState } from "react";
import {
  foundersApi,
  type FounderApplication,
  type FounderMetrics,
} from "../../../lib/api";
import { ErrorMessage, MetricCard, PageHeader } from "../../../components/ui";

export default function AdminFoundersPage() {
  const [applications, setApplications] = useState<FounderApplication[]>([]);
  const [metrics, setMetrics] = useState<FounderMetrics | null>(null);
  const [status, setStatus] = useState<FounderApplication["status"] | "">("");
  const [shopIds, setShopIds] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load(nextStatus = status) {
    const [nextApplications, nextMetrics] = await Promise.all([
      foundersApi.adminList(nextStatus || undefined),
      foundersApi.metrics(),
    ]);
    setApplications(nextApplications);
    setMetrics(nextMetrics);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load applications.",
      ),
    );
  }, []);

  async function approve(application: FounderApplication) {
    setError(null);
    try {
      const body: { shopId?: string; reviewNotes?: string } = {};
      const shopId = shopIds[application.id]?.trim();
      const reviewNotes = notes[application.id]?.trim();
      if (shopId) body.shopId = shopId;
      if (reviewNotes) body.reviewNotes = reviewNotes;
      await foundersApi.approve(application.id, body);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to approve application.",
      );
    }
  }

  async function reject(application: FounderApplication) {
    setError(null);
    try {
      const body: { reviewNotes?: string } = {};
      const reviewNotes = notes[application.id]?.trim();
      if (reviewNotes) body.reviewNotes = reviewNotes;
      await foundersApi.reject(application.id, body);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject application.",
      );
    }
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Admin" title="Founder Applications">
        <select
          onChange={(event) => {
            const nextStatus = event.target.value as typeof status;
            setStatus(nextStatus);
            void load(nextStatus);
          }}
          value={status}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </PageHeader>
      <ErrorMessage message={error} />
      <div className="grid four">
        <MetricCard label="Applications" value={metrics?.applications ?? 0} />
        <MetricCard
          label="Approved Founders"
          value={metrics?.approvedFounders ?? 0}
        />
        <MetricCard
          label="Active Founders"
          value={metrics?.activeFounders ?? 0}
        />
        <MetricCard
          hint="Approved founders / applications"
          label="Conversion"
          value={`${metrics?.founderConversionRate ?? 0}%`}
        />
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Review Applications</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong>{application.merchantName}</strong>
                    <p className="muted">{application.motivation}</p>
                  </td>
                  <td>
                    {application.businessName}
                    <p className="muted">
                      {application.businessType} / {application.category}
                    </p>
                  </td>
                  <td>
                    {application.email}
                    <p className="muted">{application.phone}</p>
                  </td>
                  <td>
                    <span className="badge">{application.status}</span>
                  </td>
                  <td>
                    <div className="form-grid">
                      <input
                        onChange={(event) =>
                          setShopIds((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                        placeholder="Optional shopId"
                        value={shopIds[application.id] ?? ""}
                      />
                      <textarea
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                        placeholder="Review notes"
                        value={notes[application.id] ?? ""}
                      />
                      <div className="button-row">
                        <button
                          className="button primary"
                          disabled={application.status === "APPROVED"}
                          onClick={() => void approve(application)}
                          type="button"
                        >
                          Approve Founder
                        </button>
                        <button
                          className="button danger"
                          disabled={application.status === "REJECTED"}
                          onClick={() => void reject(application)}
                          type="button"
                        >
                          Reject
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
