"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { detectAgent } from "./agent-detection";
import { createChatGPTDeeplink, type ChatGPTDeeplinkOptions } from "./deeplink";
import { useOptionalWebMCPExperience } from "./experience-provider";
import { OpenAILogo } from "./openai-logo";

export type SupportedAgent = "openai";

export interface OpenInButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick">,
    ChatGPTDeeplinkOptions {
  agent?: SupportedAgent;
  children?: ReactNode;
  url?: string;
  /**
   * Hide the button when the page is already open inside an agent browser —
   * there is nothing to deeplink to. Defaults to true.
   */
  hideWhenInsideAgent?: boolean;
}

const AGENT_LABELS: Record<SupportedAgent, string> = {
  openai: "ChatGPT",
};

export function OpenInButton({
  agent = "openai",
  children,
  url,
  connectionParam,
  deeplinkBase,
  hideWhenInsideAgent = true,
  type = "button",
  ...buttonProps
}: OpenInButtonProps) {
  const experience = useOptionalWebMCPExperience();
  const [standaloneDetected, setStandaloneDetected] = useState(false);

  // Outside the provider there is no snapshot to read, so detect directly
  // after mount (detection needs the browser's injected globals).
  useEffect(() => {
    if (!experience) {
      setStandaloneDetected(detectAgent().brand !== "unknown");
    }
  }, [experience]);

  const insideAgent = experience
    ? experience.snapshot.agent !== "unknown"
    : standaloneDetected;

  if (hideWhenInsideAgent && insideAgent) return null;

  const handleClick = () => {
    const targetUrl = url ?? window.location.href;
    const deeplink = createChatGPTDeeplink(targetUrl, {
      ...(connectionParam ? { connectionParam } : {}),
      ...(deeplinkBase ? { deeplinkBase } : {}),
    });
    window.location.assign(deeplink);
  };

  return (
    <button {...buttonProps} type={type} onClick={handleClick}>
      {children ?? (
        <>
          <span className="webmcp-exp-openin__label">
            <OpenAILogo />
            Open in {AGENT_LABELS[agent]}
          </span>
          <span aria-hidden="true">↗</span>
        </>
      )}
    </button>
  );
}
