import Link from "next/link";
import { SocialShell } from "../../components/social-shell";
import { WorldCharacter } from "../../components/world-character";
import {
  aiFounderCouncil,
  founderContributors,
} from "../../lib/social-civilization";

export default function FounderHallPage() {
  return (
    <SocialShell>
      <main className="social-page founder-hall-page">
        <section className="founder-hall-hero">
          <div>
            <p className="world-kicker">Permanent civic landmark</p>
            <h1>Founder Hall</h1>
            <p>
              A place of memory for the merchants, customers, contributors, AI
              partners, and community leaders who built the first roads.
            </p>
            <Link className="world-button primary" href="/discover/founders">
              Visit Founder Merchants
            </Link>
          </div>
          <div className="founder-hall-building">
            <span className="hall-dome">F</span>
            <span className="hall-column column-one" />
            <span className="hall-column column-two" />
            <span className="hall-column column-three" />
            <span className="hall-column column-four" />
            <strong>Founded 2026</strong>
          </div>
        </section>

        <section className="founder-gallery">
          <div className="section-heading">
            <p className="world-kicker">Early builders</p>
            <h2>Founder Contributors</h2>
          </div>
          <div>
            {founderContributors.map((founder) => (
              <article key={founder.name}>
                <WorldCharacter
                  character={{
                    name: founder.name,
                    class: founder.role,
                    sprite: founder.avatar,
                  }}
                />
                <h3>{founder.name}</h3>
                <strong>{founder.role}</strong>
                <p>{founder.contribution}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="founder-council-section">
          <div>
            <p className="world-kicker">AI Founder Council</p>
            <h2>Advisors of the civilization</h2>
            <p>
              Fictional platform characters that guide, remember, and advise
              while preserving Founder authority and human approval.
            </p>
          </div>
          <div className="council-table">
            <span className="council-center">P</span>
            {aiFounderCouncil.map((member, index) => (
              <article
                className={`council-seat seat-${index + 1}`}
                key={member.name}
              >
                <span>{member.name.slice(0, 1)}</span>
                <strong>{member.name}</strong>
                <small>{member.role}</small>
                <em>{member.focus}</em>
              </article>
            ))}
          </div>
        </section>

        <section className="hall-recognition-wall">
          <h2>What the Hall remembers</h2>
          <div>
            <span>Founder Merchants</span>
            <span>Founder Customers</span>
            <span>Community Leaders</span>
            <span>World Contributors</span>
            <span>Trusted Guilds</span>
          </div>
        </section>
      </main>
    </SocialShell>
  );
}
