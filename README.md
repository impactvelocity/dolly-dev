# WebMCP Experience SDK

A React-first experience layer for WebMCP. It helps people understand when a
browser agent is available, what it can do, what it is currently doing, and
which part of the interface it is acting on.

This repository is a local proof of concept for the OpenAI WebMCP Challenge.

## Workspace

- `packages/experience` — the single shared React package
- `apps/dolly` — dolly.dev, the film-styled SDK marketing site on port 3002
- `apps/showcase` — editorial SDK example on port 3000
- `apps/console` — mock CRM example on port 3001
- `packages/typescript-config` — workspace-only TypeScript configuration

## Run it

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000` or `http://localhost:3001`. To preview the
ChatGPT handshake and onboarding locally, append `?webmcpconnected=true`.

## Package setup

Import the package and its stylesheet once near the root of a React app:

```tsx
import {
  WebMCPExperienceProvider,
  OpenInButton,
} from "@webmcp-sdk/experience";
import "@webmcp-sdk/experience/styles.css";

const capabilities = [
  {
    title: "Search products",
    description: "Find products using natural-language constraints.",
  },
  {
    title: "Manage the cart",
    description: "Add or remove products while keeping the cart visible.",
  },
];

export function App({ children }: { children: React.ReactNode }) {
  return (
    <WebMCPExperienceProvider
      appName="Example Store"
      capabilities={capabilities}
    >
      <OpenInButton agent="openai" />
      {children}
    </WebMCPExperienceProvider>
  );
}
```

## Register a tool with visible work states

The application author controls the visible lifecycle from the tool's
`execute` function:

```tsx
import {
  useWebMCPExperience,
  useWebMCPTool,
} from "@webmcp-sdk/experience";

export function CartTools() {
  const experience = useWebMCPExperience();

  useWebMCPTool({
    name: "add_to_cart",
    description: "Add a product to the active cart",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "string" } },
      required: ["productId"],
    },
    async execute({ productId }: { productId: string }) {
      experience.startWork("Adding the product…");
      experience.focus("#cart", "Updating your cart…");

      try {
        await addToCart(productId);
        experience.endWork("Product added to the cart");
        return { content: [{ type: "text", text: "Added to cart" }] };
      } catch (error) {
        experience.failWork("The cart could not be updated");
        throw error;
      }
    },
  });

  return null;
}
```

## Open in an agent

`OpenInButton` owns the agent deeplink. OpenAI is the currently supported
agent:

```tsx
<OpenInButton agent="openai" />
```

It opens:

```text
https://chatgpt.com/codex/deeplink?url=<encoded destination>
```

The destination includes `webmcpconnected=true`. On arrival, the provider:

1. Stores a versioned connection hint in localStorage for that browser profile.
2. Removes the query parameter from the visible URL.
3. Opens the capability onboarding dialog.

This is an explicit UX handshake, not a security or identity signal. Native
WebMCP support is detected separately through `document.modelContext`, with a
temporary `navigator.modelContext` compatibility fallback.

## Validate

```bash
pnpm build
pnpm check-types
pnpm lint
pnpm test
```

## License

MIT
