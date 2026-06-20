import type { WorldShop } from "./api";
import { getMerchantIdentity } from "./living-world";
import { commerceRegions, type RegionSlug } from "./regional-world";

export type MerchantSoul = {
  slug: string;
  merchantName: string;
  merchantClass: string;
  personalityType: string;
  communicationStyle: string;
  backgroundStory: string;
  personalGoal: string;
  favoriteProduct: string;
  catchPhrase: string;
  region: string;
  reputationLevel: string;
  journey: string;
  background: string;
  motivation: string;
  dream: string;
  challenge: string;
  memoryHook: string;
  whyTheyStarted: string;
  founderHistory: string;
  milestones: MerchantMilestone[];
  communityContributions: CommunityContribution[];
};

export type MerchantMilestone = {
  date: string;
  title: string;
  body: string;
};

export type CommunityContribution = {
  title: string;
  body: string;
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
  history: string;
  identity: string;
  culture: string;
  tradeSpecialty: string;
  importantNPCs: string[];
};

export type FounderLegacyEntry = {
  year: string;
  title: string;
  body: string;
};

export type FounderMuseumExhibit = {
  id: string;
  era: string;
  title: string;
  caption: string;
};

export type AmbientStoryCard = {
  id: string;
  type:
    | "Merchant Note"
    | "Town Poster"
    | "Guild Notice"
    | "Festival Announcement"
    | "Travel Tip"
    | "Founder Quote"
    | "World News";
  title: string;
  body: string;
};

export const MERCHANT_MEMORY_KEY = "prontera_merchant_memory";

export const merchantSouls: Record<string, MerchantSoul> = {
  "artisan-coffee-house": {
    slug: "artisan-coffee-house",
    merchantName: "Luna",
    merchantClass: "Coffee Artisan",
    personalityType: "Warm",
    communicationStyle: "Friendly",
    backgroundStory:
      "Luna started roasting coffee with her grandfather and still treats each cup like a small welcome home.",
    personalGoal:
      "Create the most welcoming coffee house in Artisan Valley.",
    favoriteProduct: "Artisan House Blend",
    catchPhrase: "Every cup tells a story.",
    region: "Artisan Valley",
    reputationLevel: "Gold Merchant",
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
    whyTheyStarted:
      "She wanted travelers to find a quiet table before they found a checkout button.",
    founderHistory:
      "One of the first merchants to make Prontera's shop interiors feel like places with memory.",
    milestones: [
      {
        date: "First Roast",
        title: "Grandfather's clay stove",
        body:
          "Luna learned patience from slow heat, handwritten roast notes, and neighbors who lingered.",
      },
      {
        date: "Merchant City Alpha",
        title: "The first quiet table",
        body:
          "Her coffee house became an early example of commerce as hospitality.",
      },
    ],
    communityContributions: [
      {
        title: "Morning tasting notes",
        body:
          "Shares gentle product education so visitors can discover flavors without pressure.",
      },
      {
        title: "Artisan mentor",
        body:
          "Helps future food and craft merchants shape warmer storefront rituals.",
      },
    ],
  },
  "harbor-supply-shop": {
    slug: "harbor-supply-shop",
    merchantName: "Captain Arlo",
    merchantClass: "Harbor Merchant",
    personalityType: "Practical",
    communicationStyle: "Direct",
    backgroundStory:
      "Captain Arlo spent twenty years on trade routes before building a safer dock for small merchants.",
    personalGoal: "Connect every region through reliable trade.",
    favoriteProduct: "Storm-Safe Cargo Kit",
    catchPhrase: "Trade keeps the world moving.",
    region: "Harbor Kingdom",
    reputationLevel: "Master Merchant",
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
    whyTheyStarted:
      "He saw too many first-time merchants lose confidence at the shipping dock.",
    founderHistory:
      "Arlo helped define Harbor Kingdom's identity as a region where trust travels with every crate.",
    milestones: [
      {
        date: "Old Sea Routes",
        title: "Twenty years of storms",
        body:
          "Arlo learned which supplies save a shipment and which promises break under rain.",
      },
      {
        date: "Harbor Kingdom Gate",
        title: "A dock for small merchants",
        body:
          "His supply shop became a practical bridge between local sellers and regional trade.",
      },
    ],
    communityContributions: [
      {
        title: "Shipping safety lessons",
        body:
          "Teaches merchants how to pack, label, and prepare before selling across regions.",
      },
      {
        title: "Harbor arrival notices",
        body:
          "Keeps the city informed when shipments and trade rhythms change.",
      },
    ],
  },
  "tech-bazaar-keyboard-store": {
    slug: "tech-bazaar-keyboard-store",
    merchantName: "Professor Byte",
    merchantClass: "Tech Merchant",
    personalityType: "Curious",
    communicationStyle: "Educational",
    backgroundStory:
      "Professor Byte began repairing keyboards for neighbors and turned each repair into a tiny lesson in invention.",
    personalGoal: "Make innovation accessible.",
    favoriteProduct: "Tactile Keyboard Starter Kit",
    catchPhrase: "Every invention starts with a question.",
    region: "Tech Republic",
    reputationLevel: "Gold Merchant",
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
    whyTheyStarted:
      "He wanted tools to feel less intimidating and more like helpful companions.",
    founderHistory:
      "Byte became one of Tech Republic's first examples of playful, explainable commerce.",
    milestones: [
      {
        date: "Back Room Repairs",
        title: "The first switch test",
        body:
          "A neighbor asked why a key felt different, and Byte has been explaining delightful tools ever since.",
      },
      {
        date: "Tech Republic Alpha",
        title: "Curiosity opened the shop",
        body:
          "His building became a destination for merchants learning technology without losing wonder.",
      },
    ],
    communityContributions: [
      {
        title: "Plain-language tech demos",
        body:
          "Turns technical product questions into understandable, friendly guidance.",
      },
      {
        title: "Prototype corner",
        body:
          "Shares experiments that make the town feel inventive and alive.",
      },
    ],
  },
  "demo-general-store": {
    slug: "demo-general-store",
    merchantName: "Mae",
    merchantClass: "General Store Keeper",
    personalityType: "Helpful",
    communicationStyle: "Friendly",
    backgroundStory:
      "Mae built her shop around the humble things that rescue ordinary days.",
    personalGoal:
      "Make everyday goods feel dependable, remembered, and human.",
    favoriteProduct: "Everyday Essentials Bundle",
    catchPhrase: "A good shelf remembers what people forget.",
    region: "Merchant City",
    reputationLevel: "Silver Merchant",
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
    whyTheyStarted:
      "She noticed the small missing item can change a person's whole afternoon.",
    founderHistory:
      "Mae's store helped define Merchant City as practical, kind, and easy to enter.",
    milestones: [
      {
        date: "First Shelf",
        title: "Twine, batteries, and lunch bags",
        body:
          "Mae began by stocking the quiet goods that keep a city functioning.",
      },
      {
        date: "Merchant City Alpha",
        title: "The everyday safety net",
        body:
          "Her building became the town's reminder that useful can still be memorable.",
      },
    ],
    communityContributions: [
      {
        title: "Newcomer basics",
        body:
          "Helps first-time visitors understand what they might need before they know how to ask.",
      },
      {
        title: "Kind reminders",
        body:
          "Keeps the town language warm, practical, and neighborly.",
      },
    ],
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
    history:
      "Merchant City formed around a civic promise: no merchant should have to feel invisible.",
    identity:
      "The starting city where shops become buildings, merchants become neighbors, and visitors become citizens.",
    culture:
      "Welcoming, practical, founder-minded, and proud of small rituals like greetings, bells, and daily notices.",
    tradeSpecialty:
      "General commerce, founder merchants, guild introductions, and civic discovery.",
    importantNPCs: ["Mayor Alden", "Mira", "Cedric", "Mae"],
  },
  {
    slug: "harbor-kingdom",
    epithet: "Gateway of Global Trade",
    lore:
      "Harbor Kingdom grew from lantern-lit docks where crews carried fragile dreams across uncertain water.",
    memory:
      "The oldest captains still touch the lighthouse wall before every important shipment.",
    localSaying: "Pack with care. Sail with courage.",
    history:
      "Harbor Kingdom grew from dangerous routes, shared weather reports, and merchants who learned to trust careful crews.",
    identity:
      "A logistics realm where movement, timing, and responsibility turn trade into relationship.",
    culture:
      "Direct, steady, sea-worn, and protective of anyone brave enough to send goods beyond their home road.",
    tradeSpecialty: "Shipping supplies, imports, exports, cargo tools, and trade preparation.",
    importantNPCs: ["Captain Marina", "Captain Arlo", "Dockside Port Workers"],
  },
  {
    slug: "tech-republic",
    epithet: "Land of Innovation",
    lore:
      "Tech Republic was founded by inventors who believed useful tools should belong to working merchants, not distant towers.",
    memory:
      "Its labs glow late because curiosity is considered a civic habit.",
    localSaying: "Ask the smaller question first.",
    history:
      "Tech Republic began when small inventors refused to let useful technology belong only to large companies.",
    identity:
      "A bright region for devices, education, electronics, and tools that make work feel alive.",
    culture:
      "Curious, explanatory, experimental, and proud of prototypes that invite questions.",
    tradeSpecialty: "Electronics, keyboards, merchant tools, smart devices, and practical innovation.",
    importantNPCs: ["Professor Orion", "Professor Byte", "Workshop Students"],
  },
  {
    slug: "artisan-valley",
    epithet: "Home of Makers and Creators",
    lore:
      "Artisan Valley is stitched together by roasters, makers, cooks, and craftspeople who trade stories as carefully as goods.",
    memory:
      "Visitors remember the valley by smell: coffee, bread, wet clay, and warm wood.",
    localSaying: "Made slowly means remembered longer.",
    history:
      "Artisan Valley formed from makers who wanted craft to stay personal even when commerce became digital.",
    identity:
      "A gentle valley of food, craft, handmade goods, roasters, and creators who build with care.",
    culture:
      "Slow, sensory, hospitable, seasonal, and deeply proud of hand-finished details.",
    tradeSpecialty: "Coffee, food, handmade goods, workshops, and craft education.",
    importantNPCs: ["Master Luna", "Luna", "Valley Makers"],
  },
  {
    slug: "creator-island",
    epithet: "Signal Home of Digital Creators",
    lore:
      "Creator Island rose around studios where teachers, designers, and media builders made knowledge feel visitable.",
    memory:
      "At sunset, the signal towers blink like friendly windows across the water.",
    localSaying: "Share the spark. Keep the craft.",
    history:
      "Creator Island rose from teachers, designers, and media makers who turned knowledge into visitable places.",
    identity:
      "A signal-rich island where digital products, education, media, and design become destinations.",
    culture:
      "Expressive, collaborative, optimistic, and built around sharing what you know.",
    tradeSpecialty: "Courses, templates, media, design services, and creator-led commerce.",
    importantNPCs: ["Nova", "Studio Guides", "Signal Keepers"],
  },
  {
    slug: "industrial-district",
    epithet: "Powerhouse of Production",
    lore:
      "Industrial District carries the heavy rhythm of makers who build the machines, parts, and systems behind other merchants' dreams.",
    memory:
      "The district's old whistle marks not a shift ending, but a promise completed.",
    localSaying: "Strong work, fair hands.",
    history:
      "Industrial District was built by suppliers whose unseen parts kept every other region moving.",
    identity:
      "A production powerhouse for B2B commerce, machinery, parts, factories, and dependable systems.",
    culture:
      "Disciplined, sturdy, respectful of craft labor, and proud of honest output.",
    tradeSpecialty: "Machinery, factory supplies, industrial components, and production services.",
    importantNPCs: ["Chief Forge", "Factory Stewards", "Workshop Crews"],
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
  history:
    "Merchant City formed around a civic promise: no merchant should have to feel invisible.",
  identity:
    "The starting city where shops become buildings, merchants become neighbors, and visitors become citizens.",
  culture:
    "Welcoming, practical, founder-minded, and proud of small rituals like greetings, bells, and daily notices.",
  tradeSpecialty:
    "General commerce, founder merchants, guild introductions, and civic discovery.",
  importantNPCs: ["Mayor Alden", "Mira", "Cedric", "Mae"],
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

export const founderMuseumExhibits: FounderMuseumExhibit[] = [
  {
    id: "first-map",
    era: "Buyer World Entry",
    title: "The first city sketch",
    caption:
      "A remembered frame from when Merchant City changed from page navigation into a place to enter.",
  },
  {
    id: "first-shopkeeper",
    era: "Living Citizens",
    title: "The first visible shopkeeper",
    caption:
      "The moment merchants stopped feeling like records and started standing near their doors.",
  },
  {
    id: "first-warp",
    era: "Regional Network",
    title: "The first gate glow",
    caption:
      "A civic memory of Prontera expanding from a single town into connected regions.",
  },
];

export const ambientStoryCards: AmbientStoryCard[] = [
  {
    id: "note-luna-blend",
    type: "Merchant Note",
    title: "Luna pinned a roast note",
    body:
      "Chocolate notes are stronger today. She says the cup feels like a rainy window and a good chair.",
  },
  {
    id: "poster-harbor-arrival",
    type: "Town Poster",
    title: "Harbor crates arrived",
    body:
      "The Market Bridge board says Arlo inspected the morning cargo before sunrise.",
  },
  {
    id: "guild-first-visit",
    type: "Guild Notice",
    title: "New merchants welcome",
    body:
      "Cedric reminds visitors that every legendary building began with one brave open door.",
  },
  {
    id: "festival-coffee",
    type: "Festival Announcement",
    title: "Coffee Festival preview",
    body:
      "Artisan Valley is preparing tasting cards, maker stories, and warm benches for travelers.",
  },
  {
    id: "tip-warp-gate",
    type: "Travel Tip",
    title: "Listen for the gate",
    body:
      "When the Warp Gate hums softly, another region has a story worth visiting.",
  },
  {
    id: "founder-quote-road",
    type: "Founder Quote",
    title: "Founder wall",
    body:
      "Build the road first. Commerce can follow, but belonging has to arrive early.",
  },
  {
    id: "news-byte-demo",
    type: "World News",
    title: "A tiny invention woke up",
    body:
      "Professor Byte's delivery automaton bumped into a flower pot and apologized twice.",
  },
];

export function getMerchantSoul(shop: WorldShop): MerchantSoul {
  const known = merchantSouls[shop.slug];
  if (known) return known;
  const identity = getMerchantIdentity(shop);
  return {
    slug: shop.slug,
    merchantName: identity.merchantName,
    merchantClass: identity.merchantTitle,
    personalityType: identity.personality,
    communicationStyle: "Friendly",
    backgroundStory:
      identity.backstory ??
      `${identity.merchantName} is still shaping a story visitors can remember.`,
    personalGoal: `Make ${shop.name} feel like a destination with a real person behind it.`,
    favoriteProduct: shop.featuredProducts[0]?.name ?? "The featured shelf",
    catchPhrase: identity.favoriteQuote,
    region: shop.city.region,
    reputationLevel:
      identity.merchantReputation >= 4.9
        ? "Gold Merchant"
        : identity.merchantReputation >= 4.7
          ? "Silver Merchant"
          : "Bronze Merchant",
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
    whyTheyStarted:
      "To turn a useful shop into a remembered stop on someone's journey.",
    founderHistory:
      "This merchant is part of Prontera's growing archive of people-first commerce.",
    milestones: [
      {
        date: "Opening Chapter",
        title: "The door first opened",
        body: `${identity.merchantName} began welcoming visitors into ${shop.name}.`,
      },
    ],
    communityContributions: [
      {
        title: "Local welcome",
        body:
          "Adds one more human destination to the commerce world.",
      },
    ],
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
