"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  buildingsApi,
  shopsApi,
  type MerchantBuilding,
  type Shop,
} from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

const themes = ["CLASSIC", "MODERN", "TECH", "ARTISAN", "HARBOR", "WHOLESALE"];

export default function BuildingSettingsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [building, setBuilding] = useState<MerchantBuilding | null>(null);
  const [form, setForm] = useState({
    storefrontTheme: "CLASSIC",
    logoUrl: "",
    signText: "",
    bannerUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load(nextShopId = shopId) {
    const nextBuilding = await buildingsApi.me(nextShopId || undefined);
    setBuilding(nextBuilding);
    setForm({
      storefrontTheme: nextBuilding.storefrontTheme,
      logoUrl: nextBuilding.logoUrl ?? "",
      signText: nextBuilding.signText ?? nextBuilding.shopName,
      bannerUrl: nextBuilding.bannerUrl ?? "",
    });
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
      setError(err instanceof Error ? err.message : "Unable to load building."),
    );
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const updated = await buildingsApi.updateMe({
        shopId,
        storefrontTheme: form.storefrontTheme,
        logoUrl: form.logoUrl,
        signText: form.signText,
        bannerUrl: form.bannerUrl,
      });
      setBuilding(updated);
      setSuccess("Building settings updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update building.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="Merchant World" title="Building Settings">
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
      {success ? <div className="success">{success}</div> : null}
      {building ? (
        <>
          <div className="grid four">
            <MetricCard label="Building" value={building.buildingType} />
            <MetricCard label="Theme" value={building.storefrontTheme} />
            <MetricCard
              label="Founder"
              value={building.isFounder ? "Yes" : "No"}
            />
            <MetricCard
              label="Live"
              value={building.isLive ? "LIVE" : "Offline"}
            />
          </div>
          <div className="grid two" style={{ marginTop: 16 }}>
            <form className="panel form-grid" onSubmit={submit}>
              <label>
                Theme
                <select
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      storefrontTheme: event.target.value,
                    }))
                  }
                  value={form.storefrontTheme}
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Logo URL
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      logoUrl: event.target.value,
                    }))
                  }
                  value={form.logoUrl}
                />
              </label>
              <label>
                Store Sign
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      signText: event.target.value,
                    }))
                  }
                  value={form.signText}
                />
              </label>
              <label>
                Banner URL
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bannerUrl: event.target.value,
                    }))
                  }
                  value={form.bannerUrl}
                />
              </label>
              <button className="button primary" type="submit">
                Save Building
              </button>
            </form>
            <section className="panel">
              <h2>Storefront Preview</h2>
              <div className="card">
                <div className="button-row" style={{ marginBottom: 10 }}>
                  {building.isFounder ? (
                    <span className="badge warn">Founder</span>
                  ) : null}
                  {building.isOfficialStore ? (
                    <span className="badge">Official Store</span>
                  ) : null}
                  {building.isLive ? <span className="badge">LIVE</span> : null}
                </div>
                <p className="eyebrow">{building.storefrontTheme}</p>
                <h3>{form.signText}</h3>
                <p className="muted">
                  {building.buildingType} / level {building.buildingLevel}
                </p>
                {building.promotionBanner ? (
                  <p>{building.promotionBanner}</p>
                ) : null}
              </div>
            </section>
          </div>
        </>
      ) : (
        <EmptyStateCard
          description="Publish a shop into the world to receive a merchant building."
          title="No building yet"
        />
      )}
    </>
  );
}
