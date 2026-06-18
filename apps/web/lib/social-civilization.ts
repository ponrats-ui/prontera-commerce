import type { WorldShop } from "./api";
import { commerceRegions } from "./regional-world";

export type ReputationTier =
  | "Bronze Merchant"
  | "Silver Merchant"
  | "Gold Merchant"
  | "Master Merchant"
  | "Legendary Merchant";

export type CustomerTitle =
  | "Traveler"
  | "Citizen"
  | "Trusted Customer"
  | "Commerce Ambassador"
  | "Legend of Prontera";

export type SocialCitizen = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  region: string;
  mutualFriends: number;
  online: boolean;
};

export type Guild = {
  id: string;
  name: string;
  type:
    | "Merchant Guild"
    | "Creator Guild"
    | "Technology Guild"
    | "Logistics Guild"
    | "Artisan Guild"
    | "Regional Guild";
  hall: string;
  members: number;
  reputation: number;
  announcement: string;
  rank: number;
  palette: string;
};

export type CommerceEvent = {
  id: string;
  name: string;
  region: string;
  date: string;
  type: string;
  description: string;
  merchants: number;
  attendees: number;
  reward: string;
  palette: string;
};

export type CivilizationFeedItem = {
  id: string;
  type:
    | "announcement"
    | "opening"
    | "founder"
    | "product"
    | "world"
    | "guild"
    | "live"
    | "event";
  source: string;
  title: string;
  body: string;
  time: string;
  href: string;
};

export const SOCIAL_STATE_KEY = "prontera_social_civilization";
export const DAILY_VISIT_KEY = "prontera_daily_visit";

export const socialCitizens: SocialCitizen[] = [
  {
    id: "citizen-nari",
    name: "Nari",
    title: "Trusted Customer",
    avatar: "rosepath-guide",
    region: "Merchant City",
    mutualFriends: 4,
    online: true,
  },
  {
    id: "citizen-tomas",
    name: "Tomas",
    title: "Harbor Regular",
    avatar: "bluewake-captain",
    region: "Harbor Kingdom",
    mutualFriends: 2,
    online: true,
  },
  {
    id: "citizen-mei",
    name: "Mei",
    title: "Maker Supporter",
    avatar: "blueink-creator",
    region: "Artisan Valley",
    mutualFriends: 7,
    online: false,
  },
  {
    id: "citizen-ren",
    name: "Ren",
    title: "Commerce Ambassador",
    avatar: "greenway-explorer",
    region: "Tech Republic",
    mutualFriends: 11,
    online: true,
  },
  {
    id: "citizen-sora",
    name: "Sora",
    title: "Creator Island Citizen",
    avatar: "suntrail-adventurer",
    region: "Creator Island",
    mutualFriends: 3,
    online: false,
  },
];

export const guilds: Guild[] = [
  {
    id: "guild-central-merchants",
    name: "Central Merchant Guild",
    type: "Merchant Guild",
    hall: "Merchant City Guild Hall",
    members: 418,
    reputation: 92,
    announcement: "Founder Market welcome circle begins this Saturday.",
    rank: 1,
    palette: "emerald",
  },
  {
    id: "guild-makers-hearth",
    name: "Makers' Hearth",
    type: "Artisan Guild",
    hall: "Artisan Valley Hearth Hall",
    members: 286,
    reputation: 88,
    announcement: "Bring one unfinished piece to the open workshop.",
    rank: 2,
    palette: "artisan",
  },
  {
    id: "guild-spark-collective",
    name: "Spark Collective",
    type: "Technology Guild",
    hall: "Tech Republic Copper Lab",
    members: 241,
    reputation: 84,
    announcement: "Community repair table needs volunteer mentors.",
    rank: 3,
    palette: "tech",
  },
  {
    id: "guild-blue-route",
    name: "Blue Route League",
    type: "Logistics Guild",
    hall: "Harbor Kingdom Lighthouse Hall",
    members: 209,
    reputation: 81,
    announcement: "New small-business shipping guide is now public.",
    rank: 4,
    palette: "harbor",
  },
  {
    id: "guild-open-studio",
    name: "Open Studio Circle",
    type: "Creator Guild",
    hall: "Creator Island Signal House",
    members: 198,
    reputation: 79,
    announcement: "Creator Summit speaker nominations close tomorrow.",
    rank: 5,
    palette: "creator",
  },
  {
    id: "guild-six-roads",
    name: "Six Roads Fellowship",
    type: "Regional Guild",
    hall: "Rotating Regional Hall",
    members: 563,
    reputation: 76,
    announcement: "Region exchange visits open for all Citizens.",
    rank: 6,
    palette: "industrial",
  },
];

export const commerceEvents: CommerceEvent[] = [
  {
    id: "event-coffee-festival",
    name: "Coffee Festival",
    region: "Artisan Valley",
    date: "June 21, 2026",
    type: "Seasonal Market",
    description:
      "Roasters, bakers, and ceramic makers fill the Hearth Walk for one warm weekend.",
    merchants: 42,
    attendees: 1280,
    reward: "Valley Friend title preview",
    palette: "artisan",
  },
  {
    id: "event-tech-expo",
    name: "Tech Expo",
    region: "Tech Republic",
    date: "June 25, 2026",
    type: "Regional Expo",
    description:
      "Independent electronics merchants demonstrate practical inventions and repair skills.",
    merchants: 57,
    attendees: 1644,
    reward: "Prototype visitor badge",
    palette: "tech",
  },
  {
    id: "event-creator-summit",
    name: "Creator Summit",
    region: "Creator Island",
    date: "June 28, 2026",
    type: "Community Summit",
    description:
      "Educators, designers, and media merchants share sustainable creative business practices.",
    merchants: 38,
    attendees: 914,
    reward: "Open Studio keepsake",
    palette: "creator",
  },
  {
    id: "event-logistics-week",
    name: "Logistics Week",
    region: "Harbor Kingdom",
    date: "July 2, 2026",
    type: "Trade Week",
    description:
      "Harbor crews teach packaging, export readiness, and resilient small-business logistics.",
    merchants: 63,
    attendees: 1108,
    reward: "Blue Route visitor mark",
    palette: "harbor",
  },
  {
    id: "event-merchant-convention",
    name: "Merchant Convention",
    region: "Merchant City",
    date: "July 6, 2026",
    type: "Civilization Gathering",
    description:
      "Founder Merchants and new citizens gather around the central fountain.",
    merchants: 100,
    attendees: 2410,
    reward: "Founding season recognition",
    palette: "emerald",
  },
];

export const civilizationFeed: CivilizationFeedItem[] = [
  {
    id: "feed-coffee",
    type: "event",
    source: "Artisan Valley",
    title: "Coffee Festival preparations have begun",
    body: "Luna invited ceramic makers to share the Hearth Walk.",
    time: "12 min ago",
    href: "/events",
  },
  {
    id: "feed-opening",
    type: "opening",
    source: "Tech Republic",
    title: "A new repair bench opened",
    body: "Professor Byte is hosting free keyboard care demonstrations.",
    time: "28 min ago",
    href: "/world/tech-republic",
  },
  {
    id: "feed-founder",
    type: "founder",
    source: "Founder Hall",
    title: "Founder Merchant stories were added to the archive",
    body: "Visit the Hall to meet the early builders behind the first roads.",
    time: "1 hr ago",
    href: "/founder-hall",
  },
  {
    id: "feed-guild",
    type: "guild",
    source: "Makers' Hearth",
    title: "Open workshop announced",
    body: "Citizens may bring one unfinished piece and learn beside a maker.",
    time: "2 hrs ago",
    href: "/guilds",
  },
  {
    id: "feed-world",
    type: "world",
    source: "World Gate Network",
    title: "Harbor route activity is rising",
    body: "Captain Marina reports clear trade winds across the western sea.",
    time: "Today",
    href: "/world/harbor-kingdom",
  },
];

export const founderContributors = [
  {
    name: "Ponrat",
    role: "Founder & World Builder",
    contribution: "Established the Merchant Civilization vision",
    avatar: "emerald-mayor",
  },
  {
    name: "Luna",
    role: "Founder Merchant",
    contribution: "Built the first artisan gathering place",
    avatar: "coppercup-merchant",
  },
  {
    name: "Captain Arlo",
    role: "Founder Merchant",
    contribution: "Connected regional trade and supply stories",
    avatar: "bluewake-captain",
  },
  {
    name: "Professor Byte",
    role: "Founder Merchant",
    contribution: "Opened the first technology demonstration shop",
    avatar: "sparkgear-inventor",
  },
];

export const aiFounderCouncil = [
  { name: "Mr.P", role: "Founder Assistant", focus: "World guidance" },
  { name: "Athena", role: "Commerce Historian", focus: "Memory and strategy" },
  { name: "Forge", role: "Guild Advisor", focus: "Building communities" },
  { name: "Mercury", role: "Regional Advisor", focus: "Trade and discovery" },
  { name: "Sentinel", role: "Trust Keeper", focus: "Safety and governance" },
];

export function getMerchantTier(score: number): ReputationTier {
  if (score >= 95) return "Legendary Merchant";
  if (score >= 85) return "Master Merchant";
  if (score >= 70) return "Gold Merchant";
  if (score >= 50) return "Silver Merchant";
  return "Bronze Merchant";
}

export function merchantReputationScore(shop: WorldShop) {
  return Math.min(
    100,
    Math.round(
      42 +
        shop.rankingScore / 2 +
        (shop.isFounderMerchant ? 17 : 0) +
        (shop.liveNow ? 8 : 0) +
        (shop.isOfficialStore ? 10 : 0),
    ),
  );
}

export function getCustomerTitle(score: number): CustomerTitle {
  if (score >= 90) return "Legend of Prontera";
  if (score >= 72) return "Commerce Ambassador";
  if (score >= 48) return "Trusted Customer";
  if (score >= 20) return "Citizen";
  return "Traveler";
}

export function civilizationMetrics(merchantCount = 0) {
  return {
    population: commerceRegions.reduce(
      (total, region) => total + region.population,
      0,
    ),
    merchants: 8640 + merchantCount,
    guilds: guilds.length,
    events: commerceEvents.length,
    followers: 18420,
    friendships: 9326,
    reputationScore: 78,
    commerceActivity: 91,
  };
}
