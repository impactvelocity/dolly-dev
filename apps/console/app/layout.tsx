import type { Metadata } from "next";
import { Cal_Sans, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";

// Tailwind first so the SDK's `components` layer sits below `utilities`,
// letting className props override the SDK defaults.
import "./globals.css";
import "@webmcp-sdk/experience/styles.css";
import "react-beautiful-color/dist/react-beautiful-color.css";

import { CrmProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const calSans = Cal_Sans({ weight: "400", subsets: ["latin"], variable: "--font-cal" });

export const metadata: Metadata = {
  title: "Relay CRM — Contacts and deals",
  description: "A mock CRM example for the WebMCP Experience SDK.",
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
