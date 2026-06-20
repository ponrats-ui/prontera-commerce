import type { ReactNode } from "react";

export default function TownLayout({ children }: { children: ReactNode }) {
  return <div className="buyer-world-shell is-game-shell">{children}</div>;
}
