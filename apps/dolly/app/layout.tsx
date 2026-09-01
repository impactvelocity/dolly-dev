import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import {
  AgentStatusBadge,
  WebMCPExperienceProvider,
} from "@webmcp-sdk/experience";

// Tailwind first so the SDK's `components` layer sits below `utilities`,
// letting className props override the SDK defaults.
import "./globals.css";
import "@webmcp-sdk/experience/styles.css";

const calSans = Cal_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-sans",
});

const capabilities = [
  {
    title: "Roll the camera",
    description: "Run a live take of the ambient work glow on this page.",
  },
  {
    title: "Spotlight a scene",
    description: "Focus any section of the site while explaining it.",
  },
  {
    title: "Log a take",
    description: "Record an entry in the visible agent history feed.",
  },
];

export const metadata: Metadata = {
  title: "Dolly — keep the agent in frame",
  description:
    "Dolly is a React SDK for WebMCP sites that makes agent actions visible on the page — what the agent is doing, what it did, and what it can do.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${calSans.variable}`}>
        <WebMCPExperienceProvider
          appName="Dolly.dev"
          capabilities={capabilities}
          theme={{
            mode: "light",
            brandColor: "#fd3f25",
          }}
          glow={{
            colors: ["#8cfffd", "#fd3f25", "#8cfffd"],
            ringColor: "#fd3f25",
          }}
        >
          {children}
          <AgentStatusBadge corner="bottom-left" />
        </WebMCPExperienceProvider>
      </body>
    </html>
  );
}
