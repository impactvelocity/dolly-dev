"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { detectAgent } from "./agent-detection";
import { createChatGPTDeeplink, type ChatGPTDeeplinkOptions } from "./deeplink";
import { useOptionalRig } from "./rig-provider";
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

/* Lucide's ExternalLink icon, inlined so the SDK stays dependency-free. */
function ExternalLinkIcon() {
  return (
    <svg
      className="webmcp-rig-openin__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

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
  const rig = useOptionalRig();
  const [standaloneDetected, setStandaloneDetected] = useState(false);

  // Outside the provider there is no snapshot to read, so detect directly
  // after mount (detection needs the browser's injected globals).
  useEffect(() => {
    if (!rig) {
      setStandaloneDetected(detectAgent().brand !== "unknown");
    }
  }, [rig]);

  const insideAgent = rig
    ? rig.snapshot.agent !== "unknown"
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
          <span className="webmcp-rig-openin__label">
            <OpenAILogo />
            Open in {AGENT_LABELS[agent]}
          </span>
          <ExternalLinkIcon />
        </>
      )}
    </button>
  );
}
