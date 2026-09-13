export type Role = "Admin" | "Manager" | "Customer";
export interface JwtPayload { sub: number; email: string; role: Role }
export type TicketStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Profile {
  id: number;
  email: string;
  role: Role;
  name: string | null;
  contactNumber: string | null;
}