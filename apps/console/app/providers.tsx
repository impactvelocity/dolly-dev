"use client";

import { WebMCPExperienceProvider, useWebMCPExperience } from "@webmcp-sdk/experience";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "./app-shell";
import { CrmProvider, useCrm } from "./crm-store";
import { DebugProbe } from "./debug-probe";
import { DevConfigProvider, useDevConfig } from "./dev-config";
import { CrmWebMCPTools } from "./webmcp-tools";

const onboarding = {
  steps: [
    {
      image: "/onboarding-contacts.svg",
      imageAlt: "A contact list with one row highlighted",
      title: "Ask for any contact",
      description:
        "ChatGPT can search, create, and remove contacts for you — the table filters and updates live while it works.",
    },
    {
      image: "/onboarding-deals.svg",
      imageAlt: "A deal card moving between pipeline stages",
      title: "Move deals hands-free",
      description:
        "Create deals, move them between pipeline stages, or ask for a summary of the open pipeline — you'll see every change happen.",
    },
    {
      image: "/onboarding-settings.svg",
      imageAlt: "A settings form being renamed",
      title: "Even rename your CRM",
      description:
        "Workspace settings are tools too. Ask ChatGPT to rename the CRM and watch the sidebar update in front of you.",
    },
  ],
};

const capabilities = [
  {
    title: "Search and manage contacts",
    description: "Find contacts, add new leads, or remove records from the contact list.",
  },
  {
    title: "Manage deals",
    description: "Create deals, move them between pipeline stages, or remove them.",
  },
  {
    title: "Update workspace settings",
    description: "Rename the CRM or the workspace from the conversation.",
  },
];

// Dev helper: expose the experience API on window so the work states can be
// triggered from the browser console without a connected agent.
function DevExperienceHandle() {
  const experience = useWebMCPExperience();
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__webmcpExperience = experience;
  }, [experience]);
  return null;
}

function ExperienceShell({ children }: { children: ReactNode }) {
  const { settings } = useCrm();
  const { config } = useDevConfig();

  return (
    <WebMCPExperienceProvider
      appName={settings.crmName}
      capabilities={capabilities}
      onboarding={onboarding}
      theme={{ mode: config.mode, brandColor: config.brandColor }}
      toast={config.endingToast ? "settled" : "none"}
      glow={{
        // The last stop repeats the first so the drifting gradient loops
        // seamlessly, matching the stylesheet's default.
        colors: [...config.glowColors, config.glowColors[0]!],
        ringColor: config.glowColors[2]!,
        always: config.generalLoading,
      }}
      highlight={{
        color: config.highlightColor,
        showOverlay: config.highlightFocus,
        overlayColor: config.highlightOverlayColor,
        overlayOpacity: config.highlightOverlayOpacity,
      }}
    >
      <DebugProbe />
      <DevExperienceHandle />
      <CrmWebMCPTools />
      <AppShell>{children}</AppShell>
    </WebMCPExperienceProvider>
  );
}

export function CrmProviders({ children }: { children: ReactNode }) {
  return (
    <CrmProvider>
      <DevConfigProvider>
        <ExperienceShell>{children}</ExperienceShell>
      </DevConfigProvider>
    </CrmProvider>
  );
}
