"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorldShop } from "./api";
import {
  DAILY_VISIT_KEY,
  SOCIAL_STATE_KEY,
} from "./social-civilization";
import { MERCHANT_MEMORY_KEY } from "./merchant-soul";

export type SocialState = {
  friends: string[];
  requests: string[];
  followingMerchants: string[];
  favoriteMerchants: string[];
  joinedGuilds: string[];
  attendingEvents: string[];
  helpfulReviews: number;
  communityParticipation: number;
  merchantRecommendations: number;
  messages: Array<{
    id: string;
    person: string;
    preview: string;
    time: string;
  }>;
};

export type MerchantMemoryState = {
  firstShopVisited: string | null;
  firstShopVisitedAt: string | null;
  favoriteMerchant: string | null;
  firstPurchase: string | null;
  mostVisitedCity: string | null;
  mostVisitedRegion: string | null;
  shopVisits: Record<string, number>;
  cityVisits: Record<string, number>;
  regionVisits: Record<string, number>;
  lastVisitedShop: string | null;
  lastVisitedAt: string | null;
  npcConversationCount: number;
  storyFollowing: string[];
};

const initialState: SocialState = {
  friends: ["citizen-nari", "citizen-tomas"],
  requests: ["citizen-mei"],
  followingMerchants: ["artisan-coffee-house", "harbor-supply-shop"],
  favoriteMerchants: ["artisan-coffee-house"],
  joinedGuilds: ["guild-central-merchants"],
  attendingEvents: ["event-coffee-festival"],
  helpfulReviews: 8,
  communityParticipation: 14,
  merchantRecommendations: 5,
  messages: [
    {
      id: "message-luna",
      person: "Luna",
      preview: "The festival roast is ready whenever you visit.",
      time: "9:42",
    },
    {
      id: "message-nari",
      person: "Nari",
      preview: "Want to walk through Artisan Valley later?",
      time: "Yesterday",
    },
  ],
};

const initialMemory: MerchantMemoryState = {
  firstShopVisited: null,
  firstShopVisitedAt: null,
  favoriteMerchant: "artisan-coffee-house",
  firstPurchase: null,
  mostVisitedCity: "Merchant City",
  mostVisitedRegion: "Merchant City",
  shopVisits: {},
  cityVisits: { "Merchant City": 1 },
  regionVisits: { "Merchant City": 1 },
  lastVisitedShop: null,
  lastVisitedAt: null,
  npcConversationCount: 2,
  storyFollowing: ["artisan-coffee-house"],
};

export function useSocialState() {
  const [state, setState] = useState<SocialState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SOCIAL_STATE_KEY);
      if (stored) setState({ ...initialState, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem(SOCIAL_STATE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(SOCIAL_STATE_KEY, JSON.stringify(state));
  }, [ready, state]);

  function toggleList(key: keyof SocialState, id: string) {
    setState((current) => {
      const value = current[key];
      if (!Array.isArray(value)) return current;
      const list = value as string[];
      return {
        ...current,
        [key]: list.includes(id)
          ? list.filter((item) => item !== id)
          : [...list, id],
      };
    });
  }

  function toggleStoryFollow(id: string) {
    setState((current) => ({
      ...current,
      followingMerchants: current.followingMerchants.includes(id)
        ? current.followingMerchants
        : [...current.followingMerchants, id],
    }));
  }

  function acceptFriend(id: string) {
    setState((current) => ({
      ...current,
      requests: current.requests.filter((item) => item !== id),
      friends: current.friends.includes(id)
        ? current.friends
        : [...current.friends, id],
    }));
  }

  return { state, setState, toggleList, toggleStoryFollow, acceptFriend, ready };
}

export function useMerchantMemory() {
  const [memory, setMemory] = useState<MerchantMemoryState>(initialMemory);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MERCHANT_MEMORY_KEY);
      if (stored) setMemory({ ...initialMemory, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem(MERCHANT_MEMORY_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(MERCHANT_MEMORY_KEY, JSON.stringify(memory));
  }, [memory, ready]);

  const rememberShopVisit = useCallback((shop: WorldShop) => {
    setMemory((current) => {
      const shopVisits = {
        ...current.shopVisits,
        [shop.slug]: (current.shopVisits[shop.slug] ?? 0) + 1,
      };
      const cityVisits = {
        ...current.cityVisits,
        [shop.city.name]: (current.cityVisits[shop.city.name] ?? 0) + 1,
      };
      const regionName = shop.city.region;
      const regionVisits = {
        ...current.regionVisits,
        [regionName]: (current.regionVisits[regionName] ?? 0) + 1,
      };

      return {
        ...current,
        firstShopVisited: current.firstShopVisited ?? shop.slug,
        firstShopVisitedAt:
          current.firstShopVisitedAt ?? new Date().toISOString(),
        mostVisitedCity: mostVisited(cityVisits),
        mostVisitedRegion: mostVisited(regionVisits),
        shopVisits,
        cityVisits,
        regionVisits,
        lastVisitedShop: shop.slug,
        lastVisitedAt: new Date().toISOString(),
      };
    });
  }, []);

  const rememberFavoriteMerchant = useCallback((shopSlug: string) => {
    setMemory((current) => ({
      ...current,
      favoriteMerchant: shopSlug,
    }));
  }, []);

  const toggleStoryFollow = useCallback((shopSlug: string) => {
    setMemory((current) => ({
      ...current,
      storyFollowing: current.storyFollowing.includes(shopSlug)
        ? current.storyFollowing.filter((item) => item !== shopSlug)
        : [...current.storyFollowing, shopSlug],
    }));
  }, []);

  const rememberNpcConversation = useCallback(() => {
    setMemory((current) => ({
      ...current,
      npcConversationCount: current.npcConversationCount + 1,
    }));
  }, []);

  return {
    memory,
    setMemory,
    ready,
    rememberShopVisit,
    rememberFavoriteMerchant,
    toggleStoryFollow,
    rememberNpcConversation,
  };
}

function mostVisited(visits: Record<string, number>) {
  return (
    Object.entries(visits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  );
}

export function claimDailyVisit() {
  const today = new Date().toISOString().slice(0, 10);
  const previous = localStorage.getItem(DAILY_VISIT_KEY);
  if (previous === today) return false;
  localStorage.setItem(DAILY_VISIT_KEY, today);
  return true;
}

export function hasClaimedDailyVisit() {
  return (
    localStorage.getItem(DAILY_VISIT_KEY) ===
    new Date().toISOString().slice(0, 10)
  );
}
