/**
 * Server Route Handler for Next.js App Router
 * Usage in app/api/dev-tickets/route.ts:
 *
 * import { createDevTicketHandler } from "ticket-pill/server";
 * export const { GET, POST, PATCH } = createDevTicketHandler();
 */
interface DevTicketHandlerOptions {
    defaultProject?: string;
}
declare function createDevTicketHandler(options?: DevTicketHandlerOptions): {
    GET: (req: Request) => Promise<Response>;
    POST: (req: Request) => Promise<Response>;
    PATCH: (req: Request) => Promise<Response>;
};

export { type DevTicketHandlerOptions, createDevTicketHandler };
