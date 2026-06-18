"use client";

import { useEffect, useState } from "react";
import { DAILY_VISIT_KEY, SOCIAL_STATE_KEY } from "./social-civilization";

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

  function acceptFriend(id: string) {
    setState((current) => ({
      ...current,
      requests: current.requests.filter((item) => item !== id),
      friends: current.friends.includes(id)
        ? current.friends
        : [...current.friends, id],
    }));
  }

  return { state, setState, toggleList, acceptFriend, ready };
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
