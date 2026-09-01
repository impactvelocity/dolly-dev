"use client";

import { useEffect } from "react";

const PATTERN = /openai|chatgpt|atlas|agent|mcp|model|codex|oai/i;

function matchingKeys(target: object | undefined | null): string[] {
  if (!target) return [];
  const keys = new Set<string>();
  try {
    for (const key of Object.getOwnPropertyNames(target)) {
      if (PATTERN.test(key)) keys.add(key);
    }
  } catch {
    // ignore
  }
  try {
    // Walk the prototype chain too — injected APIs often live on prototypes.
    let proto = Object.getPrototypeOf(target);
    while (proto && proto !== Object.prototype) {
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (PATTERN.test(key)) keys.add(key);
      }
      proto = Object.getPrototypeOf(proto);
    }
  } catch {
    // ignore
  }
  return [...keys].sort();
}

function describe(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  const type = typeof value;
  if (type === "function") return "function";
  if (type === "object") {
    try {
      return `object keys=[${Object.getOwnPropertyNames(value as object).join(", ")}]`;
    } catch {
      return "object";
    }
  }
  return `${type}: ${String(value)}`;
}

export function DebugProbe() {
  useEffect(() => {
    const run = async () => {
      const nav = navigator as Navigator & {
        userAgentData?: {
          brands?: { brand: string; version: string }[];
          mobile?: boolean;
          platform?: string;
          getHighEntropyValues?(hints: string[]): Promise<Record<string, unknown>>;
        };
      };
      const win = window as unknown as Window & Record<string, unknown>;

      const report: Record<string, unknown> = {
        userAgent: nav.userAgent,
        vendor: nav.vendor,
        platform: nav.platform,
        webdriver: nav.webdriver,
        languages: nav.languages,
        userAgentDataBrands: nav.userAgentData?.brands ?? null,
        userAgentDataPlatform: nav.userAgentData?.platform ?? null,
        userAgentDataMobile: nav.userAgentData?.mobile ?? null,
        windowKeysMatching: matchingKeys(win),
        navigatorKeysMatching: matchingKeys(nav),
        documentKeysMatching: matchingKeys(document),
        documentModelContext: describe((document as Document & { modelContext?: unknown }).modelContext),
        navigatorModelContext: describe((nav as unknown as { modelContext?: unknown }).modelContext),
        windowOpenai: describe(win["openai"]),
        windowChatgpt: describe(win["chatgpt"]),
        referrer: document.referrer,
        locationHref: location.href,
        isTopFrame: window === window.top,
        hasChromeObject: "chrome" in win,
        pluginsLength: nav.plugins?.length ?? null,
        maxTouchPoints: nav.maxTouchPoints,
        screen: `${screen.width}x${screen.height} avail=${screen.availWidth}x${screen.availHeight} dpr=${window.devicePixelRatio}`,
      };

      try {
        const highEntropy = await nav.userAgentData?.getHighEntropyValues?.([
          "architecture",
          "bitness",
          "brands",
          "fullVersionList",
          "model",
          "platform",
          "platformVersion",
          "uaFullVersion",
        ]);
        report.userAgentDataHighEntropy = highEntropy ?? null;
      } catch (error) {
        report.userAgentDataHighEntropy = `error: ${String(error)}`;
      }

      try {
        const response = await fetch("/api/echo-headers", { cache: "no-store" });
        const body = (await response.json()) as { headers: Record<string, string> };
        report.requestHeaders = body.headers;
      } catch (error) {
        report.requestHeaders = `error: ${String(error)}`;
      }

      console.log("[webmcp-probe] copy the JSON below:");
      console.log(JSON.stringify(report, null, 2));
    };

    void run();
  }, []);

  return null;
}
