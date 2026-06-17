"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { DiscoveryCategory, WorldShop } from "../../lib/api";

type SearchBoxProps = {
  initialSearch?: string;
  placeholder?: string;
  onSearch: (search: string) => void;
};

export function DiscoverySearchBox({
  initialSearch = "",
  placeholder = "Search merchants, categories, cities, or districts",
  onSearch,
}: SearchBoxProps) {
  const [search, setSearch] = useState(initialSearch);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(search);
  }

  return (
    <form className="form-grid two" onSubmit={submit}>
      <label>
        Merchant Search
        <input
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          value={search}
        />
      </label>
      <div style={{ alignSelf: "end" }}>
        <button className="button primary" type="submit">
          Search Merchants
        </button>
      </div>
    </form>
  );
}

export function MerchantDiscoveryCard({
  shop,
  onClick,
}: {
  shop: WorldShop;
  onClick?: (shop: WorldShop) => void;
}) {
  return (
    <Link
      className="card"
      href={`/merchant/${shop.slug}`}
      onClick={() => onClick?.(shop)}
    >
      <div className="button-row" style={{ marginBottom: 10 }}>
        {shop.liveNow ? <span className="badge">LIVE</span> : null}
        {shop.isFounderMerchant ? (
          <span className="badge warn">Founder</span>
        ) : null}
        {shop.isOfficialStore ? (
          <span className="badge">Official Store</span>
        ) : null}
        {shop.featured ? <span className="badge">Featured</span> : null}
      </div>
      <p className="eyebrow">
        {shop.city.name} / {shop.district.name}
      </p>
      <h3>{shop.signText ?? shop.name}</h3>
      <p className="muted">{shop.description ?? shop.category}</p>
      <p className="muted">
        {shop.buildingType.toLowerCase()} building / {shop.subscriptionTier}
      </p>
      {shop.promotionBanner ? <p>{shop.promotionBanner}</p> : null}
      {shop.featuredProducts.length ? (
        <p className="muted">
          Featured:{" "}
          {shop.featuredProducts
            .slice(0, 2)
            .map((product) => product.name)
            .join(", ")}
        </p>
      ) : null}
    </Link>
  );
}

export function CategoryGrid({
  categories,
  onSelect,
}: {
  categories: DiscoveryCategory[];
  onSelect?: (category: string) => void;
}) {
  return (
    <div className="grid three">
      {categories.map((category) => (
        <button
          className="card"
          key={category.category}
          onClick={() => onSelect?.(category.category)}
          type="button"
        >
          <p className="eyebrow">Merchant Category</p>
          <h3>{category.category}</h3>
          <p className="muted">
            {category.merchantCount} merchants / {category.liveCount} live
          </p>
        </button>
      ))}
    </div>
  );
}
