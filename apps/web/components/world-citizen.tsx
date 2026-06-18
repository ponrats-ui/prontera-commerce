import type { CitizenProfile } from "../lib/living-world";
import { WorldCharacter } from "./world-character";

export function WorldCitizen({
  citizen,
  index,
}: {
  citizen: CitizenProfile;
  index: number;
}) {
  return (
    <div
      className={`world-citizen citizen-route-${citizen.route}`}
      style={
        {
          "--citizen-x": `${citizen.location.positionX}%`,
          "--citizen-y": `${citizen.location.positionY}%`,
          "--citizen-delay": `${index * 2.3}s`,
        } as React.CSSProperties
      }
    >
      <span className="citizen-speech">{citizen.greeting}</span>
      <WorldCharacter
        character={{
          name: citizen.name,
          class: citizen.role,
          sprite: citizen.portrait,
        }}
        moving={citizen.route !== "guild" && citizen.route !== "gate"}
      />
      <span className="citizen-nameplate">
        <strong>{citizen.name}</strong>
        <small>{citizen.role}</small>
      </span>
    </div>
  );
}
