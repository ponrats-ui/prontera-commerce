"use client";

import { useEffect, useState } from "react";
import { MerchantBuildingFacade } from "../../components/merchant-building-facade";
import { SocialShell } from "../../components/social-shell";
import type { WorldShop } from "../../lib/api";
import { worldApi } from "../../lib/api";
import { getMerchantIdentity } from "../../lib/living-world";
import { useSocialState } from "../../lib/social-state";

export default function FollowingPage() {
  const [shops, setShops] = useState<WorldShop[]>([]);
  const { state, toggleList } = useSocialState();

  useEffect(() => {
    worldApi
      .shops()
      .then(setShops)
      .catch(() => setShops([]));
  }, []);

  return (
    <SocialShell>
      <main className="social-page">
        <header className="social-page-header">
          <p className="world-kicker">Merchant relationships</p>
          <h1>Return to people you remember</h1>
          <p>
            Follow merchants for their news. Favorite the destinations that feel
            like part of your daily world.
          </p>
        </header>
        <div className="relationship-summary">
          <span>
            <strong>{state.followingMerchants.length}</strong>
            <small>Following</small>
          </span>
          <span>
            <strong>{state.favoriteMerchants.length}</strong>
            <small>Favorite shops</small>
          </span>
          <span>
            <strong>{18420 + state.followingMerchants.length}</strong>
            <small>Merchant fans across Prontera</small>
          </span>
        </div>
        <section className="following-grid">
          {shops.map((shop) => {
            const merchant = getMerchantIdentity(shop);
            const following = state.followingMerchants.includes(shop.slug);
            const favorite = state.favoriteMerchants.includes(shop.slug);
            return (
              <article key={shop.id}>
                <div className="following-facade">
                  <MerchantBuildingFacade compact shop={shop} />
                </div>
                <div className="following-copy">
                  <p className="world-kicker">{merchant.merchantTitle}</p>
                  <h2>{merchant.merchantName}</h2>
                  <h3>{shop.name}</h3>
                  <p>{merchant.merchantStory}</p>
                  <div className="relationship-action-row">
                    <button
                      className={following ? "active" : ""}
                      onClick={() =>
                        toggleList("followingMerchants", shop.slug)
                      }
                      type="button"
                    >
                      {following ? "Following" : "Follow merchant"}
                    </button>
                    <button
                      className={favorite ? "active favorite" : ""}
                      onClick={() => toggleList("favoriteMerchants", shop.slug)}
                      type="button"
                    >
                      {favorite ? "★ Favorite" : "☆ Favorite shop"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </SocialShell>
  );
}
