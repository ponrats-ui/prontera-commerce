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
  class: BuyerCharacter["class"] | string;
  avatar: string;
  title: string;
};

export type CitizenDailyBehavior =
  | "Walk"
  | "Pause"
  | "Look Around"
  | "Visit Buildings"
  | "Sit"
  | "Return Home";

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
  home: string;
  dailySchedule: CitizenDailyBehavior[];
  currentActivity: string;
  destination: string;
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
  favoriteQuote: string;
  merchantArchetype: string;
  backstory: string;
  welcomeMessage: string;
};

export type DiscoveryMoment = {
  id: string;
  source: string;
  message: string;
  tone: "merchant" | "notice" | "travel" | "founder";
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
    home: "Rosepath Info Kiosk",
    dailySchedule: ["Walk", "Pause", "Look Around", "Visit Buildings"],
    currentActivity: "showing newcomers the market road",
    destination: "Wish Fountain",
  },
  {
    id: "citizen-cedric",
    name: "Cedric",
    role: "Merchant Guild Master",
    portrait: "brassbell-guildmaster",
    greeting: "Every fine shop begins with a brave first day.",
    location: { positionX: 18, positionY: 24 },
    route: "guild",
    home: "Merchant Guild",
    dailySchedule: ["Pause", "Look Around", "Visit Buildings", "Return Home"],
    currentActivity: "reviewing founder applications",
    destination: "Guild Hall steps",
  },
  {
    id: "citizen-luna",
    name: "Luna",
    role: "Coffee Merchant",
    portrait: "coppercup-merchant",
    greeting: "Fresh coffee today. The first cup is always the warmest.",
    location: { positionX: 81, positionY: 38 },
    route: "market",
    home: "Artisan Coffee House",
    dailySchedule: ["Walk", "Visit Buildings", "Pause", "Return Home"],
    currentActivity: "walking between the fountain and café",
    destination: "Artisan Coffee House",
  },
  {
    id: "citizen-arlo",
    name: "Captain Arlo",
    role: "Harbor Captain",
    portrait: "bluewake-captain",
    greeting: "Harbor shipments have arrived right on the morning tide.",
    location: { positionX: 23, positionY: 82 },
    route: "harbor",
    home: "Harbor Supply Dock",
    dailySchedule: ["Walk", "Look Around", "Pause", "Return Home"],
    currentActivity: "patrolling the canal bridge",
    destination: "Market Bridge",
  },
  {
    id: "citizen-byte",
    name: "Professor Byte",
    role: "Tech Inventor",
    portrait: "sparkgear-inventor",
    greeting: "Tech Bazaar is busy today. Something clever is always humming.",
    location: { positionX: 80, positionY: 70 },
    route: "tech",
    home: "Tech Bazaar Workbench",
    dailySchedule: ["Walk", "Pause", "Look Around", "Visit Buildings"],
    currentActivity: "testing a tiny delivery automaton",
    destination: "Tech storefront row",
  },
  {
    id: "citizen-orin",
    name: "Orin",
    role: "Warp Gate Keeper",
    portrait: "moonkey-gatekeeper",
    greeting: "The gate is calm. New roads will open when the city is ready.",
    location: { positionX: 91, positionY: 84 },
    route: "gate",
    home: "Merchant City Warp Gate",
    dailySchedule: ["Pause", "Look Around", "Sit", "Return Home"],
    currentActivity: "listening for the gate chimes",
    destination: "Warp Gate arch",
  },
];

export const merchantCityDiscoveryMoments: DiscoveryMoment[] = [
  {
    id: "notice-coffee-fountain",
    source: "Daily Notice",
    message: "Luna is handing out tasting notes near the fountain before noon.",
    tone: "merchant",
  },
  {
    id: "notice-harbor-arrivals",
    source: "Market Bell",
    message: "Harbor crates arrived early. Arlo says the sturdy boxes go first.",
    tone: "notice",
  },
  {
    id: "notice-travel-tip",
    source: "Travel Tip",
    message: "The Warp Gate glows brighter when another region has new activity.",
    tone: "travel",
  },
  {
    id: "notice-founder-hall",
    source: "Founder Hall",
    message:
      "Today the monument honors the first merchants who made the roads feel safe.",
    tone: "founder",
  },
];

export const cityAmbientLines = [
  "A bell rings softly from the guild hall.",
  "Someone laughs near the flower stall.",
  "Lanterns flicker as shop signs sway.",
  "A courier waves before crossing Market Bridge.",
] as const;

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
    favoriteQuote: "Coffee tastes better when shared.",
    merchantArchetype: "Cozy Host",
    backstory:
      "Luna learned roasting from a traveling aunt and opened her shop so busy merchants would have one gentle place to pause.",
    welcomeMessage:
      "Welcome to Artisan Coffee House. I'm Luna. Can I help you find something comforting today?",
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
    favoriteQuote: "Every shipment tells a story.",
    merchantArchetype: "Reliable Quartermaster",
    backstory:
      "Arlo became trusted by remembering the small details: which dock floods, which rope frays, and which merchant needs the shipment by dawn.",
    welcomeMessage:
      "Welcome to Harbor Supply Shop. I'm Captain Arlo. What needs to arrive safely?",
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
    favoriteQuote: "Innovation begins with curiosity.",
    merchantArchetype: "Playful Inventor",
    backstory:
      "Professor Byte started by repairing keyboards for neighbors and stayed because every tool became more delightful after a curious question.",
    welcomeMessage:
      "Welcome to Tech Bazaar. I'm Professor Byte. Want to try something clever?",
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
    favoriteQuote: "A good shelf remembers what people forget.",
    merchantArchetype: "Neighborhood Keeper",
    backstory:
      "Mae built the general store around practical kindness: spare cords, extra bags, useful bundles, and a greeting for every regular.",
    welcomeMessage:
      "Welcome to the General Store. I'm Mae. Tell me what you almost forgot today.",
  },
};

export function createPlayerCharacter(
  avatarId: BuyerAvatarId,
  position: WorldPosition,
  profile?: Partial<Pick<PlayerCharacterEntity, "name" | "class" | "title">>,
): PlayerCharacterEntity {
  const character = getBuyerCharacter(avatarId);
  return {
    id: `local-player-${character.id}`,
    name: profile?.name ?? character.name,
    class: profile?.class ?? character.class,
    avatar: character.sprite,
    title: profile?.title ?? character.title,
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
    favoriteQuote: "A trustworthy shop begins with a real welcome.",
    merchantArchetype: "Local Specialist",
    backstory:
      shop.description ??
      `${merchantName} is shaping ${shop.name} into a memorable destination for people who care about dependable commerce.`,
    welcomeMessage: `Welcome to ${shop.name}. I'm ${merchantName}. Can I help you discover what belongs on your shelf today?`,
  };
}
