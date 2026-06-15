"use client";

import { FormEvent, useEffect, useState } from "react";
import { shopsApi } from "../../../lib/api";
import type { Shop } from "../../../lib/api";
import { EmptyState, ErrorMessage, PageHeader } from "../../../components/ui";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  countryCode: "US",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  timeZone: "UTC",
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await shopsApi.mine();
    setShops(data);
    setSelected((current) => current ?? data[0] ?? null);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Unable to load shops."),
    );
  }, []);

  async function createShop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await shopsApi.create(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create shop.");
    }
  }

  async function updateSelected(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      const payload: Partial<Shop> = {
        name: selected.name,
      };
      if (selected.description !== undefined)
        payload.description = selected.description;
      if (selected.countryCode !== undefined)
        payload.countryCode = selected.countryCode;
      if (selected.preferredLocale !== undefined) {
        payload.preferredLocale = selected.preferredLocale;
      }
      if (selected.preferredCurrency !== undefined) {
        payload.preferredCurrency = selected.preferredCurrency;
      }
      if (selected.timeZone !== undefined) payload.timeZone = selected.timeZone;

      const updated = await shopsApi.update(selected.id, payload);
      setSelected(updated);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update shop.");
    }
  }

  return (
    <>
      <PageHeader eyebrow="Merchant setup" title="Shop Management" />
      <ErrorMessage message={error} />
      <div className="grid two">
        <section className="panel">
          <h2>My shops</h2>
          {shops.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop.id}>
                      <td>{shop.name}</td>
                      <td>{shop.slug}</td>
                      <td>
                        <span className="badge">{shop.status ?? "ACTIVE"}</span>
                      </td>
                      <td>
                        <button
                          className="button"
                          onClick={() => setSelected(shop)}
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
            <EmptyState>No shops yet.</EmptyState>
          )}
        </section>

        <section className="panel">
          <h2>Create shop</h2>
          <form className="form-grid two" onSubmit={createShop}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  required={key !== "description"}
                  value={value}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              Create shop
            </button>
          </form>
        </section>
      </div>

      {selected ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <h2>Shop details</h2>
          <form className="form-grid two" onSubmit={updateSelected}>
            <label>
              Name
              <input
                onChange={(event) =>
                  setSelected({ ...selected, name: event.target.value })
                }
                value={selected.name}
              />
            </label>
            <label>
              Description
              <input
                onChange={(event) =>
                  setSelected({ ...selected, description: event.target.value })
                }
                value={selected.description ?? ""}
              />
            </label>
            <label>
              Country
              <input
                onChange={(event) =>
                  setSelected({ ...selected, countryCode: event.target.value })
                }
                value={selected.countryCode ?? ""}
              />
            </label>
            <label>
              Locale
              <input
                onChange={(event) =>
                  setSelected({
                    ...selected,
                    preferredLocale: event.target.value,
                  })
                }
                value={selected.preferredLocale ?? ""}
              />
            </label>
            <label>
              Currency
              <input
                onChange={(event) =>
                  setSelected({
                    ...selected,
                    preferredCurrency: event.target.value,
                  })
                }
                value={selected.preferredCurrency ?? ""}
              />
            </label>
            <label>
              Timezone
              <input
                onChange={(event) =>
                  setSelected({ ...selected, timeZone: event.target.value })
                }
                value={selected.timeZone ?? ""}
              />
            </label>
            <button className="button primary" type="submit">
              Save changes
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
