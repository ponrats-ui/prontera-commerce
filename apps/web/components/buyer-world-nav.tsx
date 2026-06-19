"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BUYER_AVATAR_KEY, getBuyerAvatar } from "../lib/buyer-world";
import { WorldCharacter } from "./world-character";

const links = [
  { href: "/commerce-square", label: "Commerce Square" },
  { href: "/world/journey", label: "Your Journey" },
  { href: "/world-map", label: "World Map" },
  { href: "/world/merchant-city", label: "Merchant City" },
  { href: "/guilds", label: "Guilds" },
  { href: "/events", label: "Events" },
];

export function BuyerWorldNav() {
  const [avatarId, setAvatarId] = useState<string | null>(null);

  useEffect(() => {
    setAvatarId(window.localStorage.getItem(BUYER_AVATAR_KEY));
  }, []);

  const avatar = getBuyerAvatar(avatarId);

  return (
    <header className="world-nav">
      <Link className="world-brand" href="/play">
        <span className="world-brand-mark">P</span>
        <span>
          <strong>Prontera</strong>
          <small>Commerce World</small>
        </span>
      </Link>
      <nav aria-label="Buyer world navigation" className="world-nav-links">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <Link className="avatar-chip" href="/play">
        <WorldCharacter character={avatar} compact />
        <small>
          {avatar.name}
          <span>{avatar.class}</span>
        </small>
      </Link>
    </header>
  );
}
