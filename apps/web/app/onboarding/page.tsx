"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { EmptyStateCard, ErrorMessage, PageHeader } from "../../components/ui";
import {
  merchantOnboardingApi,
  type MerchantOnboardingDistrict,
  type MerchantOnboardingPublishResult,
  type MerchantOnboardingStatus,
} from "../../lib/api";

const fallbackDistricts: MerchantOnboardingDistrict[] = [
  {
    slug: "tech-bazaar",
    code: "TECH_BAZAAR",
    name: "Tech Bazaar",
    category: "TECH",
    description: "Technology merchants and digital service providers.",
  },
  {
    slug: "artisan-valley",
    code: "ARTISAN_VALLEY",
    name: "Artisan Valley",
    category: "ARTISAN",
    description: "Makers, craft shops, and story-rich merchant identities.",
  },
  {
    slug: "harbor-district",
    code: "HARBOR_DISTRICT",
    name: "Harbor District",
    category: "HARBOR",
    description: "Trade routes, regional goods, and logistics commerce.",
  },
  {
    slug: "wholesale-quarter",
    code: "WHOLESALE_QUARTER",
    name: "Wholesale Quarter",
    category: "WHOLESALE",
    description: "B2B trade, distributors, procurement, and bulk orders.",
  },
];

const steps = [
  "Merchant Profile",
  "Shop Branding",
  "District Selection",
  "Starter Plan",
  "Publish Shop",
];

const initialForm = {
  merchantName: "",
  shopName: "",
  category: "",
  logoUrl: "",
  bannerUrl: "",
  districtSlug: "tech-bazaar",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<MerchantOnboardingStatus | null>(null);
  const [result, setResult] = useState<MerchantOnboardingPublishResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const districts = status?.districts.length
    ? status.districts
    : fallbackDistricts;
  const selectedDistrict = useMemo(
    () => districts.find((district) => district.slug === form.districtSlug),
    [districts, form.districtSlug],
  );

  useEffect(() => {
    merchantOnboardingApi
      .status()
      .then((nextStatus) => {
        setStatus(nextStatus);
        setForm((current) => ({
          ...current,
          districtSlug:
            current.districtSlug || nextStatus.districts[0]?.slug || "",
        }));
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load onboarding status.",
        ),
      );
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function next() {
    setError(null);
    if (
      step === 0 &&
      (!form.merchantName || !form.shopName || !form.category)
    ) {
      setError("Merchant name, shop name, and category are required.");
      return;
    }

    if (step === 0) {
      try {
        await merchantOnboardingApi.start({ merchantName: form.merchantName });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to start onboarding.",
        );
        return;
      }
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        merchantName: form.merchantName,
        shopName: form.shopName,
        category: form.category,
        districtSlug: form.districtSlug,
        ...(form.logoUrl ? { logoUrl: form.logoUrl } : {}),
        ...(form.bannerUrl ? { bannerUrl: form.bannerUrl } : {}),
      };
      const response = await merchantOnboardingApi.publish({
        ...payload,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish shop.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="content">
        <PageHeader
          eyebrow="Merchant Civilization"
          title="Welcome to Prontera."
        />
        <section className="panel">
          <h2>Your shop is now part of the Merchant Civilization.</h2>
          <p className="muted">
            {result.shop.name} has been placed in{" "}
            {result.worldLocation.district.name} with a published merchant
            building.
          </p>
          <div className="grid three" style={{ marginTop: 16 }}>
            <div className="card">
              <p className="eyebrow">District</p>
              <h3>{result.worldLocation.district.name}</h3>
            </div>
            <div className="card">
              <p className="eyebrow">Building</p>
              <h3>{result.building.buildingType.replace(/_/g, " ")}</h3>
            </div>
            <div className="card">
              <p className="eyebrow">Coordinates</p>
              <h3>
                {result.building.xCoordinate}, {result.building.yCoordinate}
              </h3>
            </div>
          </div>
          <div className="button-row" style={{ marginTop: 18 }}>
            <Link className="button primary" href={result.links.shop}>
              Go To Shop
            </Link>
            <Link className="button" href={result.links.world}>
              Explore World
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="content">
      <PageHeader
        eyebrow="Merchant Onboarding World"
        title="Launch your shop in Prontera"
      />
      <ErrorMessage message={error} />

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="grid five-step">
          {steps.map((label, index) => (
            <div className="card" key={label}>
              <p className="eyebrow">Step {index + 1}</p>
              <h3>{label}</h3>
              <p className="muted">{index <= step ? "Active" : "Pending"}</p>
            </div>
          ))}
        </div>
      </section>

      <form className="panel" onSubmit={publish}>
        {step === 0 ? (
          <div className="form-grid">
            <h2>Merchant Profile</h2>
            <label>
              Merchant name
              <input
                onChange={(event) =>
                  updateField("merchantName", event.target.value)
                }
                required
                value={form.merchantName}
              />
            </label>
            <label>
              Shop name
              <input
                onChange={(event) =>
                  updateField("shopName", event.target.value)
                }
                required
                value={form.shopName}
              />
            </label>
            <label>
              Category
              <input
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="Coffee, electronics, handmade goods"
                required
                value={form.category}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="form-grid">
            <h2>Shop Branding</h2>
            <label>
              Logo upload URL
              <input
                onChange={(event) => updateField("logoUrl", event.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
                value={form.logoUrl}
              />
            </label>
            <label>
              Banner upload URL
              <input
                onChange={(event) =>
                  updateField("bannerUrl", event.target.value)
                }
                placeholder="https://example.com/banner.png"
                type="url"
                value={form.bannerUrl}
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="form-grid">
            <h2>District Selection</h2>
            <div className="grid four">
              {districts.map((district) => (
                <button
                  className="card"
                  key={district.slug}
                  onClick={() => updateField("districtSlug", district.slug)}
                  style={{
                    borderColor:
                      form.districtSlug === district.slug
                        ? "var(--brand)"
                        : "var(--line)",
                    textAlign: "left",
                  }}
                  type="button"
                >
                  <p className="eyebrow">{district.category}</p>
                  <h3>{district.name}</h3>
                  <p className="muted">{district.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="form-grid">
            <h2>Starter Plan</h2>
            <div className="grid two">
              <div className="card">
                <p className="eyebrow">Starter</p>
                <h3>Free Forever</h3>
                <p className="muted">
                  Start with a shop presence, basic commerce foundation, and a
                  published world location.
                </p>
              </div>
              <div className="card">
                <p className="eyebrow">Founder Merchant Program</p>
                <h3>Early Merchant Recognition</h3>
                <ul>
                  {(
                    status?.founderProgram.benefits ?? [
                      "1 month free Pro",
                      "Founder Badge",
                      "Early Merchant Recognition",
                    ]
                  ).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="form-grid">
            <h2>Publish Shop</h2>
            <div className="grid two">
              <div className="card">
                <p className="eyebrow">Shop</p>
                <h3>{form.shopName}</h3>
                <p className="muted">{form.category}</p>
              </div>
              <div className="card">
                <p className="eyebrow">World District</p>
                <h3>{selectedDistrict?.name ?? "District"}</h3>
                <p className="muted">
                  Your merchant building will be published into Prontera World.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!status && step === 0 && !error ? (
          <EmptyStateCard
            description="Sign in with a merchant account to publish a shop into the world."
            title="Loading onboarding status"
          />
        ) : null}

        <div className="button-row" style={{ marginTop: 18 }}>
          {step > 0 ? (
            <button
              className="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              Back
            </button>
          ) : null}
          {step < steps.length - 1 ? (
            <button className="button primary" onClick={next} type="button">
              Continue
            </button>
          ) : (
            <button className="button primary" disabled={loading} type="submit">
              {loading ? "Publishing..." : "Publish Shop"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
