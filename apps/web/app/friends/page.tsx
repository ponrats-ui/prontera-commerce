"use client";

import { SocialShell } from "../../components/social-shell";
import { WorldCharacter } from "../../components/world-character";
import { socialCitizens } from "../../lib/social-civilization";
import { useSocialState } from "../../lib/social-state";

export default function FriendsPage() {
  const { state, toggleList, acceptFriend } = useSocialState();
  return (
    <SocialShell>
      <main className="social-page">
        <header className="social-page-header">
          <p className="world-kicker">Commerce friends</p>
          <h1>People make the roads familiar</h1>
          <p>
            Build a small circle of citizens who share merchant discoveries,
            guild activities, and regional visits.
          </p>
        </header>

        {state.requests.length ? (
          <section className="friend-request-panel">
            <div>
              <p className="world-kicker">Friend request</p>
              <h2>Someone wants to explore together</h2>
            </div>
            {socialCitizens
              .filter((citizen) => state.requests.includes(citizen.id))
              .map((citizen) => (
                <article key={citizen.id}>
                  <WorldCharacter
                    character={{
                      name: citizen.name,
                      class: citizen.title,
                      sprite: citizen.avatar,
                    }}
                    compact
                  />
                  <div>
                    <strong>{citizen.name}</strong>
                    <small>
                      {citizen.title} · {citizen.region}
                    </small>
                  </div>
                  <button
                    onClick={() => acceptFriend(citizen.id)}
                    type="button"
                  >
                    Accept
                  </button>
                </article>
              ))}
          </section>
        ) : null}

        <section className="social-card-grid">
          {socialCitizens.map((citizen) => {
            const isFriend = state.friends.includes(citizen.id);
            return (
              <article className="citizen-social-card" key={citizen.id}>
                <span
                  className={`online-signal ${citizen.online ? "online" : ""}`}
                />
                <WorldCharacter
                  character={{
                    name: citizen.name,
                    class: citizen.title,
                    sprite: citizen.avatar,
                  }}
                />
                <h2>{citizen.name}</h2>
                <strong>{citizen.title}</strong>
                <p>{citizen.region}</p>
                <small>{citizen.mutualFriends} mutual friends</small>
                <button
                  className={
                    isFriend
                      ? "relationship-button active"
                      : "relationship-button"
                  }
                  onClick={() => toggleList("friends", citizen.id)}
                  type="button"
                >
                  {isFriend ? "Remove friend" : "Add friend"}
                </button>
              </article>
            );
          })}
        </section>

        <section className="messenger-preview">
          <div>
            <p className="world-kicker">Commerce Messenger</p>
            <h2>Recent conversations</h2>
            <p>
              Lightweight conversation history today; merchant CRM, translation,
              and AI-assisted messaging remain future layers.
            </p>
          </div>
          <div className="message-list">
            {state.messages.map((message) => (
              <article key={message.id}>
                <span>{message.person.slice(0, 1)}</span>
                <div>
                  <strong>{message.person}</strong>
                  <p>{message.preview}</p>
                </div>
                <small>{message.time}</small>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SocialShell>
  );
}
