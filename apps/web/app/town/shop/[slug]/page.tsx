"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyStateCard, ErrorMessage } from "../../../../components/ui";
import { MerchantBuildingFacade } from "../../../../components/merchant-building-facade";
import { MerchantRelationshipActions } from "../../../../components/merchant-relationship-actions";
import { ShopInterior } from "../../../../components/shop-interior";
import { getStoredUser } from "../../../../lib/auth";
import { worldApi } from "../../../../lib/api";
import type { WorldShop } from "../../../../lib/api";
import {
  getMerchantJournal,
  getMerchantSoul,
} from "../../../../lib/merchant-soul";
import { getMerchantIdentity } from "../../../../lib/living-world";
import { useMerchantMemory } from "../../../../lib/social-state";

export default function TownShopPage() {
  const params = useParams<{ slug: string }>();
  const [shop, setShop] = useState<WorldShop | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { memory, rememberShopVisit } = useMerchantMemory();

  useEffect(() => {
    worldApi
      .shop(params.slug)
      .then((result) => {
        setShop(result);
        setIsOwner(getStoredUser()?.id === result.ownerId);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to enter this shop.",
        ),
      );
  }, [params.slug]);

  const merchant = shop ? getMerchantIdentity(shop) : null;
  const soul = shop ? getMerchantSoul(shop) : null;
  const journals = shop ? getMerchantJournal(shop.slug) : [];

  useEffect(() => {
    if (shop) rememberShopVisit(shop);
  }, [shop, rememberShopVisit]);

  return (
    <main className="town-content">
      <ErrorMessage message={error} />
      {shop && merchant ? (
        <>
          <section className="storefront-hero">
            <div className="storefront-building">
              <MerchantBuildingFacade shop={shop} storefront />
            </div>
            <div className="storefront-copy">
              <div className="world-badge-row">
                {shop.liveNow ? (
                  <span className="world-badge live">LIVE</span>
                ) : null}
                {shop.isFounderMerchant ? (
                  <span className="world-badge founder">Founder Merchant</span>
                ) : null}
                {shop.isOfficialStore ? (
                  <span className="world-badge official">Official Store</span>
                ) : null}
              </div>
              <p className="world-kicker">
                {shop.city.name} / {shop.district.name}
              </p>
              <h1>{shop.name}</h1>
              <p>{shop.description ?? "A merchant storefront in Prontera."}</p>
              <div className="storefront-owner-line">
                <strong>{merchant.merchantName}</strong>
                <span>{merchant.merchantTitle}</span>
                <small>
                  {merchant.merchantReputation.toFixed(1)} reputation
                </small>
              </div>
              <MerchantRelationshipActions
                merchantName={merchant.merchantName}
                shopSlug={shop.slug}
              />
              <div className="button-row">
                <Link className="world-button" href="/town/merchant-city/shops">
                  Return to shops
                </Link>
                {isOwner ? (
                  <Link
                    className="world-button primary"
                    href="/dashboard/shops"
                  >
                    Open merchant dashboard
                  </Link>
                ) : null}
              </div>
            </div>
          </section>

          <ShopInterior merchant={merchant} shop={shop} />

          {soul ? (
            <section className="merchant-soul-section">
              <div className="section-heading">
                <p className="world-kicker">Merchant soul</p>
                <h2>Why {merchant.merchantName} built this place</h2>
                <p>{soul.memoryHook}</p>
              </div>
              <div className="merchant-soul-grid">
                <article className="merchant-soul-signature-card">
                  <span>Merchant class</span>
                  <p>
                    <strong>{soul.merchantClass}</strong>
                    <br />
                    {soul.personalityType} · {soul.communicationStyle}
                  </p>
                </article>
                <article className="merchant-soul-signature-card">
                  <span>Favorite product</span>
                  <p>{soul.favoriteProduct}</p>
                </article>
                <article className="merchant-soul-signature-card">
                  <span>Catch phrase</span>
                  <p>“{soul.catchPhrase}”</p>
                </article>
                <article>
                  <span>Personal goal</span>
                  <p>{soul.personalGoal}</p>
                </article>
                <article>
                  <span>Why they started</span>
                  <p>{soul.whyTheyStarted}</p>
                </article>
                <article>
                  <span>Founder history</span>
                  <p>{soul.founderHistory}</p>
                </article>
                <article>
                  <span>Journey</span>
                  <p>{soul.journey}</p>
                </article>
                <article>
                  <span>Background</span>
                  <p>{soul.background}</p>
                </article>
                <article>
                  <span>Motivation</span>
                  <p>{soul.motivation}</p>
                </article>
                <article>
                  <span>Dream</span>
                  <p>{soul.dream}</p>
                </article>
                <article>
                  <span>Challenge</span>
                  <p>{soul.challenge}</p>
                </article>
                <article className="your-memory-card">
                  <span>Your memory</span>
                  <p>
                    {memory.firstShopVisited === shop.slug
                      ? "This is the first shop your journey remembers."
                      : `You have visited this shop ${
                          memory.shopVisits[shop.slug] ?? 1
                        } time(s).`}
                  </p>
                </article>
              </div>
              <div className="merchant-milestone-grid">
                <div>
                  <p className="world-kicker">Milestones</p>
                  {soul.milestones.map((milestone) => (
                    <article key={`${milestone.date}-${milestone.title}`}>
                      <span>{milestone.date}</span>
                      <h3>{milestone.title}</h3>
                      <p>{milestone.body}</p>
                    </article>
                  ))}
                </div>
                <div>
                  <p className="world-kicker">Community contributions</p>
                  {soul.communityContributions.map((contribution) => (
                    <article key={contribution.title}>
                      <span>Contribution</span>
                      <h3>{contribution.title}</h3>
                      <p>{contribution.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="merchant-journal-section">
            <div className="section-heading with-action">
              <div>
                <p className="world-kicker">Merchant journal</p>
                <h2>Notes from {merchant.merchantName}</h2>
              </div>
              <span className="journal-follow-pill">
                {memory.storyFollowing.includes(shop.slug)
                  ? "Following this story"
                  : "Follow story above"}
              </span>
            </div>
            <div className="merchant-journal-grid">
              {(journals.length
                ? journals
                : [
                    {
                      id: "journal-coming-soon",
                      type: "Daily Note",
                      title: "The next note is being written",
                      body: `${merchant.merchantName} will share updates, stories, and world moments here.`,
                      time: "Soon",
                    },
                  ]
              ).map((entry) => (
                <article key={entry.id}>
                  <small>
                    {entry.type} · {entry.time}
                  </small>
                  <h3>{entry.title}</h3>
                  <p>{entry.body}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyStateCard
          description="The storefront will appear when its published building is available."
          title="Opening storefront"
        />
      )}
    </main>
  );
}
