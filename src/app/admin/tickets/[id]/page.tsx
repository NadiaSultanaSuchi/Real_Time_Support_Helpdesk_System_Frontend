"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Ticket = {
  id: number;

  title: string;

  description: string;

  status: string;

  priority: string;

  isEscalated: boolean;

  escalatedAt?: string | null;

  rating?: number | null;

  ratingComment?: string | null;

  ratedAt?: string | null;

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

const API_URL = "http://127.0.0.1:3000/api";

export default function TicketDetailsPage() {
  const params = useParams();

  const router = useRouter();

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const ticketId = params.id;

  // =========================
  // FETCH TICKET
  // =========================

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem(
          "accessToken"
        );

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      const response =
        await axios.get<Ticket>(
          `${API_URL}/tickets/${ticketId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      setTicket(response.data);
    } catch (err: any) {
      console.error(
        "Error loading ticket:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        router.replace("/login");
        return;
      }

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  // =========================
  // ACTION
  // =========================

  const performAction = async (
    action:
      | "accept"
      | "escalate"
      | "close"
  ) => {
    if (!ticket) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem(
          "accessToken"
        );

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      await axios.patch(
        `${API_URL}/tickets/${ticket.id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchTicket();
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
      setActionLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString();
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
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading ticket details...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !ticket) {
    return (
      <div className="p-6">

        <Link
          href="/admin/tickets"
          className="mb-5 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Tickets
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>

      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <Link
            href="/admin/tickets"
            className="mb-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Tickets
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Ticket #{ticket.id}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View complete ticket information.
          </p>

        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">

          {ticket.status !==
            "Closed" && (
            <>
              <button
                onClick={() =>
                  performAction("accept")
                }
                disabled={actionLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Accept
              </button>

              {!ticket.isEscalated && (
                <button
                  onClick={() =>
                    performAction(
                      "escalate"
                    )
                  }
                  disabled={actionLoading}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Escalate
                </button>
              )}

              <button
                onClick={() =>
                  performAction("close")
                }
                disabled={actionLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </>
          )}

        </div>

      </div>

      {/* Action Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Ticket Description */}
        <div className="lg:col-span-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 border-b border-gray-100 pb-5">

              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Ticket Title
              </p>

              <h2 className="text-xl font-semibold text-gray-900">
                {ticket.title}
              </h2>

            </div>

            <div>

              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </p>

              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                {ticket.description ||
                  "No description provided."}
              </div>

            </div>

          </div>

        </div>

        {/* Ticket Information */}
        <div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Ticket Information
            </h2>

            <div className="space-y-5">

              {/* Status */}
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status ===
                  "InProgress"
                    ? "In Progress"
                    : ticket.status}
                </span>

              </div>

              {/* Priority */}
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Priority
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>

              </div>

              {/* Product */}
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Product
                </p>

                {ticket.product ? (
                  <div className="mt-1">

                    <p className="font-medium text-gray-900">
                      {ticket.product.name ||
                        "Unnamed Product"}
                    </p>

                    {ticket.product.id && (
                      <p className="text-xs text-gray-500">
                        Product ID:{" "}
                        {ticket.product.id}
                      </p>
                    )}

                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">
                    No product assigned
                  </p>
                )}

              </div>

              {/* Customer */}
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Customer
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {ticket.customer?.email ||
                    "Unknown"}
                </p>

                {ticket.customer?.id && (
                  <p className="text-xs text-gray-500">
                    Customer ID:{" "}
                    {ticket.customer.id}
                  </p>
                )}

              </div>

              {/* Assignee */}
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Assigned To
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {ticket.assignee?.email ||
                    "Unassigned"}
                </p>

                {ticket.assignee?.id && (
                  <p className="text-xs text-gray-500">
                    Manager ID:{" "}
                    {ticket.assignee.id}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Dates
          </h2>

          <div className="space-y-4">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Created
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(
                  ticket.createdAt
                )}
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Last Updated
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(
                  ticket.updatedAt
                )}
              </p>

            </div>

          </div>

        </div>

        {/* Escalation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Escalation
          </h2>

          <div className="space-y-4">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Escalated
              </p>

              <p
                className={`mt-1 font-semibold ${
                  ticket.isEscalated
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {ticket.isEscalated
                  ? "Yes"
                  : "No"}
              </p>

            </div>

            {ticket.isEscalated && (
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Escalated At
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(
                    ticket.escalatedAt
                  )}
                </p>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Customer Rating */}
      {(ticket.rating !==
        null &&
        ticket.rating !==
          undefined) ||
      ticket.ratingComment ||
      ticket.ratedAt ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Customer Rating
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rating
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {ticket.rating ??
                  "—"}

                {ticket.rating !==
                  null &&
                  ticket.rating !==
                    undefined &&
                  " / 5"}
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rated At
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(
                  ticket.ratedAt
                )}
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Comment
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {ticket.ratingComment ||
                  "No comment"}
              </p>

            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
