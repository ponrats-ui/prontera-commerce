"use client";

import { SocialShell } from "../../components/social-shell";
import { commerceEvents } from "../../lib/social-civilization";
import { useSocialState } from "../../lib/social-state";

export default function EventsPage() {
  const { state, toggleList } = useSocialState();
  return (
    <SocialShell>
      <main className="social-page">
        <header className="social-page-header">
          <p className="world-kicker">Commerce events</p>
          <h1>The world gathers for more than transactions</h1>
          <p>
            Festivals, expos, conventions, and regional weeks help citizens meet
            merchants through shared experience.
          </p>
        </header>
        <section className="event-calendar-strip">
          {commerceEvents.map((event) => (
            <span key={event.id}>
              <strong>{event.date.split(",")[0]}</strong>
              <small>{event.name}</small>
            </span>
          ))}
        </section>
        <section className="event-grid">
          {commerceEvents.map((event) => {
            const attending = state.attendingEvents.includes(event.id);
            return (
              <article
                className={`event-card event-${event.palette}`}
                key={event.id}
              >
                <div className="event-illustration">
                  <span>{event.name.slice(0, 1)}</span>
                  <i />
                  <i />
                </div>
                <div>
                  <p className="world-kicker">{event.type}</p>
                  <h2>{event.name}</h2>
                  <strong>
                    {event.date} · {event.region}
                  </strong>
                  <p>{event.description}</p>
                  <dl>
                    <div>
                      <dt>Merchants</dt>
                      <dd>{event.merchants}</dd>
                    </div>
                    <div>
                      <dt>Expected citizens</dt>
                      <dd>{event.attendees.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Recognition</dt>
                      <dd>{event.reward}</dd>
                    </div>
                  </dl>
                  <button
                    className={
                      attending
                        ? "relationship-button active"
                        : "relationship-button"
                    }
                    onClick={() => toggleList("attendingEvents", event.id)}
                    type="button"
                  >
                    {attending ? "Attending" : "Attend event"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
        <p className="event-foundation-note">
          Attendance and recognition are local Sprint 17 foundations. Rewards,
          sponsorship, ticketing, and merchant participation workflows remain
          future governed systems.
        </p>
      </main>
    </SocialShell>
  );
}
