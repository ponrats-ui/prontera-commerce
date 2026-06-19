"use client";

import { useMerchantMemory, useSocialState } from "../lib/social-state";

export function MerchantRelationshipActions({
  shopSlug,
  merchantName,
}: {
  shopSlug: string;
  merchantName: string;
}) {
  const { state, toggleList } = useSocialState();
  const { memory, rememberFavoriteMerchant, toggleStoryFollow } =
    useMerchantMemory();
  const following = state.followingMerchants.includes(shopSlug);
  const favorite = state.favoriteMerchants.includes(shopSlug);
  const followingStory = memory.storyFollowing.includes(shopSlug);

  return (
    <div className="storefront-relationship-actions">
      <button
        className={following ? "active" : ""}
        onClick={() => toggleList("followingMerchants", shopSlug)}
        type="button"
      >
        {following ? `Following ${merchantName}` : `Follow ${merchantName}`}
      </button>
      <button
        className={favorite ? "active favorite" : ""}
        onClick={() => {
          toggleList("favoriteMerchants", shopSlug);
          rememberFavoriteMerchant(shopSlug);
        }}
        type="button"
      >
        {favorite ? "★ Favorite destination" : "☆ Favorite shop"}
      </button>
      <button
        className={followingStory ? "active story" : ""}
        onClick={() => toggleStoryFollow(shopSlug)}
        type="button"
      >
        {followingStory ? "Following story" : "Follow story"}
      </button>
      <span>{128 + state.followingMerchants.length} followers</span>
    </div>
  );
}
