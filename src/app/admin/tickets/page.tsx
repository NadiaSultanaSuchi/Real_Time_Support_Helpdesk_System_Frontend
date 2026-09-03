"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: number;
    email?: string;
  };
  assignee?: {
    id?: number;
    email?: string;
  };
};

type TicketResponse = {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [error, setError] = useState("");

  /* ---------------- Get Tickets ---------------- */

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get<TicketResponse>(
        `${API_URL}/tickets`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },

          params: {
            status:
              statusFilter === "ALL"
                ? undefined
                : statusFilter,

            priority:
              priorityFilter === "ALL"
                ? undefined
                : priorityFilter,

            page,
            limit: 10,

            sortBy: "createdAt",
            order: "DESC",
          },
        }
      );

      setTickets(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load tickets."
        );
      } else {
        setError("Failed to load tickets.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Load Tickets ---------------- */

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, page]);

  /* ---------------- Ticket Action ---------------- */

  const handleAction = async (
    ticketId: number,
    action: "accept" | "escalate" | "close"
  ) => {
    try {
      setActionLoading(ticketId);
      setError("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("You are not logged in.");
        return;
      }

      await axios.patch(
        `${API_URL}/tickets/${ticketId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Reload tickets after action
      await fetchTickets();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            `Failed to ${action} ticket.`
        );
      } else {
        setError(`Failed to ${action} ticket.`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  /* ---------------- Search ---------------- */

  const filteredTickets = tickets.filter((ticket) => {
    const searchText = search.toLowerCase();

    return (
      ticket.title.toLowerCase().includes(searchText) ||
      String(ticket.id).includes(searchText) ||
      ticket.customer?.email
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tickets
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage and monitor all support tickets.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <SummaryCard
          title="Tickets"
          value={tickets.length}
          description="Current page"
        />

        <SummaryCard
          title="Open"
          value={
            tickets.filter(
              (ticket) =>
                ticket.status.toUpperCase() === "OPEN"
            ).length
          }
          description="Waiting for action"
        />

        <SummaryCard
          title="In Progress"
          value={
            tickets.filter(
              (ticket) =>
                ticket.status.toUpperCase() ===
                "IN_PROGRESS"
            ).length
          }
          description="Currently assigned"
        />

        <SummaryCard
          title="Urgent"
          value={
            tickets.filter(
              (ticket) =>
                ticket.priority.toUpperCase() ===
                "URGENT"
            ).length
          }
          description="Needs attention"
        />

      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by ticket ID, title or customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="Open">
              Open
            </option>

            <option value="InProgress">
              In Progress
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPage(1);
              setPriorityFilter(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Priorities
            </option>

            <option value="Urgent">
              Urgent
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ticket
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned To
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (

                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Ticket */}
                    <td className="px-6 py-4">

                      <p className="text-xs font-semibold text-blue-600">
                        #{ticket.id}
                      </p>

                      <p className="mt-1 max-w-xs font-medium text-slate-900">
                        {ticket.title}
                      </p>

                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">

                      <span className="text-sm text-slate-700">
                        {ticket.customer?.email ||
                          "Unknown"}
                      </span>

                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <PriorityBadge
                        priority={ticket.priority}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={ticket.status}
                      />
                    </td>

                    {/* Assignee */}
                    <td className="px-6 py-4">

                      <span
                        className={
                          !ticket.assignee
                            ? "text-sm italic text-slate-400"
                            : "text-sm text-slate-700"
                        }
                      >
                        {ticket.assignee?.email ||
                          "Unassigned"}
                      </span>

                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {ticket.createdAt
                        ? new Date(
                            ticket.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        {/* Accept */}
                        {!isClosed(ticket) &&
                          !ticket.assignee && (
                            <button
                              onClick={() =>
                                handleAction(
                                  ticket.id,
                                  "accept"
                                )
                              }
                              disabled={
                                actionLoading ===
                                ticket.id
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              {actionLoading ===
                              ticket.id
                                ? "..."
                                : "Accept"}
                            </button>
                          )}

                        {/* Escalate */}
                        {!isClosed(ticket) &&
                          !isUrgent(ticket) && (
                            <button
                              onClick={() =>
                                handleAction(
                                  ticket.id,
                                  "escalate"
                                )
                              }
                              disabled={
                                actionLoading ===
                                ticket.id
                              }
                              className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100 disabled:opacity-50"
                            >
                              Escalate
                            </button>
                          )}

                        {/* Close */}
                        {!isClosed(ticket) && (
                          <button
                            onClick={() =>
                              handleAction(
                                ticket.id,
                                "close"
                              )
                            }
                            disabled={
                              actionLoading ===
                              ticket.id
                            }
                            className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            Close
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

        <p className="text-sm text-slate-500">
          Page{" "}
          <span className="font-medium text-slate-900">
            {page}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900">
            {totalPages}
          </span>
        </p>

        <div className="flex gap-2">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
            {page}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      </div>

    </div>
  );
}

/* ---------------- Helpers ---------------- */

function isClosed(ticket: Ticket) {
  return ticket.status.toUpperCase() === "CLOSED";
}

function isUrgent(ticket: Ticket) {
  return ticket.priority.toUpperCase() === "URGENT";
}

/* ---------------- Summary Card ---------------- */

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* ---------------- Priority Badge ---------------- */

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const value = priority.toUpperCase();

  const styles: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {priority}
    </span>
  );
}

/* ---------------- Status Badge ---------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const value = status.toUpperCase();

  const styles: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    ESCALATED: "bg-red-100 text-red-700",
    CLOSED: "bg-emerald-100 text-emerald-700",
  };

  const labels: Record<string, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    ESCALATED: "Escalated",
    CLOSED: "Closed",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[value] || status}
    </span>
  );
}
