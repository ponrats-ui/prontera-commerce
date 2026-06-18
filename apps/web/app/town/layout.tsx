import type { ReactNode } from "react";
import { BuyerWorldNav } from "../../components/buyer-world-nav";

export default function TownLayout({ children }: { children: ReactNode }) {
  return (
    <div className="buyer-world-shell">
      <BuyerWorldNav />
      {children}
    </div>
  );
}
