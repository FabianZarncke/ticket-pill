import {
  createTicketInNotion,
  fetchTicketsFromNotion,
  isLocalhostServer,
  updateTicketStatusInNotion
} from "./chunk-FRX46ESE.js";

// src/server.ts
function createDevTicketHandler(options = {}) {
  const notAvailableResponse = () => Response.json(
    { error: "Endpoint nur in lokaler Entwicklung (localhost) verf\xFCgbar." },
    { status: 404 }
  );
  async function POST(req) {
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
        project: body.project || options.defaultProject || "Allgemein"
      });
      return Response.json(ticket, { status: 201 });
    } catch (err) {
      console.error("[ticket-pill /api/dev-tickets] POST Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Erstellen des Tickets in Notion" },
        { status: 500 }
      );
    }
  }
  async function GET(req) {
    if (process.env.NODE_ENV === "production" || !isLocalhostServer(req)) {
      return notAvailableResponse();
    }
    try {
      const url = new URL(req.url);
      const project = url.searchParams.get("project") || options.defaultProject;
      const tickets = await fetchTicketsFromNotion(project || void 0);
      return Response.json({ tickets });
    } catch (err) {
      console.error("[ticket-pill /api/dev-tickets] GET Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Abrufen der Tickets" },
        { status: 500 }
      );
    }
  }
  async function PATCH(req) {
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
    } catch (err) {
      console.error("[ticket-pill /api/dev-tickets] PATCH Error:", err);
      return Response.json(
        { error: err.message || "Fehler beim Aktualisieren des Tickets" },
        { status: 500 }
      );
    }
  }
  return { GET, POST, PATCH };
}
export {
  createDevTicketHandler
};
//# sourceMappingURL=server.js.map