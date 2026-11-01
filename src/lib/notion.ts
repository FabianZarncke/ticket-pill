/**
 * Notion Ticket Integration Client
 * Reads credentials dynamically from host environment (process.env.NOTION_API_KEY).
 */

export interface CreateTicketInput {
  title: string;
  description?: string;
  project?: string;
  moduleName?: string;
  route?: string;
  sourceFile?: string;
  selector?: string;
  snippet?: string;
}

export interface DevTicket {
  id: string;
  pageId: string;
  title: string;
  description: string;
  route: string;
  project: string;
  module: string;
  status: string;
  notionUrl: string;
  sourceFile?: string;
}

export const NOTION_VIEW_URLS: Record<string, string> = {
  "Roadmap Tool":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=406444b1daac81da8aca000cc2087e27",
  "roadmap-tool":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=406444b1daac81da8aca000cc2087e27",
  "Skaleo One":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=3ff444b1daac81c9b029000c81a7d04a",
  "skaleo-one":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=3ff444b1daac81c9b029000c81a7d04a",
  "one-crm":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=3ff444b1daac814e999e000c434b12e0",
  "ONE crm":
    "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=3ff444b1daac814e999e000c434b12e0",
};

export const DEFAULT_NOTION_BOARD_URL =
  "https://app.notion.com/p/0cd916d21e9b4b89a6f49821c83f104a?v=3ff444b1daac81ffb327000cdb6fcdb1";

export function getNotionViewUrl(project?: string): string {
  if (!project) return DEFAULT_NOTION_BOARD_URL;
  return NOTION_VIEW_URLS[project] || NOTION_VIEW_URLS[project.toLowerCase()] || DEFAULT_NOTION_BOARD_URL;
}

function getNotionCredentials() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID || "0cd916d2-1e9b-4b89-a6f4-9821c83f104a";

  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEY ist nicht in den Umgebungsvariablen (.env.local) konfiguriert."
    );
  }

  return { apiKey, databaseId };
}

async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const { apiKey } = getNotionCredentials();
  const url = `https://api.notion.com/v1/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Notion API Error [${res.status}]: ${errorBody}`);
  }

  return res.json();
}

function extractPlainText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title" && Array.isArray(prop.title)) {
    return prop.title.map((p: any) => p.plain_text || "").join("");
  }
  if (prop.type === "rich_text" && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((p: any) => p.plain_text || "").join("");
  }
  return "";
}

export async function getNextTicketId(): Promise<string> {
  const { databaseId } = getNotionCredentials();
  try {
    const data = await notionFetch(`databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100 }),
    });

    let maxNum = 0;
    for (const page of data.results || []) {
      const ticketIdText = extractPlainText(page.properties["Ticket ID"]);
      const match = ticketIdText.match(/^TICK-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `TICK-${String(maxNum + 1).padStart(3, "0")}`;
  } catch {
    return `TICK-${String(Date.now()).slice(-4)}`;
  }
}

export async function createTicketInNotion(data: CreateTicketInput): Promise<DevTicket> {
  const { databaseId } = getNotionCredentials();
  const ticketId = await getNextTicketId();
  const project = data.project || "Allgemein";
  const moduleName = data.moduleName?.trim() || "Allgemein";

  const properties: Record<string, any> = {
    Titel: {
      title: [{ text: { content: data.title } }],
    },
    "Ticket ID": {
      rich_text: [{ text: { content: ticketId } }],
    },
    Status: {
      status: { name: "Offen" },
    },
    Projekt: {
      select: { name: project },
    },
    Modul: {
      rich_text: [{ text: { content: moduleName } }],
    },
  };

  if (data.route) {
    properties["Route"] = { rich_text: [{ text: { content: data.route } }] };
  }
  if (data.sourceFile) {
    properties["Quellcode"] = { rich_text: [{ text: { content: data.sourceFile } }] };
  }
  if (data.selector) {
    properties["Element"] = { rich_text: [{ text: { content: data.selector } }] };
  }
  if (data.snippet) {
    properties["Snippet"] = { rich_text: [{ text: { content: data.snippet.slice(0, 2000) } }] };
  }

  // Children blocks: Pure user description only
  const children: any[] = [];
  if (data.description && data.description.trim()) {
    children.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: data.description.trim() } }],
      },
    });
  }

  const result = await notionFetch("pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
      children,
    }),
  });

  return {
    id: ticketId,
    pageId: result.id,
    title: data.title,
    description: data.description || "",
    route: data.route || "",
    project,
    module: moduleName,
    status: "open",
    notionUrl: result.url,
    sourceFile: data.sourceFile,
  };
}

export async function fetchTicketsFromNotion(projectFilter?: string): Promise<DevTicket[]> {
  const { databaseId } = getNotionCredentials();
  const queryBody: Record<string, any> = {
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 50,
  };

  if (projectFilter) {
    queryBody.filter = {
      property: "Projekt",
      select: { equals: projectFilter },
    };
  }

  const data = await notionFetch(`databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify(queryBody),
  });

  return (data.results || []).map((page: any) => ({
    id: extractPlainText(page.properties["Ticket ID"]) || page.id,
    pageId: page.id,
    title: extractPlainText(page.properties["Titel"]),
    description: "",
    route: extractPlainText(page.properties["Route"]),
    project: page.properties["Projekt"]?.select?.name || "Allgemein",
    module: extractPlainText(page.properties["Modul"]) || "Allgemein",
    status: page.properties["Status"]?.status?.name || "Offen",
    notionUrl: page.url,
    sourceFile: extractPlainText(page.properties["Quellcode"]),
  }));
}

export async function updateTicketStatusInNotion(pageId: string, statusName: string): Promise<void> {
  await notionFetch(`pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        Status: { status: { name: statusName } },
      },
    }),
  });
}
