"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  BUYER_AVATAR_KEY,
  getBuyerCharacter,
  type BuyerAvatarId,
} from "../lib/buyer-world";
import {
  cityAmbientLines,
  createPlayerCharacter,
  getMerchantIdentity,
  merchantCityCitizens,
  merchantCityDiscoveryMoments,
} from "../lib/living-world";
import type { WorldShop } from "../lib/api";
import { useMerchantMemory } from "../lib/social-state";
import { MerchantBuildingFacade } from "./merchant-building-facade";
import { WorldCharacter } from "./world-character";
import { WorldCitizen } from "./world-citizen";

const POSITION_KEY = "prontera_buyer_position_merchant_city";
const PLAYER_PROFILE_KEY = "prontera_player_character_profile";
const MOVE_SPEED = 18;

const shopPositions = [
  { x: 23, y: 39 },
  { x: 77, y: 28 },
  { x: 22, y: 73 },
  { x: 75, y: 72 },
] as const;

type Position = { x: number; y: number };
type Direction = "north" | "south" | "east" | "west";
type LocalPlayerProfile = {
  name: string;
  class: string;
  title: string;
  avatarId: BuyerAvatarId;
};

const defaultPlayerProfile: LocalPlayerProfile = {
  name: "Ponrat",
  class: "Merchant",
  title: "Founder Merchant",
  avatarId: "merchant",
};

const movementControls = [
  { direction: "north", key: "arrowup", label: "↑" },
  { direction: "west", key: "arrowleft", label: "←" },
  { direction: "east", key: "arrowright", label: "→" },
  { direction: "south", key: "arrowdown", label: "↓" },
] as const;

function clamp(value: number) {
  return Math.min(95, Math.max(5, value));
}

function directionFromDelta(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "west" : "east";
  return dy < 0 ? "north" : "south";
}

export function WalkableCity({ shops }: { shops: WorldShop[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<Position>({ x: 50, y: 63 });
  const pressedKeys = useRef(new Set<string>());
  const destinationRef = useRef<Position | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const [position, setPosition] = useState<Position>(positionRef.current);
  const [direction, setDirection] = useState<Direction>("south");
  const [avatarId, setAvatarId] = useState<BuyerAvatarId>("merchant");
  const [playerProfile, setPlayerProfile] =
    useState<LocalPlayerProfile>(defaultPlayerProfile);
  const [moving, setMoving] = useState(false);
  const { memory, rememberNpcConversation } = useMerchantMemory();

  const updatePosition = useCallback((next: Position) => {
    const safe = { x: clamp(next.x), y: clamp(next.y) };
    positionRef.current = safe;
    setPosition(safe);
  }, []);

  useEffect(() => {
    const storedAvatar = localStorage.getItem(BUYER_AVATAR_KEY);
    const selectedAvatar = storedAvatar
      ? getBuyerCharacter(storedAvatar).id
      : defaultPlayerProfile.avatarId;
    setAvatarId(selectedAvatar);

    try {
      const storedProfile = JSON.parse(
        localStorage.getItem(PLAYER_PROFILE_KEY) ?? "null",
      ) as LocalPlayerProfile | null;
      if (storedProfile?.name && storedProfile?.class && storedProfile?.title) {
        setPlayerProfile({
          name: storedProfile.name,
          class: storedProfile.class,
          title: storedProfile.title,
          avatarId: getBuyerCharacter(storedProfile.avatarId).id,
        });
      } else {
        setPlayerProfile({ ...defaultPlayerProfile, avatarId: selectedAvatar });
      }
    } catch {
      localStorage.removeItem(PLAYER_PROFILE_KEY);
      setPlayerProfile({ ...defaultPlayerProfile, avatarId: selectedAvatar });
    }

    try {
      const stored = JSON.parse(
        localStorage.getItem(POSITION_KEY) ?? "null",
      ) as Position | null;
      if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
        updatePosition(stored);
      }
    } catch {
      localStorage.removeItem(POSITION_KEY);
    }
  }, [updatePosition]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [position]);

  useEffect(() => {
    localStorage.setItem(
      PLAYER_PROFILE_KEY,
      JSON.stringify({ ...playerProfile, avatarId }),
    );
  }, [avatarId, playerProfile]);

  useEffect(() => {
    const movementKeys = new Set([
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ]);

    function keyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      event.preventDefault();
      destinationRef.current = null;
      pressedKeys.current.add(key);
    }

    function keyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    function clearKeys() {
      pressedKeys.current.clear();
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    function animate(time: number) {
      const previous = lastFrameRef.current ?? time;
      const deltaSeconds = Math.min((time - previous) / 1000, 0.05);
      lastFrameRef.current = time;
      const keys = pressedKeys.current;
      let dx = 0;
      let dy = 0;

      if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
      if (keys.has("arrowright") || keys.has("d")) dx += 1;
      if (keys.has("arrowup") || keys.has("w")) dy -= 1;
      if (keys.has("arrowdown") || keys.has("s")) dy += 1;

      const destination = destinationRef.current;
      if (!dx && !dy && destination) {
        const remainingX = destination.x - positionRef.current.x;
        const remainingY = destination.y - positionRef.current.y;
        const distance = Math.hypot(remainingX, remainingY);
        if (distance < 0.6) {
          destinationRef.current = null;
          updatePosition(destination);
        } else {
          dx = remainingX / distance;
          dy = remainingY / distance;
        }
      }

      const isMoving = dx !== 0 || dy !== 0;
      setMoving(isMoving);
      if (isMoving) {
        const magnitude = Math.hypot(dx, dy) || 1;
        const normalizedX = dx / magnitude;
        const normalizedY = dy / magnitude;
        setDirection(directionFromDelta(normalizedX, normalizedY));
        updatePosition({
          x: positionRef.current.x + normalizedX * MOVE_SPEED * deltaSeconds,
          y: positionRef.current.y + normalizedY * MOVE_SPEED * deltaSeconds,
        });
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [updatePosition]);

  const nearbyShop = useMemo(
    () =>
      shops.slice(0, 4).find((_, index) => {
        const shopPosition = shopPositions[index];
        return (
          shopPosition &&
          Math.hypot(position.x - shopPosition.x, position.y - shopPosition.y) <
            12
        );
      }),
    [position, shops],
  );

  function walkTo(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a, button")) return;
    const bounds = mapRef.current?.getBoundingClientRect();
    if (!bounds) return;
    destinationRef.current = {
      x: clamp(((event.clientX - bounds.left) / bounds.width) * 100),
      y: clamp(((event.clientY - bounds.top) / bounds.height) * 100),
    };
  }

  function holdDirection(key: string) {
    destinationRef.current = null;
    pressedKeys.current.add(key);
  }

  function releaseDirection(key: string) {
    pressedKeys.current.delete(key);
  }

  function nudge(directionName: Direction) {
    const offsets: Record<Direction, Position> = {
      north: { x: 0, y: -3 },
      south: { x: 0, y: 3 },
      east: { x: 3, y: 0 },
      west: { x: -3, y: 0 },
    };
    const offset = offsets[directionName];
    setDirection(directionName);
    updatePosition({
      x: positionRef.current.x + offset.x,
      y: positionRef.current.y + offset.y,
    });
  }

  const character = getBuyerCharacter(avatarId);
  const player = createPlayerCharacter(
    avatarId,
    {
      positionX: position.x,
      positionY: position.y,
    },
    playerProfile,
  );

  return (
    <section className="walkable-city-section">
      <div className="walkable-city-toolbar">
        <div>
          <p className="world-kicker">2.5D living town</p>
          <h2>Walk into Merchant City</h2>
          <p>
            Follow the cobblestone road, meet shopkeepers, and step into a
            merchant building.
          </p>
        </div>
        <div className="walk-status" aria-live="polite">
          <WorldCharacter character={character} compact />
          <div>
            <strong>{player.name}</strong>
            <small>
              {nearbyShop
                ? `Near ${nearbyShop.name}`
                : `${player.class} · ${player.title}`}
            </small>
          </div>
        </div>
      </div>

      <div
        aria-label="2.5D walkable Merchant City map"
        className="city-map walkable-city-map is-2-5d"
        onClick={walkTo}
        ref={mapRef}
        role="application"
        tabIndex={0}
      >
        <div className="town-ground town-ground-one" />
        <div className="town-ground town-ground-two" />
        <div className="iso-plaza-shadow" />
        <div className="iso-path iso-path-main" />
        <div className="iso-path iso-path-cross" />
        <div className="town-road road-horizontal" />
        <div className="town-road road-vertical" />
        <div className="town-plaza" />
        <div className="town-canal" />
        <div className="town-bridge">Market Bridge</div>
        <div className="town-label north">North Market Road</div>
        <div className="town-time-card">
          <span>Morning bell</span>
          <strong>Cobblestones are warm</strong>
        </div>
        <div className="npc-memory-card">
          <span>Town memory</span>
          <strong>
            {memory.lastVisitedShop
              ? `Welcome back. ${memory.lastVisitedShop.replace(
                  /-/g,
                  " ",
                )} remembers your visit.`
              : "Welcome in. The city is ready to remember your first visit."}
          </strong>
          <button onClick={rememberNpcConversation} type="button">
            Talk to citizens
          </button>
        </div>

        <div className="town-landmark merchant-guild">
          <span className="guild-roof" />
          <strong>Merchant Guild</strong>
          <small>City Hall</small>
        </div>
        <div className="town-landmark market-fountain">
          <span />
          <strong>Wish Fountain</strong>
        </div>
        <Link className="town-landmark commerce-gate" href="/world/travel">
          <span />
          <strong>Warp Gate</strong>
        </Link>

        {[1, 2, 3, 4, 5, 6].map((tree) => (
          <span className={`town-tree tree-${tree}`} key={`tree-${tree}`}>
            <i />
          </span>
        ))}
        {[1, 2, 3, 4, 5, 6].map((flower) => (
          <span
            className={`town-flower flower-${flower}`}
            key={`flower-${flower}`}
          />
        ))}
        {[1, 2, 3, 4].map((lamp) => (
          <span className={`town-lamp lamp-${lamp}`} key={`lamp-${lamp}`} />
        ))}
        {[1, 2].map((bench) => (
          <span className={`town-bench bench-${bench}`} key={`bench-${bench}`}>
            <i />
          </span>
        ))}
        {[1, 2, 3].map((banner) => (
          <span
            className={`town-banner banner-${banner}`}
            key={`banner-${banner}`}
          >
            P
          </span>
        ))}
        <div className="market-stall stall-one">
          <span />
          <small>Flowers</small>
        </div>
        <div className="market-stall stall-two">
          <span />
          <small>Fresh Goods</small>
        </div>
        <div className="market-crowd ambience-one">
          <span />
          <span />
          <span />
        </div>
        <div className="market-crowd ambience-two">
          <span />
          <span />
        </div>
        {cityAmbientLines.map((line, index) => (
          <span
            className={`ambient-line ambient-line-${index + 1}`}
            key={line}
          >
            {line}
          </span>
        ))}
        <span className="town-bird bird-one">⌁</span>
        <span className="town-bird bird-two">⌁</span>

        {shops.slice(0, 4).map((shop, index) => {
          const merchant = getMerchantIdentity(shop);
          return (
            <div
              className={`town-shop-cluster town-shop-${index + 1}`}
              key={shop.id}
            >
              <Link
                className={`town-shop ${
                  nearbyShop?.id === shop.id ? "is-nearby" : ""
                }`}
                href={`/town/shop/${shop.slug}`}
              >
                <MerchantBuildingFacade compact shop={shop} />
              </Link>
              <div className="shopkeeper-npc">
                <span>{merchant.merchantName}</span>
                <WorldCharacter
                  character={{
                    name: merchant.merchantName,
                    class: merchant.merchantTitle,
                    sprite: merchant.merchantAvatar,
                  }}
                  compact
                />
              </div>
            </div>
          );
        })}

        {merchantCityCitizens.map((citizen, index) => (
          <WorldCitizen citizen={citizen} index={index} key={citizen.id} />
        ))}

        <div
          className="player-character"
          data-player-id={player.id}
          style={{
            left: `${player.positionX}%`,
            top: `${player.positionY}%`,
          }}
        >
          <WorldCharacter
            character={character}
            direction={direction}
            moving={moving}
          />
          <span className="player-nameplate">
            <strong>{player.name}</strong>
            <small>
              {player.class} · {player.title}
            </small>
          </span>
        </div>

        {nearbyShop ? (
          <div className="nearby-shop-prompt">
            <span>Discovered nearby</span>
            <strong>{nearbyShop.name}</strong>
            <Link href={`/town/shop/${nearbyShop.slug}`}>Enter shop</Link>
          </div>
        ) : null}

        <div className="discovery-moment-board" aria-label="City discoveries">
          {merchantCityDiscoveryMoments.map((moment) => (
            <article
              className={`discovery-moment is-${moment.tone}`}
              key={moment.id}
            >
              <span>{moment.source}</span>
              <strong>{moment.message}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="town-control-row">
        <p>
          <strong>Walk:</strong> WASD, arrow keys, tap the town, or hold the
          controls.
        </p>
        <div className="movement-pad" aria-label="Character movement controls">
          {movementControls.map(({ direction: directionName, key, label }) => (
            <button
              aria-label={`Walk ${directionName}`}
              className={`move-${directionName}`}
              key={key}
              onClick={() => nudge(directionName)}
              onPointerCancel={() => releaseDirection(key)}
              onPointerDown={() => holdDirection(key)}
              onPointerLeave={() => releaseDirection(key)}
              onPointerUp={() => releaseDirection(key)}
              type="button"
            >
              {label}
            </button>
          ))}
          <span aria-hidden="true">P</span>
        </div>
      </div>
    </section>
  );
}
