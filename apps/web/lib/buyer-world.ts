export const BUYER_AVATAR_KEY = "prontera_buyer_avatar";

export type BuyerCharacter = {
  id: "adventurer" | "merchant" | "creator" | "explorer";
  name: string;
  class: "Adventurer" | "Merchant" | "Creator" | "Explorer";
  sprite: string;
  title: string;
  description: string;
  level: number | null;
  reputation: number | null;
  mark: string;
};

export const buyerCharacters = [
  {
    id: "adventurer",
    name: "Ari",
    class: "Adventurer",
    sprite: "suntrail-adventurer",
    title: "Curious Wayfinder",
    description:
      "Follows lively streets and always finds something unexpected.",
    level: null,
    reputation: null,
    mark: "A",
  },
  {
    id: "merchant",
    name: "Milo",
    class: "Merchant",
    sprite: "brassbell-merchant",
    title: "Friendly Trader",
    description:
      "Notices a good storefront, a fair deal, and a promising idea.",
    level: null,
    reputation: null,
    mark: "M",
  },
  {
    id: "creator",
    name: "Cora",
    class: "Creator",
    sprite: "blueink-creator",
    title: "Market Maker",
    description:
      "Seeks original products, artisan stories, and live creativity.",
    level: null,
    reputation: null,
    mark: "C",
  },
  {
    id: "explorer",
    name: "Elio",
    class: "Explorer",
    sprite: "greenway-explorer",
    title: "Gate Seeker",
    description:
      "Knows every side road and wonders what lies beyond each gate.",
    level: null,
    reputation: null,
    mark: "E",
  },
] as const satisfies readonly BuyerCharacter[];

// Kept as an alias for existing buyer-world consumers.
export const buyerAvatars = buyerCharacters;

export type BuyerAvatarId = (typeof buyerCharacters)[number]["id"];

export function getBuyerCharacter(id?: string | null) {
  return (
    buyerCharacters.find((character) => character.id === id) ??
    buyerCharacters[0]
  );
}

export const getBuyerAvatar = getBuyerCharacter;
