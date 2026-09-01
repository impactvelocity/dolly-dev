"use client";

import { useEffect, useRef } from "react";

import { useOptionalWebMCPExperience } from "./experience-provider";
import type { ToolInfo } from "./types";

export interface AgentToolsDrawerProps {
  open: boolean;
  onClose(): void;
  /** Heading of the drawer. Defaults to "What agents can do here". */
  title?: string;
  /** Intro paragraph under the title. */
  description?: string;
  /**
   * Tools to list. Defaults to every tool registered through useWebMCPTool
   * inside the provider.
   */
  tools?: ToolInfo[];
  /** Which side the drawer slides in from. Defaults to "right". */
  side?: "left" | "right";
  /** Small label above each example prompt. Defaults to "Try asking". */
  exampleLabel?: string;
  /** Extra classes for the drawer panel. */
  className?: string;
  /** Extra classes for the backdrop overlay. */
  overlayClassName?: string;
}

function humanize(name: string): string {
  const words = name.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const DEFAULT_DESCRIPTION =
  "This page exposes tools an AI agent can use on your behalf. Actions are shown on the page while they run.";

/**
 * A full-height, margin-inset side drawer that explains the WebMCP tools
 * available on the page, with an example prompt for each.
 */
export function AgentToolsDrawer({
  open,
  onClose,
  title,
  description = DEFAULT_DESCRIPTION,
  tools,
  side = "right",
  exampleLabel = "Try asking",
  className,
  overlayClassName,
}: AgentToolsDrawerProps) {
  const experience = useOptionalWebMCPExperience();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const resolvedTools = tools ?? experience?.tools ?? [];
  const agentLabel = experience?.snapshot.agentLabel;
  const resolvedTitle = title ?? `What ${agentLabel ?? "agents"} can do here`;

  const backdropClasses = ["webmcp-exp-drawer-backdrop", overlayClassName]
    .filter(Boolean)
    .join(" ");
  const drawerClasses = [
    "webmcp-exp-drawer",
    `webmcp-exp-drawer--${side}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={backdropClasses} role="presentation" onMouseDown={onClose}>
      <aside
        className={drawerClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webmcp-exp-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="webmcp-exp-drawer__header">
          <h2 id="webmcp-exp-drawer-title">{resolvedTitle}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close tools info"
          >
            ×
          </button>
        </div>
        <p className="webmcp-exp-drawer__description">{description}</p>
        <div className="webmcp-exp-drawer__list">
          {resolvedTools.length === 0 ? (
            <p className="webmcp-exp-drawer__empty">No tools are registered on this page.</p>
          ) : (
            resolvedTools.map((tool) => (
              <article className="webmcp-exp-drawer__tool" key={tool.name}>
                <h3>{humanize(tool.name)}</h3>
                <p>{tool.description}</p>
                {tool.example ? (
                  <div className="webmcp-exp-drawer__example">
                    <div className="webmcp-exp-drawer__example-inner">
                      <small>{exampleLabel}</small>
                      <span className="webmcp-exp-bubble">{tool.example}</span>
                    </div>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
