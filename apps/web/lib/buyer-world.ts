export const BUYER_AVATAR_KEY = "prontera_buyer_avatar";

export const buyerAvatars = [
  {
    id: "adventurer",
    name: "Adventurer",
    mark: "A",
    description: "Curious, ready, and always looking for the next district.",
  },
  {
    id: "merchant",
    name: "Merchant",
    mark: "M",
    description:
      "Trade-minded and interested in shops, deals, and new partners.",
  },
  {
    id: "creator",
    name: "Creator",
    mark: "C",
    description:
      "Drawn to artisan stories, original products, and live commerce.",
  },
  {
    id: "explorer",
    name: "Explorer",
    mark: "E",
    description:
      "Follows gates, city routes, and merchants beyond the main square.",
  },
] as const;

export type BuyerAvatarId = (typeof buyerAvatars)[number]["id"];

export function getBuyerAvatar(id?: string | null) {
  return buyerAvatars.find((avatar) => avatar.id === id) ?? buyerAvatars[0];
}
