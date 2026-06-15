"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { liveCommerceApi, shopsApi } from "../../../lib/api";
import type {
  LiveChannel,
  LiveCommerceAccess,
  Shop,
} from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

const upgradeMessage = "Live Commerce is available on Pro plan and above.";

const initialForm = {
  title: "",
  description: "",
  videoUrl: "",
  status: "DRAFT",
};

export default function LiveCommercePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [access, setAccess] = useState<LiveCommerceAccess | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () =>
      channels.find((channel) => channel.id === selectedId) ?? channels[0],
    [channels, selectedId],
  );

  const activeChannel = channels.find((channel) => channel.status === "LIVE");
  const canCreate = Boolean(access?.canUseLiveCommerce && shopId);

  async function loadLiveCommerce(nextShopId = shopId) {
    if (!nextShopId) return;

    const [nextAccess, nextChannels] = await Promise.all([
      liveCommerceApi.access(nextShopId),
      liveCommerceApi.list(nextShopId),
    ]);

    setAccess(nextAccess);
    setChannels(nextChannels);
    setSelectedId(nextChannels[0]?.id ?? "");
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await loadLiveCommerce(firstShop.id);
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Live Commerce.",
      ),
    );
  }, []);

  async function createChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    setError(null);

    try {
      await liveCommerceApi.create(shopId, {
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        status: form.status,
      });
      setForm(initialForm);
      await loadLiveCommerce(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create live channel.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: "go-live" | "end" | "disable") {
    if (!selected) return;
    setSaving(true);
    setError(null);

    try {
      if (action === "go-live") {
        await liveCommerceApi.goLive(selected.id);
      } else if (action === "end") {
        await liveCommerceApi.end(selected.id);
      } else {
        await liveCommerceApi.update(selected.id, { status: "DISABLED" });
      }

      await loadLiveCommerce(shopId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update live channel.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Pro storefront" title="Live Commerce">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void loadLiveCommerce(event.target.value);
          }}
          value={shopId}
        >
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
      </PageHeader>
      <ErrorMessage message={error} />

      <div className="grid four">
        <MetricCard label="Channels" value={channels.length} />
        <MetricCard label="Live now" value={activeChannel ? 1 : 0} />
        <MetricCard
          label="Scheduled"
          value={channels.filter((channel) => channel.status === "SCHEDULED").length}
        />
        <MetricCard label="Plan access" value={access?.minimumPlan ?? "PRO"} />
      </div>

      {!access?.canUseLiveCommerce ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <p className="eyebrow">Upgrade required</p>
          <h2>{upgradeMessage}</h2>
          <p className="muted">
            Starter shops can review existing Live Commerce history, but new
            YouTube live channels require a Pro, Business, or Enterprise plan.
          </p>
        </section>
      ) : null}

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Live channels</h2>
          {channels.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel) => (
                    <tr key={channel.id}>
                      <td>{channel.title}</td>
                      <td>{channel.provider}</td>
                      <td>
                        <span className="badge">{channel.status}</span>
                      </td>
                      <td>
                        <button
                          className="button"
                          onClick={() => setSelectedId(channel.id)}
                          type="button"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyStateCard
              description="Create a YouTube live channel to host product demos, live selling sessions, and future virtual shop screens."
              title="Create your first live channel"
            />
          )}
        </section>

        <section className="panel">
          <h2>Create YouTube channel</h2>
          <form className="form-grid" onSubmit={createChannel}>
            <label>
              title
              <input
                disabled={!canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
                value={form.title}
              />
            </label>
            <label>
              description
              <textarea
                disabled={!canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={3}
                value={form.description}
              />
            </label>
            <label>
              YouTube URL
              <input
                disabled={!canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    videoUrl: event.target.value,
                  }))
                }
                required
                value={form.videoUrl}
              />
            </label>
            <label>
              status
              <select
                disabled={!canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                value={form.status}
              >
                <option>DRAFT</option>
                <option>SCHEDULED</option>
              </select>
            </label>
            <button
              className="button primary"
              disabled={!canCreate || saving}
              type="submit"
            >
              Create channel
            </button>
          </form>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Channel preview</h2>
        {selected ? (
          <div className="grid two">
            <div className="stack">
              <div className="card">
                <p className="eyebrow">{selected.status}</p>
                <h3>{selected.title}</h3>
                <p className="muted">
                  {selected.description ?? "No description yet"}
                </p>
              </div>
              <div className="button-row">
                <button
                  className="button primary"
                  disabled={saving || selected.status === "LIVE"}
                  onClick={() => void runAction("go-live")}
                  type="button"
                >
                  Go Live
                </button>
                <button
                  className="button"
                  disabled={saving || selected.status !== "LIVE"}
                  onClick={() => void runAction("end")}
                  type="button"
                >
                  End Live
                </button>
                <button
                  className="button"
                  disabled={saving || selected.status === "DISABLED"}
                  onClick={() => void runAction("disable")}
                  type="button"
                >
                  Disable
                </button>
              </div>
            </div>
            <div className="video-frame">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                src={selected.embedUrl}
                title={selected.title}
              />
            </div>
          </div>
        ) : (
          <EmptyStateCard
            description="Select a channel to preview the YouTube embed."
            title="No channel selected"
          />
        )}
      </section>
    </>
  );
}
