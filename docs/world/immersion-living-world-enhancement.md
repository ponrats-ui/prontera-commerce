# Immersion & Living World Enhancement

Sprint 17A improves emotional presence across the Commerce World without adding
major economy, guild, creator, or marketplace systems.

## Goal

Make Merchant City and regional destinations feel more like places people can
inhabit and revisit.

The target user response is:

```text
This city feels alive.
```

before:

```text
I want to buy something.
```

## Implemented Foundation

### Player presence

- Visible local player character remains inside Merchant City.
- WASD, arrow keys, click-to-move, and mobile controls are supported.
- Position persists locally.
- Avatar and character profile persist locally.
- Default local identity is `Ponrat`, `Merchant`, `Founder Merchant`.

### NPC daily life

Citizens now carry lightweight daily-life intent:

- home
- current activity
- daily schedule
- destination

Examples include Luna walking between the fountain and café, Captain Arlo
patrolling the canal bridge, and the Town Guide roaming the plaza.

### Ambient world effects

Merchant City now includes additional lightweight CSS-native ambience:

- animated fountain
- moving birds
- glowing lanterns
- swaying trees and signs
- market crowd ambience
- flower clusters
- benches
- floating ambient lines
- discovery notices

No canvas, WebGL, 3D engine, or heavy rendering dependency is introduced.

### Merchant personality layer

Merchant identities now include:

- favorite quote
- merchant archetype
- backstory
- automatic welcome message

The goal is for buyers to remember people, not only stores.

### Store welcome experience

Shop interiors now begin with a visual welcome card and merchant greeting.
The merchant appears as a character in the interior scene, with shelves,
promotion board, live room entrance, AI assistant, story, quote, and reputation.

### Discovery moments

Merchant City and regional pages now expose small authored discovery moments:

- daily notices
- market announcements
- travel tips
- regional stories
- Founder Hall highlights

These are intentionally lightweight and can later evolve into governed daily
quest, event, or AI guide systems.

## Design Constraints

- No full 3D.
- No metaverse framing.
- No new database schema.
- No major new systems.
- Mobile-friendly CSS-first rendering.
- Merchant OS remains professional; buyer world remains warm and emotional.

## Future Expansion

Possible next increments:

- time-of-day ambience
- seasonal decorations
- governed daily discovery quests
- richer NPC route authoring
- persisted player names when account identity is available
- AI-generated but moderated regional notices
