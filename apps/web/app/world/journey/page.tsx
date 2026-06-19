"use client";

import Link from "next/link";
import { SocialShell } from "../../../components/social-shell";
import { getRegionStory, merchantJournals } from "../../../lib/merchant-soul";
import { useMerchantMemory, useSocialState } from "../../../lib/social-state";

export default function JourneyPage() {
  const { memory } = useMerchantMemory();
  const { state } = useSocialState();
  const firstShop = memory.firstShopVisited ?? "artisan-coffee-house";
  const favorite = memory.favoriteMerchant ?? state.favoriteMerchants[0];
  const regionStory = getRegionStory(
    (memory.mostVisitedRegion ?? "merchant-city")
      .toLowerCase()
      .replace(/\s+/g, "-"),
  );
  const followedJournals = merchantJournals.filter((entry) =>
    memory.storyFollowing.includes(entry.merchantSlug),
  );

  return (
    <SocialShell>
      <main className="social-page journey-page">
        <section className="social-page-header">
          <p className="world-kicker">Your Journey</p>
          <h1>The world remembers small beginnings</h1>
          <p>
            A local memory of the merchants, places, and moments that made
            Prontera feel less like a site and more like somewhere you returned.
          </p>
        </section>

        <section className="journey-memory-grid">
          <article>
            <span>First shop visited</span>
            <h2>{label(firstShop)}</h2>
            <p>
              The first storefront matters because it becomes the doorway into
              the rest of the city.
            </p>
            <Link href={`/town/shop/${firstShop}`}>Return to that memory</Link>
          </article>
          <article>
            <span>Favorite merchant</span>
            <h2>{favorite ? label(favorite) : "Not chosen yet"}</h2>
            <p>
              Favorites are the beginning of emotional attachment: a person you
              want to check on before you search.
            </p>
            {favorite ? (
              <Link href={`/town/shop/${favorite}`}>Visit again</Link>
            ) : null}
          </article>
          <article>
            <span>Most visited city</span>
            <h2>{memory.mostVisitedCity ?? "Merchant City"}</h2>
            <p>{regionStory.memory}</p>
            <Link href="/town/merchant-city">Walk the city</Link>
          </article>
          <article>
            <span>Most visited region</span>
            <h2>{memory.mostVisitedRegion ?? "Merchant City"}</h2>
            <p>{regionStory.localSaying}</p>
            <Link href={`/world/${regionStory.slug}`}>Read its story</Link>
          </article>
        </section>

        <section className="journey-timeline">
          <div className="section-heading">
            <p className="world-kicker">Memory timeline</p>
            <h2>Your early footsteps</h2>
          </div>
          <div>
            <article>
              <span>First visit</span>
              <strong>{label(firstShop)}</strong>
              <p>
                {memory.firstShopVisitedAt
                  ? new Date(memory.firstShopVisitedAt).toLocaleDateString()
                  : "Waiting for your first recorded shop visit."}
              </p>
            </article>
            <article>
              <span>Story following</span>
              <strong>{memory.storyFollowing.length} merchant stories</strong>
              <p>These are the people you chose to remember.</p>
            </article>
            <article>
              <span>NPC conversations</span>
              <strong>{memory.npcConversationCount}</strong>
              <p>Contextual greetings will grow from this foundation.</p>
            </article>
            <article>
              <span>First purchase</span>
              <strong>{memory.firstPurchase ?? "Not recorded yet"}</strong>
              <p>Commerce memories stay empty until the user chooses to buy.</p>
            </article>
          </div>
        </section>

        <section className="journey-journal-strip">
          <div className="section-heading with-action">
            <div>
              <p className="world-kicker">Stories you follow</p>
              <h2>Merchant journal notes</h2>
            </div>
            <Link className="world-text-link" href="/commerce-square">
              Back to Commerce Square
            </Link>
          </div>
          <div>
            {(followedJournals.length
              ? followedJournals
              : merchantJournals.slice(0, 3)
            ).map((entry) => (
              <Link href={entry.href} key={entry.id}>
                <small>
                  {entry.merchantName} · {entry.type} · {entry.time}
                </small>
                <strong>{entry.title}</strong>
                <p>{entry.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SocialShell>
  );
}

function label(slug: string) {
  return slug
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
