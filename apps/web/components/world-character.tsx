type CharacterDirection = "north" | "south" | "east" | "west";

export type WorldCharacterIdentity = {
  name: string;
  class: string;
  sprite: string;
};

export function WorldCharacter({
  character,
  direction = "south",
  moving = false,
  compact = false,
}: {
  character: WorldCharacterIdentity;
  direction?: CharacterDirection;
  moving?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      aria-label={`${character.name}, ${character.class}`}
      className={`world-character sprite-${character.sprite} facing-${direction} ${
        moving ? "is-moving" : ""
      } ${compact ? "is-compact" : ""}`}
      role="img"
    >
      <span className="character-ground-shadow" />
      <span className="character-legs">
        <span />
        <span />
      </span>
      <span className="character-torso">
        <span className="character-satchel" />
      </span>
      <span className="character-head">
        <span className="character-hair" />
        <span className="character-face">
          <i />
          <i />
        </span>
        <span className="character-hat" />
      </span>
    </span>
  );
}
