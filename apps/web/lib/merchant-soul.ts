import type { WorldShop } from "./api";
import { getMerchantIdentity } from "./living-world";
import { commerceRegions, type RegionSlug } from "./regional-world";

export type MerchantSoul = {
  slug: string;
  journey: string;
  background: string;
  motivation: string;
  dream: string;
  challenge: string;
  memoryHook: string;
};

export type MerchantJournalEntry = {
  id: string;
  merchantSlug: string;
  merchantName: string;
  type: "Daily Note" | "Announcement" | "Personal Story" | "World Event";
  title: string;
  body: string;
  time: string;
  href: string;
};

export type RegionStory = {
  slug: RegionSlug;
  epithet: string;
  lore: string;
  memory: string;
  localSaying: string;
};

export type FounderLegacyEntry = {
  year: string;
  title: string;
  body: string;
};

export const MERCHANT_MEMORY_KEY = "prontera_merchant_memory";

export const merchantSouls: Record<string, MerchantSoul> = {
  "artisan-coffee-house": {
    slug: "artisan-coffee-house",
    journey:
      "Luna began roasting beans beside her grandfather's clay stove, learning that every cup carried a person's morning with it.",
    background:
      "She came to Merchant City with a hand grinder, three notebooks of recipes, and a stubborn belief that commerce should feel like being welcomed home.",
    motivation:
      "Luna wants tired travelers, makers, and merchants to have one gentle place where they are remembered by name.",
    dream:
      "To create the warmest coffee house in Artisan Valley and teach a new generation of small roasters how to build with care.",
    challenge:
      "Her rarest beans sell out quickly, and she refuses to grow faster than her relationships can hold.",
    memoryHook:
      "The smell of caramel and toasted cocoa near the fountain usually means Luna is testing a new roast.",
  },
  "harbor-supply-shop": {
    slug: "harbor-supply-shop",
    journey:
      "Captain Arlo spent twenty years sailing trade routes before choosing a quieter dock and helping smaller merchants ship bravely.",
    background:
      "He knows which ropes snap in rainy weather, which crates survive long crossings, and which new shopkeepers are afraid to ask basic questions.",
    motivation:
      "Arlo believes every merchant deserves to send goods across the world without feeling alone at the dock.",
    dream:
      "To build the safest small-business shipping network between Merchant City and Harbor Kingdom.",
    challenge:
      "Storm seasons make trust fragile, so Arlo teaches preparation before he sells supplies.",
    memoryHook:
      "If a bell rings twice by the canal, Arlo is probably checking cargo before sunrise.",
  },
  "tech-bazaar-keyboard-store": {
    slug: "tech-bazaar-keyboard-store",
    journey:
      "Professor Byte repaired keyboards in a tiny back room until neighbors started visiting just to hear what invention clicked next.",
    background:
      "He treats tools like companions: every switch, cable, and circuit should make work feel a little more alive.",
    motivation:
      "Byte wants independent merchants to feel confident using technology without losing their sense of wonder.",
    dream:
      "To turn Tech Republic into a place where useful inventions begin with curiosity, not intimidation.",
    challenge:
      "He has more prototypes than shelf space, and every idea asks for one more midnight experiment.",
    memoryHook:
      "A bright little hum near the eastern road usually means Byte's latest gadget is awake.",
  },
  "demo-general-store": {
    slug: "demo-general-store",
    journey:
      "Mae opened her first shelf after noticing how many neighbors forgot the small things that save a long day.",
    background:
      "Her store grew from spare twine, lunch bags, batteries, and kind reminders into Merchant City's everyday safety net.",
    motivation:
      "Mae wants commerce to feel practical, dependable, and gently human.",
    dream:
      "To become the first place citizens think of when they need something simple, useful, and honest.",
    challenge:
      "Everyday goods rarely look magical, so Mae works twice as hard to make usefulness memorable.",
    memoryHook:
      "Mae's bell has a softer sound than the others, like someone saying, 'I kept one aside for you.'",
  },
};

export const merchantJournals: MerchantJournalEntry[] = [
  {
    id: "journal-luna-morning",
    merchantSlug: "artisan-coffee-house",
    merchantName: "Luna",
    type: "Daily Note",
    title: "The first roast was quieter today",
    body:
      "I saved a small batch for visitors who like chocolate notes. If you pass the fountain, come smell the beans before they cool.",
    time: "Today",
    href: "/town/shop/artisan-coffee-house",
  },
  {
    id: "journal-arlo-weather",
    merchantSlug: "harbor-supply-shop",
    merchantName: "Captain Arlo",
    type: "Announcement",
    title: "Storm ties are back on the front shelf",
    body:
      "The western route is kind this week, but good merchants prepare before the clouds gather.",
    time: "This morning",
    href: "/town/shop/harbor-supply-shop",
  },
  {
    id: "journal-byte-curiosity",
    merchantSlug: "tech-bazaar-keyboard-store",
    merchantName: "Professor Byte",
    type: "Personal Story",
    title: "A customer taught me a new sound",
    body:
      "Someone described a keyboard as 'rain on a tiny roof.' I have been chasing that feeling all afternoon.",
    time: "Yesterday",
    href: "/town/shop/tech-bazaar-keyboard-store",
  },
  {
    id: "journal-mae-ordinary",
    merchantSlug: "demo-general-store",
    merchantName: "Mae",
    type: "Daily Note",
    title: "The useful shelf is full again",
    body:
      "Not every product needs a spotlight. Some things simply wait until the exact moment someone needs them.",
    time: "Yesterday",
    href: "/town/shop/demo-general-store",
  },
];

export const regionalStories: RegionStory[] = [
  {
    slug: "merchant-city",
    epithet: "The Capital of Commerce",
    lore:
      "Merchant City began around a fountain where small sellers promised to help each other be found.",
    memory:
      "Citizens say the first road was not paved with stone, but with introductions.",
    localSaying: "Every road begins with a person.",
  },
  {
    slug: "harbor-kingdom",
    epithet: "Gateway of Global Trade",
    lore:
      "Harbor Kingdom grew from lantern-lit docks where crews carried fragile dreams across uncertain water.",
    memory:
      "The oldest captains still touch the lighthouse wall before every important shipment.",
    localSaying: "Pack with care. Sail with courage.",
  },
  {
    slug: "tech-republic",
    epithet: "Land of Innovation",
    lore:
      "Tech Republic was founded by inventors who believed useful tools should belong to working merchants, not distant towers.",
    memory:
      "Its labs glow late because curiosity is considered a civic habit.",
    localSaying: "Ask the smaller question first.",
  },
  {
    slug: "artisan-valley",
    epithet: "Home of Makers and Creators",
    lore:
      "Artisan Valley is stitched together by roasters, makers, cooks, and craftspeople who trade stories as carefully as goods.",
    memory:
      "Visitors remember the valley by smell: coffee, bread, wet clay, and warm wood.",
    localSaying: "Made slowly means remembered longer.",
  },
  {
    slug: "creator-island",
    epithet: "Signal Home of Digital Creators",
    lore:
      "Creator Island rose around studios where teachers, designers, and media builders made knowledge feel visitable.",
    memory:
      "At sunset, the signal towers blink like friendly windows across the water.",
    localSaying: "Share the spark. Keep the craft.",
  },
  {
    slug: "industrial-district",
    epithet: "Powerhouse of Production",
    lore:
      "Industrial District carries the heavy rhythm of makers who build the machines, parts, and systems behind other merchants' dreams.",
    memory:
      "The district's old whistle marks not a shift ending, but a promise completed.",
    localSaying: "Strong work, fair hands.",
  },
];

const defaultRegionStory: RegionStory = {
  slug: "merchant-city",
  epithet: "The Capital of Commerce",
  lore:
    "Merchant City began around a fountain where small sellers promised to help each other be found.",
  memory:
    "Citizens say the first road was not paved with stone, but with introductions.",
  localSaying: "Every road begins with a person.",
};

export const founderTimeline: FounderLegacyEntry[] = [
  {
    year: "June 2026",
    title: "The first road opened",
    body:
      "Merchant City became a place where real businesses could be discovered through walking, memory, and character.",
  },
  {
    year: "Alpha Season",
    title: "Founder Merchants entered the archive",
    body:
      "Early merchants were preserved as people with stories, not only storefronts with products.",
  },
  {
    year: "Civilization Alpha",
    title: "Citizens began to belong",
    body:
      "Friends, guilds, favorites, reputation, and daily life turned return visits into a habit of care.",
  },
  {
    year: "Living World",
    title: "The city learned to remember",
    body:
      "Local memory, journals, regional lore, and contextual greetings became the emotional layer beneath commerce.",
  },
];

export const alphaContributors = [
  "Founder Merchants",
  "Founder Customers",
  "World Contributors",
  "AI Founder Council",
  "Community Leaders",
  "Early Guild Members",
];

export function getMerchantSoul(shop: WorldShop): MerchantSoul {
  const known = merchantSouls[shop.slug];
  if (known) return known;
  const identity = getMerchantIdentity(shop);
  return {
    slug: shop.slug,
    journey: `${identity.merchantName} is still writing the first chapter of ${shop.name}.`,
    background:
      identity.backstory ??
      `${shop.name} began as a small promise to serve people well.`,
    motivation:
      "To make every visitor feel that a real person stands behind the shelf.",
    dream: `To make ${shop.name} a destination people remember by feeling, not only by product.`,
    challenge:
      "The shop is still earning its place in the city, one honest visit at a time.",
    memoryHook: identity.favoriteQuote,
  };
}

export function getMerchantJournal(shopSlug: string) {
  return merchantJournals.filter((entry) => entry.merchantSlug === shopSlug);
}

export function getRegionStory(slug: string) {
  return (
    regionalStories.find((story) => story.slug === slug) ??
    defaultRegionStory
  );
}

export function regionStoryFor(regionSlug: string) {
  const region = commerceRegions.find((item) => item.slug === regionSlug);
  const story = getRegionStory(regionSlug);
  return {
    ...story,
    regionName: region?.name ?? story.epithet,
  };
}
