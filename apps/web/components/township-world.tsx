"use client";

import { useMemo, useState } from "react";
import {
  buildAiMerchantContext,
  respondInMockMode,
} from "../lib/ai-merchant";
import type { CommerceGate, WorldMap, WorldShop } from "../lib/api";
import { getBuyerCharacter } from "../lib/buyer-world";
import {
  cityAmbientLines,
  getMerchantIdentity,
  merchantCityCitizens,
  townCivilianNpcs,
} from "../lib/living-world";
import { getMerchantSoul } from "../lib/merchant-soul";
import { AiMerchantWidget } from "./ai-merchant-widget";
import { MerchantBuildingFacade } from "./merchant-building-facade";
import { WorldCharacter } from "./world-character";

type TownshipBuildingType =
  | "town-hall"
  | "market"
  | "harbor"
  | "guild"
  | "founder-hall"
  | "shop";

type TownshipBuilding = {
  id: string;
  label: string;
  type: TownshipBuildingType;
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
  description: string;
  shop?: WorldShop;
};

type DialogAction = "talk" | "browse" | "recommend" | "story";

const civicBuildings: TownshipBuilding[] = [
  {
    id: "town-hall",
    label: "Town Hall",
    type: "town-hall",
    x: 48,
    y: 21,
    size: "lg",
    description:
      "The civic heart of Merchant City, where founder records and city signals are watched.",
  },
  {
    id: "market",
    label: "Market",
    type: "market",
    x: 36,
    y: 45,
    size: "md",
    description:
      "A bright market square where commerce tasks, daily missions, and trending goods appear.",
  },
  {
    id: "harbor",
    label: "Harbor",
    type: "harbor",
    x: 19,
    y: 72,
    size: "md",
    description:
      "The shipping edge of the city. Harbor messages, arrivals, and trade routes gather here.",
  },
  {
    id: "guild",
    label: "Guild Hall",
    type: "guild",
    x: 63,
    y: 48,
    size: "md",
    description:
      "The merchant guild coordinates quests, reputation, and community trust rituals.",
  },
  {
    id: "founder-hall",
    label: "Founder Hall",
    type: "founder-hall",
    x: 77,
    y: 70,
    size: "lg",
    description:
      "A permanent landmark honoring founder merchants, alpha contributors, and early civic memory.",
  },
];

const shopSlots = [
  { x: 24, y: 35 },
  { x: 72, y: 31 },
  { x: 30, y: 63 },
  { x: 55, y: 73 },
  { x: 84, y: 50 },
] as const;

export function TownshipWorld({
  world,
  gates,
  error,
}: {
  world: WorldMap | null;
  gates: CommerceGate[];
  error: string | null;
}) {
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction>("talk");
  const founderAvatar = getBuyerCharacter("merchant");
  const shops = useMemo(
    () =>
      (world?.shops ?? []).filter((shop) => shop.city.slug === "merchant-city"),
    [world],
  );
  const buildings = useMemo<TownshipBuilding[]>(() => {
    const shopBuildings = shops.slice(0, shopSlots.length).map((shop, index) => {
      const slot = shopSlots[index] ?? shopSlots[0];
      return {
        id: `shop-${shop.slug}`,
        label: shop.signText ?? shop.name,
        type: "shop" as const,
        x: slot.x,
        y: slot.y,
        size: "md" as const,
        description:
          shop.description ??
          "A merchant building with a shopkeeper ready to greet visitors.",
        shop,
      };
    });
    return [...civicBuildings, ...shopBuildings];
  }, [shops]);

  const activeBuilding =
    buildings.find((building) => building.id === activeBuildingId) ?? null;
  const liveShops = shops.filter((shop) => shop.liveNow);
  const founderShops = shops.filter((shop) => shop.isFounderMerchant);
  const districts = world?.districts ?? [];
  const gate = gates[0];

  function selectBuilding(building: TownshipBuilding) {
    setActiveBuildingId(building.id);
    setDialogAction("talk");
  }

  return (
    <main
      className={`township-game-page ${
        activeBuilding ? "has-active-building" : ""
      }`}
    >
      <GameTopHud
        founderAvatar={founderAvatar}
        liveCount={liveShops.length}
        shopCount={shops.length}
      />

      <aside className="game-side-panel game-left-panel">
        <p className="game-panel-kicker">Quest Tracker</p>
        <h2>Founder Path</h2>
        <GameTask title="Meet 3 merchants" value={`${Math.min(shops.length, 3)}/3`} />
        <GameTask title="Check today&apos;s market" value="Ready" />
        <GameTask title="Ask an AI shopkeeper" value="Daily" />
        <div className="game-daily-missions">
          <strong>Daily Missions</strong>
          <span>Visit Market Square</span>
          <span>Read one merchant story</span>
          <span>Collect city greeting</span>
        </div>
      </aside>

      <aside className="game-side-panel game-right-panel">
        <p className="game-panel-kicker">Live Commerce</p>
        <h2>City Signals</h2>
        <GameSignal
          label="Live events"
          value={liveShops.length ? `${liveShops.length} live` : "Quiet"}
        />
        <GameSignal
          label="Merchant messages"
          value={cityAmbientLines[0] ?? "The city is waking up."}
        />
        <GameSignal
          label="Trending districts"
          value={
            districts
              .slice(0, 2)
              .map((district) => district.name)
              .join(" · ") || "Market Road"
          }
        />
        <GameSignal
          label="Warp gate"
          value={gate?.title ?? "Merchant City Gate"}
        />
      </aside>

      <section className="township-world-stage" aria-label="Merchant City game world">
        {error ? <div className="game-error-toast">{error}</div> : null}
        <div
          className={`township-camera ${
            activeBuilding ? "is-zoomed" : ""
          } active-${activeBuilding?.type ?? "none"}`}
        >
          <div className="township-ground">
            <span className="iso-tile tile-one" />
            <span className="iso-tile tile-two" />
            <span className="iso-tile tile-three" />
            <span className="iso-road road-main" />
            <span className="iso-road road-cross" />
            <span className="iso-road road-harbor" />
            <span className="iso-water" />
            <span className="iso-fountain" />
            <span className="iso-field field-one" />
            <span className="iso-field field-two" />

            {[1, 2, 3, 4, 5, 6, 7, 8].map((tree) => (
              <span className={`game-tree game-tree-${tree}`} key={tree} />
            ))}

            {buildings.map((building) => (
              <button
                aria-label={`Open ${building.label}`}
                className={`township-building building-${building.type} building-${building.size} ${
                  activeBuildingId === building.id ? "is-selected" : ""
                }`}
                key={building.id}
                onClick={() => selectBuilding(building)}
                style={{ left: `${building.x}%`, top: `${building.y}%` }}
                type="button"
              >
                {building.shop ? (
                  <MerchantBuildingFacade compact shop={building.shop} />
                ) : (
                  <CivicBuilding building={building} />
                )}
                <span className="building-label">{building.label}</span>
              </button>
            ))}

            {merchantCityCitizens.slice(0, 5).map((citizen, index) => (
              <span
                className={`game-citizen game-citizen-${index + 1}`}
                key={citizen.id}
                style={{
                  left: `${citizen.location.positionX}%`,
                  top: `${citizen.location.positionY}%`,
                }}
              >
                <WorldCharacter
                  character={{
                    name: citizen.name,
                    class: citizen.role,
                    sprite: citizen.portrait,
                  }}
                  compact
                />
                <small>{citizen.name}</small>
              </span>
            ))}

            {townCivilianNpcs.slice(0, 7).map((npc, index) => (
              <span
                className={`game-citizen game-civilian-${index + 1}`}
                key={npc.id}
                style={{
                  left: `${npc.location.positionX}%`,
                  top: `${npc.location.positionY}%`,
                }}
              >
                <WorldCharacter
                  character={{
                    name: npc.name,
                    class: npc.role,
                    sprite:
                      index % 2 === 0
                        ? "rosepath-guide"
                        : "sunbasket-shopkeeper",
                  }}
                  compact
                />
                <small>{npc.name}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <GameBottomHud />

      {activeBuilding ? (
        <BuildingDialog
          action={dialogAction}
          building={activeBuilding}
          onAction={setDialogAction}
          onClose={() => setActiveBuildingId(null)}
        />
      ) : null}
    </main>
  );
}

function GameTopHud({
  founderAvatar,
  liveCount,
  shopCount,
}: {
  founderAvatar: ReturnType<typeof getBuyerCharacter>;
  liveCount: number;
  shopCount: number;
}) {
  return (
    <header className="game-top-hud">
      <div className="founder-hud-card">
        <WorldCharacter character={founderAvatar} compact />
        <div>
          <strong>Ponrat</strong>
          <span>Founder Level 18</span>
        </div>
      </div>
      <div className="game-resource-bar">
        <ResourcePill icon="🪙" label="Gold" value="128,400" />
        <ResourcePill icon="💎" label="Gems" value="640" />
        <ResourcePill icon="⭐" label="Prestige" value={`${shopCount * 120}`} />
      </div>
      <div className="game-top-actions">
        <button type="button">🔔 {liveCount}</button>
        <button type="button">⚙</button>
      </div>
    </header>
  );
}

function ResourcePill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <span className="resource-pill">
      <i>{icon}</i>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function GameTask({ title, value }: { title: string; value: string }) {
  return (
    <article className="game-task">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function GameSignal({ label, value }: { label: string; value: string }) {
  return (
    <article className="game-signal">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function GameBottomHud() {
  return (
    <nav className="game-bottom-hud" aria-label="Game HUD">
      {["World", "Buildings", "Inventory", "Social", "AI Council", "Founder Hall"].map(
        (item) => (
          <button className={item === "World" ? "active" : ""} key={item} type="button">
            <span>{hudIcon(item)}</span>
            <strong>{item}</strong>
          </button>
        ),
      )}
    </nav>
  );
}

function hudIcon(item: string) {
  if (item === "Buildings") return "🏠";
  if (item === "Inventory") return "🎒";
  if (item === "Social") return "💬";
  if (item === "AI Council") return "✨";
  if (item === "Founder Hall") return "🏛️";
  return "🌍";
}

function CivicBuilding({ building }: { building: TownshipBuilding }) {
  return (
    <span className="civic-building">
      <i />
      <b>{buildingIcon(building.type)}</b>
      <em />
    </span>
  );
}

function buildingIcon(type: TownshipBuildingType) {
  if (type === "market") return "M";
  if (type === "harbor") return "H";
  if (type === "guild") return "G";
  if (type === "founder-hall") return "F";
  return "T";
}

function BuildingDialog({
  building,
  action,
  onAction,
  onClose,
}: {
  building: TownshipBuilding;
  action: DialogAction;
  onAction: (action: DialogAction) => void;
  onClose: () => void;
}) {
  const merchant = building.shop ? getMerchantIdentity(building.shop) : null;
  const soul = building.shop ? getMerchantSoul(building.shop) : null;
  const recommendation =
    building.shop && merchant
      ? respondInMockMode(
          buildAiMerchantContext(
            building.shop,
            merchant,
            "What do you recommend?",
            soul ?? undefined,
          ),
        )
      : null;

  return (
    <section className="building-dialog-layer" aria-label="Building interaction">
      <div className="building-dialog">
        <button className="dialog-close" onClick={onClose} type="button">
          ×
        </button>
        <div className="dialog-portrait">
          {merchant ? (
            <WorldCharacter
              character={{
                name: merchant.merchantName,
                class: merchant.merchantTitle,
                sprite: merchant.merchantAvatar,
              }}
            />
          ) : (
            <CivicBuilding building={building} />
          )}
        </div>
        <div className="dialog-main">
          <p className="game-panel-kicker">
            {building.shop ? "Merchant Dialog" : "Building Interaction"}
          </p>
          <h2>{building.label}</h2>
          <p>{building.description}</p>
          {merchant && soul ? (
            <div className="merchant-dialog-owner">
              <strong>{merchant.merchantName}</strong>
              <span>
                {soul.merchantClass} · {soul.personalityType}
              </span>
              <em>“{soul.catchPhrase}”</em>
            </div>
          ) : null}

          {building.shop && merchant ? (
            <>
              <div className="merchant-dialog-actions">
                {(["talk", "browse", "recommend", "story"] as DialogAction[]).map(
                  (item) => (
                    <button
                      className={action === item ? "active" : ""}
                      key={item}
                      onClick={() => onAction(item)}
                      type="button"
                    >
                      {actionLabel(item)}
                    </button>
                  ),
                )}
              </div>
              <div className="merchant-dialog-content">
                {action === "talk" ? (
                  <AiMerchantWidget merchant={merchant} shop={building.shop} />
                ) : null}
                {action === "browse" ? <GoodsBoard shop={building.shop} /> : null}
                {action === "recommend" ? (
                  <article className="merchant-recommendation-card">
                    <span>AI recommendation</span>
                    <p>{recommendation}</p>
                  </article>
                ) : null}
                {action === "story" && soul ? (
                  <article className="merchant-story-dialog-card">
                    <span>Merchant story</span>
                    <h3>{soul.merchantName}</h3>
                    <p>{soul.backgroundStory}</p>
                    <p>{soul.personalGoal}</p>
                  </article>
                ) : null}
              </div>
            </>
          ) : (
            <div className="civic-dialog-actions">
              <button type="button">Inspect</button>
              <button type="button">Track Quest</button>
              <button type="button">City Info</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function actionLabel(action: DialogAction) {
  if (action === "browse") return "Browse Goods";
  if (action === "recommend") return "Ask Recommendation";
  if (action === "story") return "Merchant Story";
  return "Talk";
}

function GoodsBoard({ shop }: { shop: WorldShop }) {
  return (
    <div className="goods-board">
      {(shop.featuredProducts.length
        ? shop.featuredProducts
        : [
            {
              id: "soon",
              name: "Goods arriving soon",
              slug: "soon",
              category: shop.category,
              priceCents: null,
              imageUrl: null,
            },
          ]
      ).map((product) => (
        <article key={product.id}>
          <span>{product.name.slice(0, 1)}</span>
          <div>
            <strong>{product.name}</strong>
            <small>{product.category}</small>
          </div>
          <em>
            {product.priceCents == null
              ? "Ask"
              : `$${(product.priceCents / 100).toFixed(2)}`}
          </em>
        </article>
      ))}
    </div>
  );
}
