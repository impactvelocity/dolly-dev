"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface DevConfig {
  /** Render the floating AgentStatusBadge. */
  showBadge: boolean;
  /** Render the AgentStatusHeader bar. */
  showHeader: boolean;
  /**
   * Reflect live progress text in the header while work runs. When off the
   * header keeps its static connection label ("Agent Connected").
   */
  headerProgressText: boolean;
  /** Show the history affordance + drawer in the header. */
  showHistory: boolean;
  /** Show the glow overlay for every work step, not just opted-in ones. */
  generalLoading: boolean;
  /** Show the toast announcing what happened when work settles. */
  endingToast: boolean;
  /** Dim the page around focus()ed elements. */
  highlightFocus: boolean;
  mode: "light" | "dark";
  brandColor: string;
  /** Gradient stops for the working glow overlay. */
  glowColors: string[];
  /** Outline color of the focused element. */
  highlightColor: string;
  highlightOverlayColor: string;
  highlightOverlayOpacity: number;
}

// Defaults mirror the SDK's built-in appearance (see packages/experience
// styles.css) plus the highlight config the console shipped with.
export const DEFAULT_DEV_CONFIG: DevConfig = {
  showBadge: true,
  showHeader: true,
  headerProgressText: true,
  showHistory: true,
  generalLoading: false,
  endingToast: true,
  highlightFocus: true,
  mode: "light",
  brandColor: "#ec4899",
  glowColors: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b"],
  highlightColor: "#ec4899",
  highlightOverlayColor: "#000000",
  highlightOverlayOpacity: 0.15,
};

const STORAGE_KEY = "webmcp-console-dev-config";

export interface DevConfigApi {
  config: DevConfig;
  update(patch: Partial<DevConfig>): void;
  reset(): void;
}

const DevConfigContext = createContext<DevConfigApi | null>(null);

function readStoredConfig(): Partial<DevConfig> | null {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsed: unknown = JSON.parse(rawValue);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<DevConfig>)
      : null;
  } catch {
    return null;
  }
}

function persistConfig(config: DevConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage can be unavailable in hardened or private browsing contexts.
  }
}

export function DevConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DevConfig>(DEFAULT_DEV_CONFIG);

  // Stored config is applied after mount so the server and client render
  // the same initial tree.
  useEffect(() => {
    const stored = readStoredConfig();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage can only be read after mount; the initial render must match the server.
    if (stored) setConfig({ ...DEFAULT_DEV_CONFIG, ...stored });
  }, []);

  const update = useCallback((patch: Partial<DevConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch };
      persistConfig(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_DEV_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore — nothing to clean up if storage is unavailable.
    }
  }, []);

  const api = useMemo(() => ({ config, update, reset }), [config, update, reset]);

  return <DevConfigContext value={api}>{children}</DevConfigContext>;
}

export function useDevConfig(): DevConfigApi {
  const context = useContext(DevConfigContext);
  if (!context) {
    throw new Error("useDevConfig must be used inside DevConfigProvider");
  }
  return context;
}
