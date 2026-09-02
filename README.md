# Dolly.dev

`@dolly/rig` is a React-first rig for WebMCP — a nod to the camera. It helps
people understand when a
browser agent is available, what it can do, what it is currently doing, and
which part of the interface it is acting on.

This repository is a local proof of concept for the OpenAI WebMCP Challenge.

**Try it live:**

- [dolly.dev](https://dolly.dev) — the SDK marketing site
- [dollycrm.app](https://dollycrm.app) — the demo CRM, a mock app built with
  the rig so you can test the WebMCP experience end to end

> **Note:** The SDK lives in `packages/rig` inside this workspace — it is not
> published to npm yet. This project is exploring what best practices (or at
> least good ideas) could look like for surfacing WebMCP actions in
> multiplayer, where a person and a browser agent share the same interface.

## Workspace

- `packages/rig` — `@dolly/rig`, the single shared React package
- `apps/dolly` — dolly.dev, the film-styled SDK marketing site on port 3002
- `apps/console` — dollycrm.app, the mock CRM example on port 3001
- `packages/typescript-config` — workspace-only TypeScript configuration

## Run it

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3001` for the CRM or `http://localhost:3002` for
the marketing site. To preview the ChatGPT handshake and onboarding locally,
append `?webmcpconnected=true`.

## Package setup

Import the package and its stylesheet once near the root of a React app:

```tsx
import {
  RigProvider,
  OpenInButton,
} from "@dolly/rig";
import "@dolly/rig/styles.css";

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
    <RigProvider
      appName="Example Store"
      capabilities={capabilities}
    >
      <OpenInButton agent="openai" />
      {children}
    </RigProvider>
  );
}
```

## Register a tool with visible work states

The application author controls the visible lifecycle from the tool's
`execute` function:

```tsx
import {
  useRig,
  useWebMCPTool,
} from "@dolly/rig";

export function CartTools() {
  const rig = useRig();

  useWebMCPTool({
    name: "add_to_cart",
    description: "Add a product to the active cart",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "string" } },
      required: ["productId"],
    },
    async execute({ productId }: { productId: string }) {
      rig.startWork("Adding the product…");
      rig.focus("#cart", "Updating your cart…");

      try {
        await addToCart(productId);
        rig.endWork("Product added to the cart");
        return { content: [{ type: "text", text: "Added to cart" }] };
      } catch (error) {
        rig.failWork("The cart could not be updated");
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
