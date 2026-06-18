"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CivilizationMetrics } from "../../components/civilization-metrics";
import { MerchantBuildingFacade } from "../../components/merchant-building-facade";
import { SocialAiGuide } from "../../components/social-ai-guide";
import { SocialShell } from "../../components/social-shell";
import type { WorldMap } from "../../lib/api";
import { worldApi } from "../../lib/api";
import {
  civilizationFeed,
  commerceEvents,
  guilds,
} from "../../lib/social-civilization";
import {
  claimDailyVisit,
  hasClaimedDailyVisit,
  useSocialState,
} from "../../lib/social-state";

export default function CommerceSquarePage() {
  const [world, setWorld] = useState<WorldMap | null>(null);
  const [claimed, setClaimed] = useState(false);
  const { state } = useSocialState();
  const guildSpotlight = guilds[1] ?? guilds[0];
  const nextEvent = commerceEvents[0];

  useEffect(() => {
    worldApi
      .map()
      .then(setWorld)
      .catch(() => setWorld(null));
    setClaimed(hasClaimedDailyVisit());
  }, []);

  const featured = useMemo(
    () =>
      world?.shops.find((shop) => shop.isFounderMerchant) ??
      world?.shops[0] ??
      null,
    [world],
  );

  return (
    <SocialShell>
      <main className="social-page commerce-square-page">
        <CivilizationMetrics merchantCount={world?.shops.length ?? 0} />
        <section className="commerce-square-hero">
          <div>
            <p className="world-kicker">The social heart of Prontera</p>
            <h1>Commerce Square</h1>
            <p>
              Meet citizens, hear merchant stories, join guilds, and discover
              what changed across the world today.
            </p>
            <div className="square-status-row">
              <span>
                <strong>{state.friends.length}</strong> Friends nearby
              </span>
              <span>
                <strong>{state.followingMerchants.length}</strong> Merchants
                followed
              </span>
              <span>
                <strong>{state.joinedGuilds.length}</strong> Guild joined
              </span>
            </div>
          </div>
          <div className="square-fountain-scene">
            <span className="square-tree tree-left" />
            <span className="square-tree tree-right" />
            <span className="square-fountain">
              <i />
            </span>
            <span className="square-citizen citizen-a">N</span>
            <span className="square-citizen citizen-b">R</span>
            <span className="square-citizen citizen-c">M</span>
            <strong>Today feels lively.</strong>
          </div>
        </section>

        <section className="daily-life-grid">
          <article className="daily-visit-card">
            <p className="world-kicker">Daily visitor bonus</p>
            <h2>
              {claimed ? "Welcome back, Citizen" : "Your city is waiting"}
            </h2>
            <p>
              {claimed
                ? "Today's greeting has been recorded. Come see what changed."
                : "Check in for a warm greeting and today's civilization pulse."}
            </p>
            <button
              className="world-button primary"
              disabled={claimed}
              onClick={() => {
                if (claimDailyVisit()) setClaimed(true);
              }}
              type="button"
            >
              {claimed ? "Visited today" : "Enter the square"}
            </button>
          </article>
          <article>
            <p className="world-kicker">Region spotlight</p>
            <h2>Artisan Valley</h2>
            <p>
              Coffee Festival preparations have filled the Hearth Walk with
              roasters, potters, and flower stalls.
            </p>
            <Link className="world-text-link" href="/world/artisan-valley">
              Visit the valley
            </Link>
          </article>
          <article>
            <p className="world-kicker">Daily discovery</p>
            <h2>Meet a maker</h2>
            <p>
              Visit one merchant story and learn why that person opened their
              shop.
            </p>
            <Link className="world-text-link" href="/following">
              Find a familiar merchant
            </Link>
          </article>
        </section>

        <div className="commerce-square-columns">
          <section className="civilization-feed">
            <div className="section-heading">
              <p className="world-kicker">What happened today</p>
              <h2>Community Feed</h2>
            </div>
            {civilizationFeed.map((item) => (
              <Link
                className={`feed-item feed-${item.type}`}
                href={item.href}
                key={item.id}
              >
                <span className="feed-symbol">
                  {item.type.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <small>
                    {item.source} · {item.time}
                  </small>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Link>
            ))}
          </section>

          <aside className="square-sidebar">
            {featured ? (
              <article className="featured-merchant-card">
                <p className="world-kicker">Featured merchant</p>
                <div className="mini-merchant-scene">
                  <MerchantBuildingFacade compact shop={featured} />
                </div>
                <h2>{featured.name}</h2>
                <p>{featured.description}</p>
                <Link
                  className="world-button primary"
                  href={`/town/shop/${featured.slug}`}
                >
                  Visit merchant
                </Link>
              </article>
            ) : null}
            {guildSpotlight ? (
              <article className="square-list-card">
                <p className="world-kicker">Guild activity</p>
                <h2>{guildSpotlight.name}</h2>
                <p>{guildSpotlight.announcement}</p>
                <Link className="world-text-link" href="/guilds">
                  See guild halls
                </Link>
              </article>
            ) : null}
            {nextEvent ? (
              <article className="square-list-card">
                <p className="world-kicker">Next event</p>
                <h2>{nextEvent.name}</h2>
                <p>
                  {nextEvent.date} · {nextEvent.region}
                </p>
                <Link className="world-text-link" href="/events">
                  View schedule
                </Link>
              </article>
            ) : null}
          </aside>
        </div>

        <SocialAiGuide />
      </main>
    </SocialShell>
  );
}
