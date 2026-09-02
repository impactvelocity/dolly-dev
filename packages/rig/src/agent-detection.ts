import { getModelContext } from "./model-context";

export type AgentBrand = "chatgpt" | "unknown";

export interface DetectedAgent {
  brand: AgentBrand;
  label: string | null;
}

const NO_AGENT: DetectedAgent = { brand: "unknown", label: null };

/**
 * Identify which agent browser injected the WebMCP bridge.
 *
 * The ChatGPT browser exposes a perfectly generic user agent and request
 * headers, so the only reliable signals are the globals it injects:
 * `window.__codexWebMcpModelContext` and the `codex*`-prefixed methods on
 * `document.modelContext`.
 */
export function detectAgent(): DetectedAgent {
  if (typeof window === "undefined") {
    return NO_AGENT;
  }

  const injectedCodexGlobal = "__codexWebMcpModelContext" in window;
  const modelContext = getModelContext();
  const codexMethods =
    modelContext !== null &&
    ("codexExecuteTool" in modelContext || "codexGetTools" in modelContext);

  if (injectedCodexGlobal || codexMethods) {
    return { brand: "chatgpt", label: "ChatGPT" };
  }

  return NO_AGENT;
}
