import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { RigProvider } from "@dolly/rig";

// Tailwind first so the SDK's `components` layer sits below `utilities`,
// letting className props override the SDK defaults.
import "./globals.css";
import "@dolly/rig/styles.css";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${calSans.variable}`}>
        <RigProvider
          appName="Dolly.dev"
          capabilities={capabilities}
          theme={{
            mode: "light",
            brandColor: "#06b6d4",
          }}
          glow={{
            colors: ["#8cfffd", "#06b6d4", "#8cfffd"],
            ringColor: "#06b6d4",
          }}
          highlight={{
            color: "#06b6d4",
          }}
          onboarding={{
            steps: [
              {
                image: "/onboarding/roll.svg",
                title: "Roll the camera",
                description:
                  "Run a live take of the ambient work glow on this page.",
              },
              {
                image: "/onboarding/spotlight.svg",
                title: "Spotlight a scene",
                description:
                  "Focus any section of the site while explaining it.",
              },
              {
                image: "/onboarding/log.svg",
                title: "Log a take",
                description:
                  "Record an entry in the visible agent history feed.",
              },
            ],
            doneLabel: "Try it",
          }}
        >
          {children}
        </RigProvider>
      </body>
    </html>
  );
}
