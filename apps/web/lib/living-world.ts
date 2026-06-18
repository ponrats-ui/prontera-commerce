import {
  getBuyerCharacter,
  type BuyerAvatarId,
  type BuyerCharacter,
} from "./buyer-world";
import type { WorldShop } from "./api";

export type WorldPosition = {
  positionX: number;
  positionY: number;
};

export type PlayerCharacterEntity = WorldPosition & {
  id: string;
  name: string;
  class: BuyerCharacter["class"];
  avatar: string;
  title: string;
};

export type CitizenProfile = {
  id: string;
  name: string;
  role:
    | "Town Guide"
    | "Merchant Guild Master"
    | "Coffee Merchant"
    | "Harbor Captain"
    | "Tech Inventor"
    | "Warp Gate Keeper";
  portrait: string;
  greeting: string;
  location: WorldPosition;
  route: "plaza" | "guild" | "market" | "harbor" | "tech" | "gate";
};

export type MerchantIdentity = {
  merchantId: string;
  merchantName: string;
  merchantTitle: string;
  merchantStory: string;
  merchantAvatar: string;
  merchantReputation: number;
  personality: string;
  greeting: string;
};

export const merchantCityCitizens: CitizenProfile[] = [
  {
    id: "citizen-mira",
    name: "Mira",
    role: "Town Guide",
    portrait: "rosepath-guide",
    greeting: "New here? Follow the market road to meet our merchants.",
    location: { positionX: 43, positionY: 45 },
    route: "plaza",
  },
  {
    id: "citizen-cedric",
    name: "Cedric",
    role: "Merchant Guild Master",
    portrait: "brassbell-guildmaster",
    greeting: "Every fine shop begins with a brave first day.",
    location: { positionX: 18, positionY: 24 },
    route: "guild",
  },
  {
    id: "citizen-luna",
    name: "Luna",
    role: "Coffee Merchant",
    portrait: "coppercup-merchant",
    greeting: "Fresh coffee today. The first cup is always the warmest.",
    location: { positionX: 81, positionY: 38 },
    route: "market",
  },
  {
    id: "citizen-arlo",
    name: "Captain Arlo",
    role: "Harbor Captain",
    portrait: "bluewake-captain",
    greeting: "Harbor shipments have arrived right on the morning tide.",
    location: { positionX: 23, positionY: 82 },
    route: "harbor",
  },
  {
    id: "citizen-byte",
    name: "Professor Byte",
    role: "Tech Inventor",
    portrait: "sparkgear-inventor",
    greeting: "Tech Bazaar is busy today. Something clever is always humming.",
    location: { positionX: 80, positionY: 70 },
    route: "tech",
  },
  {
    id: "citizen-orin",
    name: "Orin",
    role: "Warp Gate Keeper",
    portrait: "moonkey-gatekeeper",
    greeting: "The gate is calm. New roads will open when the city is ready.",
    location: { positionX: 91, positionY: 84 },
    route: "gate",
  },
];

const merchantIdentities: Record<string, MerchantIdentity> = {
  "artisan-coffee-house": {
    merchantId: "merchant-luna",
    merchantName: "Luna",
    merchantTitle: "Coffee Roaster",
    merchantStory:
      "Luna built the coffee house around slow mornings, small-batch roasting, and conversations that turn strangers into regulars.",
    merchantAvatar: "coppercup-merchant",
    merchantReputation: 4.9,
    personality: "warm, observant, and gently enthusiastic",
    greeting: "Welcome in. The kettle is warm and I saved you a quiet table.",
  },
  "harbor-supply-shop": {
    merchantId: "merchant-arlo",
    merchantName: "Captain Arlo",
    merchantTitle: "Harbor Quartermaster",
    merchantStory:
      "Arlo spent years coordinating small harbor crews and now helps local businesses choose dependable supplies without buying more than they need.",
    merchantAvatar: "bluewake-captain",
    merchantReputation: 4.8,
    personality: "steady, practical, and reassuring",
    greeting:
      "Welcome aboard. Tell me what you need to move, pack, or protect.",
  },
  "tech-bazaar-keyboard-store": {
    merchantId: "merchant-byte",
    merchantName: "Professor Byte",
    merchantTitle: "Keyboard Inventor",
    merchantStory:
      "Professor Byte turns everyday work tools into delightful instruments, testing every switch and layout at the back workbench.",
    merchantAvatar: "sparkgear-inventor",
    merchantReputation: 4.9,
    personality: "curious, precise, and playfully technical",
    greeting: "Excellent timing. I have a new switch sound for you to hear.",
  },
  "demo-general-store": {
    merchantId: "merchant-mae",
    merchantName: "Mae",
    merchantTitle: "Neighborhood Shopkeeper",
    merchantStory:
      "Mae keeps Merchant City's everyday shelf stocked and remembers which useful little things each neighbor tends to forget.",
    merchantAvatar: "sunbasket-shopkeeper",
    merchantReputation: 4.7,
    personality: "helpful, cheerful, and straightforward",
    greeting: "Hello, traveler. If it is useful, I probably have it nearby.",
  },
};

export function createPlayerCharacter(
  avatarId: BuyerAvatarId,
  position: WorldPosition,
): PlayerCharacterEntity {
  const character = getBuyerCharacter(avatarId);
  return {
    id: `local-player-${character.id}`,
    name: character.name,
    class: character.class,
    avatar: character.sprite,
    title: character.title,
    ...position,
  };
}

export function getMerchantIdentity(shop: WorldShop): MerchantIdentity {
  const known = merchantIdentities[shop.slug];
  if (known) return known;

  const category = shop.category.toLowerCase();
  const merchantName = category.includes("coffee")
    ? "Luna"
    : category.includes("tech")
      ? "Professor Byte"
      : category.includes("harbor")
        ? "Captain Arlo"
        : "Mae";

  return {
    merchantId: `merchant-${shop.ownerId}`,
    merchantName,
    merchantTitle: `${shop.category.replace(/_/g, " ")} Merchant`,
    merchantStory:
      shop.description ??
      `${merchantName} opened ${shop.name} to share dependable products and a welcoming corner of Merchant City.`,
    merchantAvatar: "sunbasket-shopkeeper",
    merchantReputation: Math.min(5, 4.4 + shop.rankingScore / 100),
    personality: "friendly, knowledgeable, and practical",
    greeting: `Welcome to ${shop.name}. Take your time and ask me anything.`,
  };
}
