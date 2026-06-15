"use client";

import { FormEvent, useEffect, useState } from "react";
import { posApi, shopsApi } from "../../../lib/api";
import type { POSSession, Shop } from "../../../lib/api";
import { EmptyState, ErrorMessage, PageHeader } from "../../../components/ui";

function toCents(value: string) {
  return Math.round(Number(value || "0") * 100);
}

function formatMoney(amount: number | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format((amount ?? 0) / 100);
}

export default function POSPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [session, setSession] = useState<POSSession | null>(null);
  const [openingCash, setOpeningCash] = useState("0");
  const [closingCash, setClosingCash] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load(nextShopId = shopId) {
    if (!nextShopId) return;
    setSession(await posApi.current(nextShopId));
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await load(firstShop.id);
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load POS session.",
      ),
    );
  }, []);

  async function openSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const opened = await posApi.open({
        shopId,
        openingCash: toCents(openingCash),
      });
      setSession(opened);
      setMessage("POS session opened.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to open POS session.",
      );
    }
  }

  async function closeSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setMessage(null);
    try {
      const closed = await posApi.close({
        sessionId: session.id,
        closingCash: toCents(closingCash),
      });
      setSession(null);
      setMessage(`POS session closed at ${formatMoney(closed.closingCash)}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to close POS session.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="Counter sales" title="POS">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void load(event.target.value);
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
      {message ? <div className="success">{message}</div> : null}
      <div className="grid two">
        <section className="panel">
          <h2>Current session</h2>
          {session ? (
            <div className="stack">
              <div className="card">
                <span className="badge">{session.status}</span>
                <h3>{formatMoney(session.openingCash)}</h3>
                <p className="muted">
                  Opened {new Date(session.openedAt).toLocaleString()}
                </p>
              </div>
              <form onSubmit={closeSession}>
                <label>
                  Closing cash
                  <input
                    min="0"
                    onChange={(event) => setClosingCash(event.target.value)}
                    step="0.01"
                    type="number"
                    value={closingCash}
                  />
                </label>
                <button className="button" type="submit">
                  Close POS session
                </button>
              </form>
              <div>
                <h3>Shifts</h3>
                {session.shifts?.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Opening</th>
                          <th>Closing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.shifts.map((shift) => (
                          <tr key={shift.id}>
                            <td>
                              <span className="badge">{shift.status}</span>
                            </td>
                            <td>{formatMoney(shift.openingCash)}</td>
                            <td>{formatMoney(shift.closingCash)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState>No shifts loaded.</EmptyState>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={openSession}>
              <label>
                Opening cash
                <input
                  min="0"
                  onChange={(event) => setOpeningCash(event.target.value)}
                  step="0.01"
                  type="number"
                  value={openingCash}
                />
              </label>
              <button className="button" type="submit">
                Open POS session
              </button>
            </form>
          )}
        </section>
        <section className="panel">
          <h2>Cart and order action</h2>
          <EmptyState>
            Basic cart and counter order workflow is reserved for the next POS
            UX sprint.
          </EmptyState>
          <div className="card">
            <p className="eyebrow">Sprint 6 boundary</p>
            <h3>Manual payments only</h3>
            <p className="muted">
              External gateways, terminal integrations, and marketplace checkout
              are intentionally outside this web foundation.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
