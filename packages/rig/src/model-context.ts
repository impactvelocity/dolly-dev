import type { ModelContextLike } from "./types";

export function getModelContext(): ModelContextLike | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.modelContext ?? navigator.modelContext ?? null;
}
