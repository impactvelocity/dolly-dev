export const DEFAULT_CONNECTION_PARAM = "webmcpconnected";
export const DEFAULT_STORAGE_KEY = "webmcp:gpt-connection:v1";
export const DEFAULT_DEEPLINK_BASE = "https://chatgpt.com/codex/deeplink";

export interface ChatGPTDeeplinkOptions {
  connectionParam?: string;
  deeplinkBase?: string;
}

export function createChatGPTDeeplink(
  targetUrl: string,
  options: ChatGPTDeeplinkOptions = {},
): string {
  const connectionParam = options.connectionParam ?? DEFAULT_CONNECTION_PARAM;
  const deeplinkBase = options.deeplinkBase ?? DEFAULT_DEEPLINK_BASE;
  const target = new URL(targetUrl);
  target.searchParams.set(connectionParam, "true");

  const deeplink = new URL(deeplinkBase);
  deeplink.searchParams.set("url", target.toString());
  return deeplink.toString();
}
