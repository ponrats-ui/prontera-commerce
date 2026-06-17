"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { clearAuthSession, getAccessToken, getStoredUser } from "../lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/founders", label: "Founder Program" },
  { href: "/dashboard/shops", label: "Shops" },
  { href: "/dashboard/building-settings", label: "Building Settings" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/pos", label: "POS" },
  { href: "/dashboard/promotions", label: "Promotions" },
  { href: "/dashboard/subscription", label: "Subscription" },
  { href: "/dashboard/live-commerce", label: "Live Commerce", badge: "Pro" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("Merchant");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    setEmail(getStoredUser()?.email ?? "Merchant");
  }, [router]);

  function logout() {
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">Prontera Commerce</div>
          <div className="brand-subtitle">Merchant OS</div>
        </div>
        <nav className="nav-list" aria-label="Dashboard">
          {navItems.map((item) => (
            <Link
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              href={item.href}
              key={item.href}
            >
              <span>{item.label}</span>
              {"badge" in item ? (
                <span className="nav-badge">{item.badge}</span>
              ) : null}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="muted">{email}</span>
          <button className="button" onClick={logout} type="button">
            Logout
          </button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
