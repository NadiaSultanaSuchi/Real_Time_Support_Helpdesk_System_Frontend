"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";
import type { PaginatedTickets, TicketPriority, TicketStatus } from "@/lib/types";

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  InProgress: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Resolved: "bg-green-500/10 text-green-400 border border-green-500/30",
  Closed: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
};

const priorityDot: Record<TicketPriority, string> = {
  Low: "bg-gray-500",
  Medium: "bg-blue-500",
  High: "bg-amber-500",
  Urgent: "bg-red-500",
};

const statusTabs: ("All" | TicketStatus)[] = ["All", "Open", "InProgress", "Resolved", "Closed"];

export default function MyTicketsPage() {
  const router = useRouter();
  const [all, setAll] = useState<PaginatedTickets["data"]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TicketStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TicketPriority>("All");

  const loadTickets = () => {
    setLoading(true);
    api.get<PaginatedTickets>("/my/tickets", { params: { page: 1, limit: 100 } }).then((res) => {
      setAll(res.data.data);
      setLoading(false);
    });
  };

  useEffect(loadTickets, []);

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete ticket #${id}?`)) return;
    try {
      await api.delete(`/my/tickets/${id}`);
      loadTickets();
    } catch {
      alert("Could not delete this ticket.");
    }
  };

  const visible = all
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .filter((t) => priorityFilter === "All" || t.priority === priorityFilter)
    .filter((t) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return String(t.id).includes(q) || t.title.toLowerCase().includes(q);
    });

  const counts = {
    Open: all.filter((t) => t.status === "Open").length,
    InProgress: all.filter((t) => t.status === "InProgress").length,
    Resolved: all.filter((t) => t.status === "Resolved").length,
    Closed: all.filter((t) => t.status === "Closed").length,
  };

  return (
    <DashboardShell search={{ value: search, onChange: setSearch, placeholder: "Search by ID or title..." }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your support tickets</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadTickets}
            className="flex items-center gap-2 rounded-xl border border-neutral-800 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-900"
          >
            ⟳ Refresh
          </button>
          <Link
            href="/dashboard/tickets/new"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-xs text-gray-500">Open</div>
          <div className="mt-1 text-2xl font-bold text-blue-400">{counts.Open}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{counts.InProgress}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-xs text-gray-500">Resolved</div>
          <div className="mt-1 text-2xl font-bold text-green-400">{counts.Resolved}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-xs text-gray-500">Closed</div>
          <div className="mt-1 text-2xl font-bold text-gray-400">{counts.Closed}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              statusFilter === tab ? "bg-purple-600 text-white" : "border border-neutral-800 text-gray-300 hover:bg-neutral-900"
            }`}
          >
            {tab === "All" ? "All Tickets" : tab}
          </button>
        ))}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as "All" | TicketPriority)}
          className="ml-auto rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-gray-300"
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="px-5 py-2.5 text-left font-medium">ID</th>
              <th className="px-5 py-2.5 text-left font-medium">Subject</th>
              <th className="px-5 py-2.5 text-left font-medium">Priority</th>
              <th className="px-5 py-2.5 text-left font-medium">Status</th>
              <th className="px-5 py-2.5 text-left font-medium">Rating</th>
              <th className="px-5 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && visible.map((t) => (
              <tr key={t.id} className="border-t border-neutral-800 hover:bg-neutral-900">
                <td onClick={() => router.push(`/dashboard/tickets/${t.id}`)} className="cursor-pointer px-5 py-3 text-gray-300">
                  #TKT-{t.id}
                </td>
                <td onClick={() => router.push(`/dashboard/tickets/${t.id}`)} className="cursor-pointer px-5 py-3 text-gray-300">
                  {t.title}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2 text-gray-300">
                    <span className={`h-2 w-2 rounded-full ${priorityDot[t.priority]}`} />
                    {t.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[t.status]}`}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-amber-400">
                  {t.rating ? "★".repeat(t.rating) + "☆".repeat(5 - t.rating) : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-5 py-3">
                  {t.status === "Open" ? (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">Locked</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <p className="text-gray-500">No matching tickets.</p>
                  <Link href="/dashboard/tickets/new" className="mt-2 inline-block text-sm text-purple-400 hover:text-purple-300">
                    Create a new ticket →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}