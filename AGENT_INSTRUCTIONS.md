# Coding Agent Instructions: Integrating `ticket-pill`

Follow these instructions to integrate `ticket-pill` into a Next.js (App Router) project.

---

### Step 1: Install the Package
Run in the project root:
```bash
npm install github:fabianzarncke/ticket-pill
# Or for local development:
# npm install file:../ticket-pill
```

---

### Step 2: Create the Next.js API Route
Create the file `src/app/api/dev-tickets/route.ts` (or `app/api/dev-tickets/route.ts`):
```ts
import { createDevTicketHandler } from "ticket-pill/server";

export const { GET, POST, PATCH } = createDevTicketHandler({
  defaultProject: "My Project Name", // Optional: fallback project name
});
```

---

### Step 3: Add `DevOverlay` to the Root Layout
In `src/app/layout.tsx` (or `app/layout.tsx`):
1. Import the component and styles:
```tsx
import { DevOverlay } from "ticket-pill";
import "ticket-pill/styles.css";
```
2. Place the component inside `<body>`:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        {process.env.NODE_ENV !== "production" && (
          <DevOverlay
            project="My Project Name"
            accentColor="#6366f1" // Customize to match brand color (e.g. #c3e600)
          />
        )}
      </body>
    </html>
  );
}
```

---

### Step 4: Environment Variables (`.env.local`)
Ensure the target project has `.env.local` configured with the Notion credentials:
```env
NOTION_API_KEY=ntn_your_api_key_here
NOTION_DATABASE_ID=0cd916d2-1e9b-4b89-a6f4-9821c83f104a
```
*(Note: Never commit `.env.local` to Git).*

---

### Security & Production Guard Summary
* **Localhost only:** The overlay checks `window.location.hostname` and will only render on `localhost`, `127.0.0.1`, `*.localhost` or `*.local`.
* **Zero bundle in production:** When built with `next build`, `process.env.NODE_ENV === "production"` removes the component entirely.
* **API Route blocked outside localhost:** `/api/dev-tickets` rejects any request from outside localhost with `404 Not Found`.
