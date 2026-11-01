/**
 * Server Route Handler for Next.js App Router
 * Usage in app/api/dev-tickets/route.ts:
 *
 * import { createDevTicketHandler } from "ticket-pill/server";
 * export const { GET, POST, PATCH } = createDevTicketHandler();
 */

import { isLocalhostServer } from "./lib/guard";
import {
  createTicketInNotion,
  fetchTicketsFromNotion,
  updateTicketStatusInNotion,
} from "./lib/notion";

export interface DevTicketHandlerOptions {
  defaultProject?: string;
}

export function createDevTicketHandler(options: DevTicketHandlerOptions = {}) {
  const notAvailableResponse = () =>
    Response.json(
      { error: "Endpoint nur in lokaler Entwicklung (localhost) verfügbar." },
      { status: 404 }
    );

  async function POST(req: Request) {
    if (process.env.NODE_ENV === "production" || !isLocalhostServer(req)) {
      return notAvailableResponse();
    }

    try {
      const body = await req.json();
      if (!body.title) {
        return Response.json({ error: "Titel ist erforderlich" }, { status: 400 });
      }

      const ticket = await createTicketInNotion({
        ...body,
        project: body.project || options.defaultProject || "Allgemein",
      });

      return Response.json(ticket, { status: 201 });
    } catch (err: any) {
      console.error("[ticket-pill /api/dev-tickets] POST Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Erstellen des Tickets in Notion" },
        { status: 500 }
      );
    }
  }

  async function GET(req: Request) {
    if (process.env.NODE_ENV === "production" || !isLocalhostServer(req)) {
      return notAvailableResponse();
    }

    try {
      const url = new URL(req.url);
      const project = url.searchParams.get("project") || options.defaultProject;
      const tickets = await fetchTicketsFromNotion(project || undefined);
      return Response.json({ tickets });
    } catch (err: any) {
      console.error("[ticket-pill /api/dev-tickets] GET Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Abrufen der Tickets" },
        { status: 500 }
      );
    }
  }

  async function PATCH(req: Request) {
    if (process.env.NODE_ENV === "production" || !isLocalhostServer(req)) {
      return notAvailableResponse();
    }

    try {
      const body = await req.json();
      const { id, status } = body;
      if (!id || !status) {
        return Response.json({ error: "ID und Status sind erforderlich" }, { status: 400 });
      }

      await updateTicketStatusInNotion(id, status);
      return Response.json({ success: true, id, status });
    } catch (err: any) {
      console.error("[ticket-pill /api/dev-tickets] PATCH Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Aktualisieren des Tickets" },
        { status: 500 }
      );
    }
  }

  return { GET, POST, PATCH };
}
