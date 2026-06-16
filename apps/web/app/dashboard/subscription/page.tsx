"use client";

import { useEffect, useMemo, useState } from "react";
import {
  shopsApi,
  subscriptionsApi,
  type MerchantSubscriptionOverview,
  type Shop,
  type SubscriptionPlan,
} from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

export default function SubscriptionPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [overview, setOverview] = useState<MerchantSubscriptionOverview | null>(
    null,
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = overview?.effectivePlan;
  const proPlan = useMemo(
    () => plans.find((plan) => plan.planType === "PRO"),
    [plans],
  );

  async function load(nextShopId = shopId) {
    const [nextPlans, nextOverview] = await Promise.all([
      subscriptionsApi.plans(),
      subscriptionsApi.me(nextShopId || undefined),
    ]);

    setPlans(nextPlans);
    setOverview(nextOverview);
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await load(firstShop.id);
      } else {
        setPlans(await subscriptionsApi.plans());
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load subscription.",
      ),
    );
  }, []);

  async function upgradeToPro() {
    if (!shopId) return;
    setError(null);
    try {
      await subscriptionsApi.upgrade({ shopId, planType: "PRO" });
      await load(shopId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upgrade plan.");
    }
  }

  async function cancelPlan() {
    if (!shopId) return;
    setError(null);
    try {
      await subscriptionsApi.cancel({ shopId });
      await load(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel subscription.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="Merchant billing" title="Subscription">
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
      {overview ? (
        <>
          <div className="grid four">
            <MetricCard
              hint={overview.subscription.status}
              label="Current plan"
              value={currentPlan?.name ?? "Starter"}
            />
            <MetricCard
              hint={`${overview.trialDurationDays}-day trial`}
              label="Trial remaining"
              value={overview.trialDaysRemaining}
            />
            <MetricCard
              label="Founder"
              value={overview.isFounderMerchant ? "Active" : "No"}
            />
            <MetricCard
              label="Live Commerce"
              value={currentPlan?.liveCommerce ? "Enabled" : "Locked"}
            />
          </div>
          <div className="grid two" style={{ marginTop: 16 }}>
            <section className="panel">
              <h2>Current subscription</h2>
              <div className="card">
                <p className="eyebrow">{overview.shop.name}</p>
                <h3>{currentPlan?.name ?? "Starter Free Forever"}</h3>
                <p className="muted">
                  {currentPlan?.description ?? "Starter merchant access."}
                </p>
                <p>
                  {overview.subscription.trialEndAt
                    ? `Trial ends ${new Date(
                        overview.subscription.trialEndAt,
                      ).toLocaleDateString()}`
                    : "Free forever access"}
                </p>
                <div className="toolbar">
                  <button
                    className="button primary"
                    disabled={!proPlan}
                    onClick={upgradeToPro}
                    type="button"
                  >
                    Upgrade to Pro
                  </button>
                  <button className="button" onClick={cancelPlan} type="button">
                    Return to Starter
                  </button>
                </div>
              </div>
            </section>
            <section className="panel">
              <h2>Founder status</h2>
              <div className="card">
                <p className="eyebrow">
                  {overview.isFounderMerchant ? "FOUNDER" : "STANDARD"}
                </p>
                <h3>
                  {overview.isFounderMerchant
                    ? "Founder Merchant"
                    : "Founder program not active"}
                </h3>
                <p className="muted">
                  Founder merchants receive Pro access, a founder badge,
                  priority placement, and early feature access.
                </p>
                <p>
                  {overview.founderProgram?.founderExpiresAt
                    ? `Expires ${new Date(
                        overview.founderProgram.founderExpiresAt,
                      ).toLocaleDateString()}`
                    : overview.isFounderMerchant
                      ? "No founder expiry set"
                      : "Admin grant required"}
                </p>
              </div>
            </section>
          </div>
        </>
      ) : (
        <EmptyStateCard
          description="Create a shop to start a 30-day Pro trial."
          title="No merchant subscription yet"
        />
      )}
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Plan comparison</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Live</th>
                <th>Staff</th>
                <th>Analytics</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.productLimit ?? "Unlimited"}</td>
                  <td>{plan.monthlyOrderLimit ?? "Unlimited"}</td>
                  <td>{plan.liveCommerce ? "Yes" : "No"}</td>
                  <td>{plan.multiStaff ? "Yes" : "No"}</td>
                  <td>{plan.advancedAnalytics ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
