import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale } from "../i18n/config";

export const metadata: Metadata = {
  title: "Prontera Commerce",
  description: "Commerce platform foundation for global commerce delivery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale}>
      <body>{children}</body>
    </html>
  );
}
