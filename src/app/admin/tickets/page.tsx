"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  description?: string;

  status: string;
  priority: string;

  isEscalated?: boolean;
  escalatedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  customer?: {
    id?: number;
    email?: string;
  };

  assignee?: {
    id?: number;
    email?: string;
  } | null;

  product?: {
    id?: number;
    name?: string;
  } | null;
};

type TicketResponse = {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [priorityFilter, setPriorityFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalTickets, setTotalTickets] =
    useState(0);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  // =========================
  // FETCH TICKETS
  // =========================

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem(
          "accessToken"
        );

      if (!accessToken) {
        setError(
          "You are not logged in."
        );
        return;
      }

      const response =
        await axios.get<TicketResponse>(
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

      setTickets(
        response.data.data
      );

      setTotalPages(
        response.data.totalPages
      );

      setTotalTickets(
        response.data.total
      );
    } catch (err: any) {
      console.error(
        "Error loading tickets:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [
    statusFilter,
    priorityFilter,
    page,
  ]);

  // =========================
  // TICKET ACTION
  // =========================

  const performAction = async (
    ticketId: number,
    action:
      | "accept"
      | "escalate"
      | "close"
  ) => {
    try {
      setActionLoading(ticketId);
      setError("");

      const accessToken =
        localStorage.getItem(
          "accessToken"
        );

      if (!accessToken) {
        setError(
          "You are not logged in."
        );
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

      await fetchTickets();
    } catch (err: any) {
      console.error(
        `Error performing ${action}:`,
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `Failed to ${action} ticket.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredTickets =
    tickets.filter((ticket) => {
      const value =
        search.toLowerCase();

      return (
        ticket.title
          ?.toLowerCase()
          .includes(value) ||
        ticket.customer?.email
          ?.toLowerCase()
          .includes(value) ||
        ticket.product?.name
          ?.toLowerCase()
          .includes(value) ||
        String(ticket.id).includes(
          value
        )
      );
    });

  // =========================
  // HELPERS
  // =========================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  const getPriorityClass = (
    priority: string
  ) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-orange-100 text-orange-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-700";

      case "InProgress":
        return "bg-purple-100 text-purple-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      case "Closed":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tickets
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor all support tickets.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Tickets
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalTickets}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Open
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {
              tickets.filter(
                (ticket) =>
                  ticket.status === "Open"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-bold text-purple-600">
            {
              tickets.filter(
                (ticket) =>
                  ticket.status ===
                  "InProgress"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Urgent
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {
              tickets.filter(
                (ticket) =>
                  ticket.priority ===
                  "Urgent"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search ticket, customer or product..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value
                );
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

              <option value="Resolved">
                Resolved
              </option>

              <option value="Closed">
                Closed
              </option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(
                  e.target.value
                );
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">
                All Priorities
              </option>

              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading tickets...
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              No tickets found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ticket
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Priority
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Assigned To
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">

                {filteredTickets.map(
                  (ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50"
                    >

                      {/* Ticket */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div>
                            <p className="text-xs text-gray-500">
                              #{ticket.id}
                            </p>

                            <p className="max-w-[220px] truncate font-medium text-gray-900">
                              {ticket.title}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Customer */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <p className="text-sm text-gray-700">
                          {ticket.customer?.email ||
                            "Unknown"}
                        </p>

                      </td>

                      {/* Product */}
                      <td className="whitespace-nowrap px-6 py-4">

                        {ticket.product ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {ticket.product.name}
                            </p>

                            {ticket.product.id && (
                              <p className="text-xs text-gray-500">
                                ID:{" "}
                                {ticket.product.id}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No product
                          </span>
                        )}

                      </td>

                      {/* Priority */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>

                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status ===
                          "InProgress"
                            ? "In Progress"
                            : ticket.status}
                        </span>

                      </td>

                      {/* Assigned */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <span className="text-sm text-gray-700">
                          {ticket.assignee?.email ||
                            "Unassigned"}
                        </span>

                      </td>

                      {/* Created */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <span className="text-sm text-gray-600">
                          {formatDate(
                            ticket.createdAt
                          )}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* View */}
                          <Link
                            href={`/admin/tickets/${ticket.id}`}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            View
                          </Link>

                          {/* Accept */}
                          {ticket.status !==
                            "Closed" && (
                            <button
                              onClick={() =>
                                performAction(
                                  ticket.id,
                                  "accept"
                                )
                              }
                              disabled={
                                actionLoading ===
                                ticket.id
                              }
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading ===
                              ticket.id
                                ? "..."
                                : "Accept"}
                            </button>
                          )}

                          {/* Escalate */}
                          {ticket.status !==
                            "Closed" &&
                            !ticket.isEscalated && (
                              <button
                                onClick={() =>
                                  performAction(
                                    ticket.id,
                                    "escalate"
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  ticket.id
                                }
                                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Escalate
                              </button>
                            )}

                          {/* Close */}
                          {ticket.status !==
                            "Closed" && (
                            <button
                              onClick={() =>
                                performAction(
                                  ticket.id,
                                  "close"
                                )
                              }
                              disabled={
                                actionLoading ===
                                ticket.id
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>

          </div>
        )}

      </div>

      {/* Pagination */}
      {!loading &&
        totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-medium text-gray-900">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {totalPages}
              </span>
            </p>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
                disabled={
                  page === totalPages
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </div>
        )}

    </div>
  );
}