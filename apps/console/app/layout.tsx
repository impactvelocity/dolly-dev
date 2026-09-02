import type { Metadata } from "next";
import { Cal_Sans, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";

// react-beautiful-color bundles its own Tailwind build (with Preflight);
// it must come BEFORE globals.css or its `border: 0 solid` reset lands
// later in the `base` layer and wipes our `* { border-color: var(--border) }`.
import "react-beautiful-color/dist/react-beautiful-color.css";
// Tailwind first so the SDK's `components` layer sits below `utilities`,
// letting className props override the SDK defaults.
import "./globals.css";
import "@dolly/rig/styles.css";

import { CrmProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const calSans = Cal_Sans({ weight: "400", subsets: ["latin"], variable: "--font-cal" });

export const metadata: Metadata = {
  title: "Dolly CRM — Contacts and deals",
  description: "A mock CRM example for @dolly/rig.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${calSans.variable} ${GeistMono.variable}`}>
      <body>
        <CrmProviders>{children}</CrmProviders>
      </body>
    </html>
  );
}
