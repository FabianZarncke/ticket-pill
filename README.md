# 💊 ticket-pill

Standardized floating Dev Ticket & Review Overlay for Next.js connected directly to Notion.

Designed for modern development pair-programming with AI Coding Agents (Google Antigravity, Cursor, Claude Code).

---

## Features
- 🎯 **Review Mode Inspector:** Click any UI element to capture its React Component name, source file (`src/components/...:42`), and CSS selector.
- 🎨 **Brand Theming:** Customize the accent color or full palette (`accentColor="#c3e600"`).
- 🔒 **Zero Credentials in Repo:** API keys are never stored in the package or tracked in Git — strictly provided via the host's `.env.local`.
- 🛡️ **100% Localhost Only:** Automatically disabled in production builds and blocked on remote domains.
- 📦 **Autarkic Styles:** Pre-compiled CSS with CSS variables (`ticket-pill/styles.css`), works seamlessly with Tailwind v3, Tailwind v4, or vanilla CSS.

---

## Quickstart

### 1. Install
```bash
npm install github:fabianzarncke/ticket-pill
```

### 2. Add API Route (`src/app/api/dev-tickets/route.ts`)
```ts
import { createDevTicketHandler } from "ticket-pill/server";

export const { GET, POST, PATCH } = createDevTicketHandler({
  defaultProject: "Skaleo One",
});
```

### 3. Add to Root Layout (`src/app/layout.tsx`)
```tsx
import { DevOverlay } from "ticket-pill";
import "ticket-pill/styles.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        {process.env.NODE_ENV !== "production" && (
          <DevOverlay project="Skaleo One" accentColor="#c3e600" />
        )}
      </body>
    </html>
  );
}
```

---

## Documentation for AI Agents
See [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) for full instructions formatted specifically for coding agents.
