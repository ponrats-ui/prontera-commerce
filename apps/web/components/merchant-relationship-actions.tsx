"use client";

import { useSocialState } from "../lib/social-state";

export function MerchantRelationshipActions({
  shopSlug,
  merchantName,
}: {
  shopSlug: string;
  merchantName: string;
}) {
  const { state, toggleList } = useSocialState();
  const following = state.followingMerchants.includes(shopSlug);
  const favorite = state.favoriteMerchants.includes(shopSlug);
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
        onClick={() => toggleList("favoriteMerchants", shopSlug)}
        type="button"
      >
        {favorite ? "★ Favorite destination" : "☆ Favorite shop"}
      </button>
      <span>{128 + state.followingMerchants.length} followers</span>
    </div>
  );
}
