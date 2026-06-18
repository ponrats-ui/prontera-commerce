"use client";

import { useEffect, useMemo, useState } from "react";
import { SocialShell } from "../../components/social-shell";
import type { WorldShop } from "../../lib/api";
import { worldApi } from "../../lib/api";
import {
  getCustomerTitle,
  getMerchantTier,
  merchantReputationScore,
} from "../../lib/social-civilization";
import { useSocialState } from "../../lib/social-state";

const merchantTiers = [
  ["Bronze Merchant", 0],
  ["Silver Merchant", 50],
  ["Gold Merchant", 70],
  ["Master Merchant", 85],
  ["Legendary Merchant", 95],
] as const;

export default function ReputationPage() {
  const [shops, setShops] = useState<WorldShop[]>([]);
  const { state } = useSocialState();

  useEffect(() => {
    worldApi
      .shops()
      .then(setShops)
      .catch(() => setShops([]));
  }, []);

  const customerScore = Math.min(
    100,
    state.helpfulReviews * 3 +
      state.communityParticipation * 2 +
      state.attendingEvents.length * 5 +
      state.merchantRecommendations * 3,
  );
  const title = getCustomerTitle(customerScore);
  const rankedShops = useMemo(
    () =>
      shops
        .map((shop) => ({ shop, score: merchantReputationScore(shop) }))
        .sort((a, b) => b.score - a.score),
    [shops],
  );

  return (
    <SocialShell>
      <main className="social-page">
        <header className="social-page-header">
          <p className="world-kicker">Visible trust</p>
          <h1>Reputation belongs to both sides of commerce</h1>
          <p>
            Merchants earn trust through service and community. Citizens earn
            trust through helpful participation and respectful recommendations.
          </p>
        </header>

        <section className="customer-reputation-hero">
          <div className="reputation-medal">
            <span>{customerScore}</span>
          </div>
          <div>
            <p className="world-kicker">Your customer reputation</p>
            <h2>{title}</h2>
            <div className="reputation-progress">
              <span style={{ width: `${customerScore}%` }} />
            </div>
            <div className="reputation-factor-row">
              <span>{state.helpfulReviews} helpful reviews</span>
              <span>{state.communityParticipation} community actions</span>
              <span>{state.attendingEvents.length} event attendance</span>
              <span>{state.merchantRecommendations} recommendations</span>
            </div>
          </div>
        </section>

        <section className="tier-road">
          {merchantTiers.map(([tier, threshold]) => (
            <article key={tier}>
              <span
                className={`tier-shield tier-${tier.split(" ")[0]!.toLowerCase()}`}
              >
                {tier.slice(0, 1)}
              </span>
              <strong>{tier}</strong>
              <small>{threshold}+ trust</small>
            </article>
          ))}
        </section>

        <section className="merchant-reputation-list">
          <div className="section-heading">
            <p className="world-kicker">Merchant trust</p>
            <h2>People behind respected stores</h2>
          </div>
          {rankedShops.map(({ shop, score }, index) => (
            <article key={shop.id}>
              <strong>#{index + 1}</strong>
              <div>
                <h3>{shop.name}</h3>
                <p>{shop.district.name}</p>
              </div>
              <span className="merchant-tier-pill">
                {getMerchantTier(score)}
              </span>
              <div className="merchant-score">
                <strong>{score}</strong>
                <small>trust score</small>
              </div>
              <ul>
                <li>
                  {shop.isFounderMerchant
                    ? "Founder status"
                    : "Growing longevity"}
                </li>
                <li>
                  {shop.liveNow
                    ? "Active community presence"
                    : "Published storefront"}
                </li>
                <li>
                  {shop.isOfficialStore
                    ? "Official store"
                    : "Merchant identity"}
                </li>
              </ul>
            </article>
          ))}
        </section>
      </main>
    </SocialShell>
  );
}
