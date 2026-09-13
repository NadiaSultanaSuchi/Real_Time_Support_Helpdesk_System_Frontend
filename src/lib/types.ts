export type Role = "Admin" | "Manager" | "Customer";
export interface JwtPayload { sub: number; email: string; role: Role }
export type TicketStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Product {
  id: number;
  name: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  rating: number | null;
  ratingComment: string | null;
  ratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product | null;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; name: string | null; email: string };
}

export interface Profile {
  id: number;
  email: string;
  role: Role;
  name: string | null;
  contactNumber: string | null;
}