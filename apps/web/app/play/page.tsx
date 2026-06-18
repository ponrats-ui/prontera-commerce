"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuyerWorldNav } from "../../components/buyer-world-nav";
import { WorldCharacter } from "../../components/world-character";
import {
  BUYER_AVATAR_KEY,
  buyerCharacters,
  type BuyerAvatarId,
} from "../../lib/buyer-world";

export default function PlayPage() {
  const [selected, setSelected] = useState<BuyerAvatarId>("adventurer");

  useEffect(() => {
    const stored = window.localStorage.getItem(
      BUYER_AVATAR_KEY,
    ) as BuyerAvatarId | null;
    if (buyerCharacters.some((avatar) => avatar.id === stored)) {
      setSelected(stored ?? "adventurer");
    }
  }, []);

  function chooseAvatar(avatar: BuyerAvatarId) {
    setSelected(avatar);
    window.localStorage.setItem(BUYER_AVATAR_KEY, avatar);
  }

  return (
    <div className="buyer-world-shell">
      <BuyerWorldNav />
      <main>
        <section className="world-entry-hero">
          <div className="world-entry-copy">
            <p className="world-kicker">A commerce world for real merchants</p>
            <h1>Enter Prontera</h1>
            <p>
              Walk into Merchant City, visit shops as buildings, meet merchants,
              watch live stores, and travel through connected commerce gates.
            </p>
            <div className="button-row">
              <Link className="world-button primary" href="/town/merchant-city">
                Enter Merchant City
              </Link>
              <Link className="world-button" href="/discover">
                Discover Shops
              </Link>
            </div>
          </div>
          <div aria-label="Merchant City preview" className="entry-city-scene">
            <div className="scene-sky-label">Merchant City</div>
            <div className="scene-building small">
              <span>General Store</span>
            </div>
            <div className="scene-building tall">
              <span>Tech Bazaar</span>
            </div>
            <div className="scene-building market">
              <span>Artisan Row</span>
            </div>
            <div className="scene-gate">
              <span>Warp Gate</span>
            </div>
            <div className="scene-road" />
          </div>
        </section>

        <section className="world-section avatar-section">
          <div className="section-heading">
            <p className="world-kicker">No account required</p>
            <h2>Choose who enters the city</h2>
            <p>
              Each traveler has a distinct class, title, and original world
              sprite. Your character stays on this device.
            </p>
          </div>
          <div className="avatar-grid">
            {buyerCharacters.map((character) => (
              <button
                aria-pressed={selected === character.id}
                className={`avatar-option ${selected === character.id ? "selected" : ""}`}
                key={character.id}
                onClick={() => chooseAvatar(character.id)}
                type="button"
              >
                <span className="character-stage">
                  <WorldCharacter character={character} />
                </span>
                <span className="character-class">{character.class}</span>
                <strong>{character.name}</strong>
                <em>{character.title}</em>
                <small>{character.description}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="world-section entry-actions">
          <Link href="/town/merchant-city">
            <strong>Explore Merchant City</strong>
            <span>See districts and merchant buildings</span>
          </Link>
          <Link href="/town/merchant-city/shops">
            <strong>Discover Shops</strong>
            <span>Browse stores instead of product grids</span>
          </Link>
          <Link href="/town/merchant-city#live-stores">
            <strong>Watch Live Stores</strong>
            <span>Find merchants broadcasting now</span>
          </Link>
          <Link href="/discover">
            <strong>Find Deals</strong>
            <span>Follow active promotion signals</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
