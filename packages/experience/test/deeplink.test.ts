import assert from "node:assert/strict";
import test from "node:test";

import { createChatGPTDeeplink } from "../src/deeplink";

test("creates an encoded ChatGPT deeplink with the connection handshake", () => {
  const result = new URL(createChatGPTDeeplink("https://example.com/products?category=books"));
  const target = new URL(result.searchParams.get("url") ?? "");

  assert.equal(result.origin, "https://chatgpt.com");
  assert.equal(result.pathname, "/codex/deeplink");
  assert.equal(target.searchParams.get("category"), "books");
  assert.equal(target.searchParams.get("webmcpconnected"), "true");
});
