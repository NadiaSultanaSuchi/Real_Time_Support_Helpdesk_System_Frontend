"use client";

import { useState } from "react";

type Ticket = {
  id: string;
  subject: string;
  customer: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "ESCALATED" | "CLOSED";
  assignedTo: string;
  createdAt: string;
};

const tickets: Ticket[] = [
  {
    id: "TKT-1001",
    subject: "Unable to reset password",
    customer: "Rahim Ahmed",
    priority: "HIGH",
    status: "OPEN",
    assignedTo: "Unassigned",
    createdAt: "Sep 02, 2026",
  },
  {
    id: "TKT-1002",
    subject: "Payment issue with subscription",
    customer: "Nusrat Jahan",
    priority: "URGENT",
    status: "IN_PROGRESS",
    assignedTo: "Sakib Khan",
    createdAt: "Sep 01, 2026",
  },
  {
    id: "TKT-1003",
    subject: "Cannot access dashboard",
    customer: "Karim Uddin",
    priority: "MEDIUM",
    status: "OPEN",
    assignedTo: "Unassigned",
    createdAt: "Aug 31, 2026",
  },
  {
    id: "TKT-1004",
    subject: "Account verification problem",
    customer: "Tanvir Hasan",
    priority: "LOW",
    status: "CLOSED",
    assignedTo: "Nusrat Jahan",
    createdAt: "Aug 30, 2026",
  },
  {
    id: "TKT-1005",
    subject: "Service stopped working",
    customer: "Imran Hossain",
    priority: "HIGH",
    status: "ESCALATED",
    assignedTo: "Sakib Khan",
    createdAt: "Aug 29, 2026",
  },
];

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tickets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor all support tickets.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Tickets"
          value={tickets.length}
          description="All tickets"
        />

        <SummaryCard
          title="Open"
          value={tickets.filter((t) => t.status === "OPEN").length}
          description="Waiting for action"
        />

        <SummaryCard
          title="In Progress"
          value={
            tickets.filter((t) => t.status === "IN_PROGRESS").length
          }
          description="Currently being handled"
        />

        <SummaryCard
          title="Escalated"
          value={
            tickets.filter((t) => t.status === "ESCALATED").length
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
              placeholder="Search by ticket ID, subject or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
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
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* Ticket */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        {ticket.id}
                      </p>

                      <p className="mt-1 max-w-xs font-medium text-slate-900">
                        {ticket.subject}
                      </p>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {ticket.customer}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* Assigned */}
                  <td className="px-6 py-4">
                    <span
                      className={
                        ticket.assignedTo === "Unassigned"
                          ? "text-sm italic text-slate-400"
                          : "text-sm text-slate-700"
                      }
                    >
                      {ticket.assignedTo}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {ticket.createdAt}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-900">
            {filteredTickets.length}
          </span>{" "}
          tickets
        </p>

        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
            Previous
          </button>

          <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
            1
          </button>

          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            2
          </button>

          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

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

function PriorityBadge({
  priority,
}: {
  priority: Ticket["priority"];
}) {
  const styles = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Ticket["status"];
}) {
  const styles = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    ESCALATED: "bg-red-100 text-red-700",
    CLOSED: "bg-emerald-100 text-emerald-700",
  };

  const labels = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    ESCALATED: "Escalated",
    CLOSED: "Closed",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}