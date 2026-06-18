"use client";

import { CivilizationMetrics } from "../../components/civilization-metrics";
import { SocialShell } from "../../components/social-shell";
import { guilds } from "../../lib/social-civilization";
import { useSocialState } from "../../lib/social-state";

export default function GuildsPage() {
  const { state, toggleList } = useSocialState();
  return (
    <SocialShell>
      <main className="social-page">
        <CivilizationMetrics />
        <header className="social-page-header">
          <p className="world-kicker">Community halls</p>
          <h1>Guilds give commerce a home</h1>
          <p>
            Merchant and citizen communities share knowledge, announcements,
            regional identity, and future festivals.
          </p>
        </header>
        <section className="guild-ranking">
          <p className="world-kicker">Civilization rankings</p>
          <h2>Guild reputation</h2>
          <div>
            {guilds.map((guild) => (
              <span key={guild.id}>
                <strong>#{guild.rank}</strong>
                <em>{guild.name}</em>
                <small>{guild.reputation} reputation</small>
              </span>
            ))}
          </div>
        </section>
        <section className="guild-grid">
          {guilds.map((guild) => {
            const joined = state.joinedGuilds.includes(guild.id);
            return (
              <article
                className={`guild-card guild-${guild.palette}`}
                key={guild.id}
              >
                <div className="guild-crest">
                  <span>{guild.name.slice(0, 1)}</span>
                </div>
                <p className="world-kicker">{guild.type}</p>
                <h2>{guild.name}</h2>
                <strong>{guild.hall}</strong>
                <dl>
                  <div>
                    <dt>Members</dt>
                    <dd>{guild.members}</dd>
                  </div>
                  <div>
                    <dt>Reputation</dt>
                    <dd>{guild.reputation}</dd>
                  </div>
                  <div>
                    <dt>Rank</dt>
                    <dd>#{guild.rank}</dd>
                  </div>
                </dl>
                <blockquote>{guild.announcement}</blockquote>
                <button
                  className={
                    joined
                      ? "relationship-button active"
                      : "relationship-button"
                  }
                  onClick={() => toggleList("joinedGuilds", guild.id)}
                  type="button"
                >
                  {joined ? "Leave guild" : "Join guild"}
                </button>
              </article>
            );
          })}
        </section>
        <section className="future-guild-strip">
          <strong>Future guild life</strong>
          <span>Guild markets</span>
          <span>Guild events</span>
          <span>Commerce festivals</span>
          <span>Shared merchant halls</span>
        </section>
      </main>
    </SocialShell>
  );
}
