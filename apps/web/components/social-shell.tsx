"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BuyerWorldNav } from "./buyer-world-nav";

const links = [
  ["/commerce-square", "Square"],
  ["/world/journey", "Journey"],
  ["/friends", "Friends"],
  ["/following", "Following"],
  ["/guilds", "Guilds"],
  ["/reputation", "Reputation"],
  ["/events", "Events"],
  ["/founder-hall", "Founder Hall"],
] as const;

export function SocialShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="buyer-world-shell social-civilization-shell">
      <BuyerWorldNav />
      <nav aria-label="Social civilization navigation" className="social-nav">
        {links.map(([href, label]) => (
          <Link
            className={pathname === href ? "active" : ""}
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
