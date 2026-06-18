import type { CommerceRegion } from "../lib/regional-world";
import { WorldCharacter } from "./world-character";

export function RegionalLeader({ region }: { region: CommerceRegion }) {
  const { leader } = region;
  return (
    <section className={`regional-leader-card region-${region.palette}`}>
      <div className="leader-portrait-stage">
        <span className="leader-greeting">{leader.greeting}</span>
        <WorldCharacter
          character={{
            name: leader.name,
            class: leader.title,
            sprite: leader.portrait,
          }}
        />
      </div>
      <div className="leader-story">
        <p className="world-kicker">Regional leadership</p>
        <h2>{leader.name}</h2>
        <h3>{leader.title}</h3>
        <p>{leader.backstory}</p>
        <blockquote>{leader.lore}</blockquote>
        <small>{leader.questHook}</small>
      </div>
    </section>
  );
}
