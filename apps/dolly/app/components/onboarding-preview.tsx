"use client";

import { useWebMCPExperience } from "@webmcp-sdk/experience";

export function OnboardingPreview() {
  const experience = useWebMCPExperience();
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={() => experience.openOnboarding()}
    >
      Preview the onboarding
    </button>
  );
}
