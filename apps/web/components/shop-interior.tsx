import type { WorldShop } from "../lib/api";
import type { MerchantIdentity } from "../lib/living-world";
import { AiMerchantWidget } from "./ai-merchant-widget";
import { WorldCharacter } from "./world-character";

export function ShopInterior({
  shop,
  merchant,
}: {
  shop: WorldShop;
  merchant: MerchantIdentity;
}) {
  return (
    <section className="shop-interior-section">
      <div className="interior-heading">
        <div>
          <p className="world-kicker">Inside {shop.name}</p>
          <h2>A shop with a person behind it</h2>
        </div>
        <div className="store-reputation">
          <strong>{merchant.merchantReputation.toFixed(1)}</strong>
          <span>★★★★★</span>
          <small>Merchant reputation</small>
        </div>
      </div>

      <div className="shop-interior-scene">
        <div className="interior-wall-detail" />
        <div className="interior-window">
          <span />
        </div>
        <div className="interior-promotion-board">
          <small>Today&apos;s board</small>
          <strong>
            {shop.promotionBanner ?? "A warm welcome is always free"}
          </strong>
          <span>{shop.promotionBadge ?? "Ask the merchant"}</span>
        </div>
        <div className="interior-live-door">
          <span>{shop.liveNow ? "LIVE" : "Live Room"}</span>
          <small>
            {shop.liveNow ? "Broadcasting now" : "Next session soon"}
          </small>
        </div>
        <div className="interior-counter">
          <span className="counter-top" />
          <span className="counter-panel" />
        </div>
        <div className="interior-merchant">
          <span className="merchant-greeting">{merchant.greeting}</span>
          <WorldCharacter
            character={{
              name: merchant.merchantName,
              class: merchant.merchantTitle,
              sprite: merchant.merchantAvatar,
            }}
          />
          <span className="merchant-owner-name">
            <strong>{merchant.merchantName}</strong>
            <small>{merchant.merchantTitle}</small>
            {shop.isFounderMerchant ? <em>Founder Merchant</em> : null}
          </span>
        </div>

        <div className="interior-shelves">
          {(shop.featuredProducts.length
            ? shop.featuredProducts
            : [
                {
                  id: "preparing",
                  name: "Shelf being prepared",
                  slug: "preparing",
                  category: shop.category,
                  priceCents: null,
                  imageUrl: null,
                },
              ]
          ).map((product, index) => (
            <article key={product.id}>
              <div className={`shelf-product product-${index + 1}`}>
                <span>{product.name.slice(0, 1)}</span>
              </div>
              <small>{product.category}</small>
              <strong>{product.name}</strong>
              <span>
                {product.priceCents == null
                  ? "Ask merchant"
                  : `$${(product.priceCents / 100).toFixed(2)}`}
              </span>
            </article>
          ))}
        </div>
      </div>

      <div className="interior-story-grid">
        <article className="merchant-story-card">
          <p className="world-kicker">Meet the owner</p>
          <h2>{merchant.merchantName}</h2>
          <h3>{merchant.merchantTitle}</h3>
          <p>{merchant.merchantStory}</p>
          <span className="merchant-personality">
            Known for being {merchant.personality}.
          </span>
        </article>
        <AiMerchantWidget merchant={merchant} shop={shop} />
      </div>
    </section>
  );
}
