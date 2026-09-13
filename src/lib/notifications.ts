import type { Ticket } from "./types";

const STORAGE_KEY = "seenTicketStatus";

function readSeenMap(): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSeenMap(map: Record<number, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export interface TicketNotification {
  ticketId: number;
  title: string;
  status: string;
}


export function getUnseenNotifications(tickets: Ticket[]): TicketNotification[] {
  const seen = readSeenMap();
  return tickets
    .filter((t) => (seen[t.id] ?? "Open") !== t.status)
    .map((t) => ({ ticketId: t.id, title: t.title, status: t.status }));
}


export function markTicketSeen(ticket: Ticket) {
  const seen = readSeenMap();
  seen[ticket.id] = ticket.status;
  writeSeenMap(seen);
}


export function markAllSeen(tickets: Ticket[]) {
  const seen = readSeenMap();
  tickets.forEach((t) => { seen[t.id] = t.status; });
  writeSeenMap(seen);
}