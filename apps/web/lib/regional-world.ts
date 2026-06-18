import type { WorldMap, WorldShop } from "./api";

export type RegionSlug =
  | "merchant-city"
  | "harbor-kingdom"
  | "tech-republic"
  | "artisan-valley"
  | "creator-island"
  | "industrial-district";

export type RegionalLeader = {
  name: string;
  title: string;
  portrait: string;
  greeting: string;
  backstory: string;
  lore: string;
  questHook: string;
};

export type CommerceRegion = {
  slug: RegionSlug;
  name: string;
  shortName: string;
  theme: string;
  description: string;
  economy: string[];
  specialties: string[];
  architecture: string;
  climate: string;
  palette: string;
  mapPosition: { x: number; y: number };
  population: number;
  activityLabel: string;
  activityValue: number;
  status: "online" | "preview";
  reputation: number;
  leader: RegionalLeader;
};

export type RegionalWorldStats = {
  activeMerchants: number;
  liveStores: number;
  productsListed: number;
  transactions: number;
  visitors: number;
  regionsOnline: number;
};

export const commerceRegions: CommerceRegion[] = [
  {
    slug: "merchant-city",
    name: "Merchant City",
    shortName: "Capital",
    theme: "Commerce Capital",
    description:
      "The welcoming starting city where merchant roads, founder stories, live shops, and Warp Gates meet.",
    economy: ["General commerce", "Founder stores", "Live retail"],
    specialties: ["Everyday goods", "Merchant services", "City markets"],
    architecture: "Warm guild halls, tiled shops, banners, and garden plazas",
    climate: "Green central trade basin",
    palette: "emerald",
    mapPosition: { x: 48, y: 48 },
    population: 1842,
    activityLabel: "Market visits today",
    activityValue: 386,
    status: "online",
    reputation: 82,
    leader: {
      name: "Mayor Alden",
      title: "Steward of Merchant City",
      portrait: "emerald-mayor",
      greeting: "Welcome. Every road in Merchant City begins with a person.",
      backstory:
        "Alden began as a ledger clerk and earned the city seal by helping independent merchants share roads, stages, and opportunities.",
      lore: "The first Commerce Gate was raised beside the central fountain.",
      questHook: "Future hook: restore the old founder banners.",
    },
  },
  {
    slug: "harbor-kingdom",
    name: "Harbor Kingdom",
    shortName: "Harbor",
    theme: "Logistics & Global Trade",
    description:
      "A bright maritime region of cargo guilds, trade piers, import houses, and merchants who keep the world moving.",
    economy: ["Shipping", "Imports", "Exports", "Logistics"],
    specialties: ["Cargo tools", "Trade supplies", "Regional goods"],
    architecture: "Blue-roofed warehouses, lighthouse gates, and market piers",
    climate: "Salt air and steady trade winds",
    palette: "harbor",
    mapPosition: { x: 17, y: 58 },
    population: 2413,
    activityLabel: "Active ships today",
    activityValue: 127,
    status: "online",
    reputation: 68,
    leader: {
      name: "Captain Marina",
      title: "Harbor Crown Navigator",
      portrait: "tidecrest-captain",
      greeting: "The tide is favorable. Let us find where your trade can go.",
      backstory:
        "Marina unified the small shipping crews under a fair harbor charter that protects both merchants and dock workers.",
      lore: "Blue signal lanterns mark every safe trade route after sunset.",
      questHook: "Future hook: chart a missing trade vessel.",
    },
  },
  {
    slug: "tech-republic",
    name: "Tech Republic",
    shortName: "Tech",
    theme: "Technology & Innovation",
    description:
      "An energetic republic of electronics merchants, inventors, repair studios, and glowing demonstration halls.",
    economy: ["Electronics", "Innovation", "Software", "Repair"],
    specialties: ["Keyboards", "Devices", "Digital tools"],
    architecture: "Copper towers, glass workshops, and softly glowing circuits",
    climate: "Cool uplands powered by clean sky turbines",
    palette: "tech",
    mapPosition: { x: 76, y: 28 },
    population: 1976,
    activityLabel: "Prototypes demonstrated",
    activityValue: 94,
    status: "online",
    reputation: 61,
    leader: {
      name: "Professor Orion",
      title: "First Inventor",
      portrait: "starcoil-professor",
      greeting: "Curiosity is our finest power source. Come see what is new.",
      backstory:
        "Orion opened the Republic's laboratories to working merchants so useful inventions would not remain trapped behind academy doors.",
      lore: "The Republic rings a copper bell whenever an invention ships.",
      questHook: "Future hook: test a merchant delivery automaton.",
    },
  },
  {
    slug: "artisan-valley",
    name: "Artisan Valley",
    shortName: "Artisan",
    theme: "Craft, Coffee & Food",
    description:
      "A terraced valley where makers roast, bake, carve, stitch, and tell the stories behind every handmade good.",
    economy: ["Crafts", "Coffee", "Food", "Handmade goods"],
    specialties: ["Small-batch goods", "Roasted coffee", "Original craft"],
    architecture: "Timber workshops, garden cafés, mills, and flower bridges",
    climate: "Mild valley mornings with golden afternoon light",
    palette: "artisan",
    mapPosition: { x: 66, y: 72 },
    population: 1528,
    activityLabel: "Workshops open",
    activityValue: 73,
    status: "online",
    reputation: 74,
    leader: {
      name: "Master Luna",
      title: "Keeper of the Makers' Hearth",
      portrait: "coppercup-merchant",
      greeting: "Stay for a cup. Good work deserves time and a story.",
      backstory:
        "Luna grew a single roasting room into a valley cooperative where makers share tools while preserving their own signatures.",
      lore: "Every workshop places one handmade tile on the Hearth Walk.",
      questHook: "Future hook: collect stories for the seasonal maker fair.",
    },
  },
  {
    slug: "creator-island",
    name: "Creator Island",
    shortName: "Creator",
    theme: "Media, Education & Design",
    description:
      "A breezy island of studios, classrooms, stages, and digital shops where ideas become useful creative businesses.",
    economy: ["Digital creators", "Education", "Media", "Design"],
    specialties: ["Courses", "Design assets", "Creator services"],
    architecture:
      "White studios, colorful sails, amphitheaters, and sky bridges",
    climate: "Bright sea light and gentle island winds",
    palette: "creator",
    mapPosition: { x: 88, y: 57 },
    population: 1204,
    activityLabel: "Studios streaming",
    activityValue: 58,
    status: "online",
    reputation: 55,
    leader: {
      name: "Nova",
      title: "Island Creative Director",
      portrait: "blueink-creator",
      greeting: "Bring the unfinished idea. We will help it find an audience.",
      backstory:
        "Nova transformed abandoned signal towers into shared studios where educators, designers, and performers can build sustainably.",
      lore: "The island's sails change color when a new creator publishes.",
      questHook: "Future hook: prepare the lantern broadcast festival.",
    },
  },
  {
    slug: "industrial-district",
    name: "Industrial District",
    shortName: "Industrial",
    theme: "Factories & B2B Commerce",
    description:
      "A disciplined production region where machinery suppliers, factories, wholesalers, and procurement teams build at scale.",
    economy: ["Factories", "Machinery", "Wholesale", "B2B commerce"],
    specialties: ["Industrial tools", "Bulk supply", "Production services"],
    architecture: "Brick halls, clean foundries, rail markets, and iron gates",
    climate: "Dry plateau with clear working days",
    palette: "industrial",
    mapPosition: { x: 31, y: 25 },
    population: 1688,
    activityLabel: "Production lines active",
    activityValue: 112,
    status: "online",
    reputation: 58,
    leader: {
      name: "Chief Forge",
      title: "District Works Steward",
      portrait: "ironcrest-forge",
      greeting: "Build carefully, trade fairly, and make every part count.",
      backstory:
        "Forge introduced transparent production ledgers so small businesses could work confidently with large workshops.",
      lore: "The district whistle sounds only for completed work, never speed.",
      questHook: "Future hook: reopen the community fabrication hall.",
    },
  },
];

export const lockedFutureRegions = [
  { name: "Greenhouse Reach", hint: "Agriculture & sustainable goods" },
  { name: "Sky Ledger Peaks", hint: "Finance & merchant services" },
  { name: "Moonlight Arcade", hint: "Entertainment & hobby commerce" },
];

export function getCommerceRegion(slug: string) {
  return commerceRegions.find((region) => region.slug === slug) ?? null;
}

export function getRegionShops(region: CommerceRegion, shops: WorldShop[]) {
  const matches = shops.filter((shop) => {
    const text =
      `${shop.name} ${shop.category} ${shop.district.category}`.toLowerCase();
    return region.economy.some((keyword) =>
      text.includes(keyword.toLowerCase().replace(" commerce", "")),
    );
  });

  if (region.slug === "merchant-city") return shops;
  if (matches.length) return matches;

  const fallback: Record<RegionSlug, string[]> = {
    "merchant-city": [],
    "harbor-kingdom": ["harbor", "supply", "logistics"],
    "tech-republic": ["tech", "keyboard", "electronics"],
    "artisan-valley": ["artisan", "coffee", "food", "craft"],
    "creator-island": ["creator", "design", "media", "education"],
    "industrial-district": ["wholesale", "industrial", "machinery"],
  };

  return shops.filter((shop) =>
    fallback[region.slug].some((term) =>
      `${shop.name} ${shop.category}`.toLowerCase().includes(term),
    ),
  );
}

export function getRegionalWorldStats(
  world: WorldMap | null,
  visitorPulse = 0,
): RegionalWorldStats {
  const shops = world?.shops ?? [];
  const products = shops.reduce(
    (total, shop) => total + shop.featuredProducts.length,
    0,
  );

  return {
    activeMerchants: 8640 + shops.length,
    liveStores: (world?.totals.live ?? 0) + 142,
    productsListed: 38200 + products,
    transactions: 12580 + shops.length * 7,
    visitors: 29640 + visitorPulse,
    regionsOnline: commerceRegions.filter(
      (region) => region.status === "online",
    ).length,
  };
}
