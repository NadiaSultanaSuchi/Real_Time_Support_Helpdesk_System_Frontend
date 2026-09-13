"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";
import type { PaginatedTickets, TicketPriority, TicketStatus } from "@/lib/types";

const statusColors: Record<TicketStatus, string> = {
  Open: "text-blue-400",
  InProgress: "text-amber-400",
  Resolved: "text-green-400",
  Closed: "text-gray-400",
};

const priorityColors: Record<TicketPriority, string> = {
  Low: "bg-gray-500",
  Medium: "bg-blue-500",
  High: "bg-amber-500",
  Urgent: "bg-red-500",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const [all, setAll] = useState<PaginatedTickets["data"]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaginatedTickets>("/my/tickets", { params: { page: 1, limit: 50 } }).then((res) => {
      setTotal(res.data.total);
      setAll(res.data.data);
      setLoading(false);
    });
  }, []);

  const openCount = all.filter((t) => t.status === "Open").length;
  const progressCount = all.filter((t) => t.status === "InProgress").length;
  const resolvedCount = all.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const recent = all.slice(0, 5);

  const priorities: TicketPriority[] = ["Urgent", "High", "Medium", "Low"];
  const priorityCounts = priorities.map((p) => ({
    label: p,
    count: all.filter((t) => t.priority === p).length,
  }));
  const maxPriorityCount = Math.max(1, ...priorityCounts.map((p) => p.count));

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{getGreeting()}!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your support activity.</p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:bg-purple-500"
        >
          + New Ticket
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5">
          <div className="text-sm text-purple-100">Total Tickets</div>
          <div className="mt-1 text-4xl font-bold text-white">{total ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="text-sm text-gray-400">Open</div>
          <div className="mt-1 text-4xl font-bold text-blue-400">{openCount}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="text-sm text-gray-400">In Progress</div>
          <div className="mt-1 text-4xl font-bold text-amber-400">{progressCount}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="text-sm text-gray-400">Resolved / Closed</div>
          <div className="mt-1 text-4xl font-bold text-green-400">{resolvedCount}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-semibold text-white">Recent Tickets</h2>
            <Link href="/dashboard/tickets" className="text-sm text-purple-400 hover:text-purple-300">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-5 py-2.5 text-left font-medium">ID</th>
                <th className="px-5 py-2.5 text-left font-medium">Subject</th>
                <th className="px-5 py-2.5 text-left font-medium">Status</th>
                <th className="px-5 py-2.5 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-500">Loading...</td></tr>
              )}
              {!loading && recent.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/dashboard/tickets/${t.id}`)}
                  className="cursor-pointer border-t border-neutral-800 hover:bg-neutral-900"
                >
                  <td className="px-5 py-3 text-gray-300">#TKT-{t.id}</td>
                  <td className="px-5 py-3 text-gray-300">{t.title}</td>
                  <td className={`px-5 py-3 font-medium ${statusColors[t.status]}`}>{t.status.toUpperCase()}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <p className="text-gray-500">No tickets yet.</p>
                    <Link href="/dashboard/tickets/new" className="mt-2 inline-block text-sm text-purple-400 hover:text-purple-300">
                      Create your first ticket →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 p-5">
            <h2 className="font-semibold text-white">Priority Breakdown</h2>
            <div className="mt-4 space-y-3">
              {priorityCounts.map((p) => (
                <div key={p.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{p.label}</span>
                    <span>{p.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900">
                    <div
                      className={`h-full rounded-full ${priorityColors[p.label as TicketPriority]}`}
                      style={{ width: `${(p.count / maxPriorityCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 p-5">
            <h2 className="font-semibold text-white">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/dashboard/tickets/new"
                className="block rounded-xl border border-neutral-800 px-4 py-3 text-sm text-gray-300 hover:border-purple-500 hover:text-white"
              >
                Raise a new ticket
              </Link>
              <Link
                href="/dashboard/tickets"
                className="block rounded-xl border border-neutral-800 px-4 py-3 text-sm text-gray-300 hover:border-purple-500 hover:text-white"
              >
                Browse all tickets
              </Link>
              <Link
                href="/dashboard/profile"
                className="block rounded-xl border border-neutral-800 px-4 py-3 text-sm text-gray-300 hover:border-purple-500 hover:text-white"
              >
                Update your profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}