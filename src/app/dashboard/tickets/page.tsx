"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PaginatedTickets, Profile, TicketStatus } from "@/lib/types";


const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12l9-9 9 9M5 10v10h14V10" />
    </svg>
  ),
  tickets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z" />
    </svg>
  ),
  new: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
};

const links = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/dashboard/tickets", label: "My Tickets", icon: icons.tickets },
  { href: "/dashboard/tickets/new", label: "New Ticket", icon: icons.new },
  { href: "/dashboard/profile", label: "Profile", icon: icons.profile },
];

const statusColors: Record<TicketStatus, string> = {
  Open: "text-blue-400",
  InProgress: "text-amber-400",
  Resolved: "text-green-400",
  Closed: "text-gray-400",
};



export default function MyTicketsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<PaginatedTickets | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");



    const loadTickets = () => {
    api.get<PaginatedTickets>("/my/tickets", { params: { page, limit: 10 } }).then((res) => setResult(res.data));
  };


    useEffect(() => {
    api.get<Profile>("/profile").then((res) => setProfile(res.data));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [page]);



    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchError("");
    const id = search.trim();
    if (!id || !/^\d+$/.test(id)) {
      setSearchError("Enter a valid ticket ID (number).");
      return;
    }
    try {
      await api.get(`/my/tickets/${id}`);
      router.push(`/dashboard/tickets/${id}`);
    } catch {
      setSearchError(`No ticket found with ID ${id}.`);
    }
  };



    const handleDelete = async (id: number) => {
    if (!confirm(`Delete ticket #${id}?`)) return;
    try {
      await api.delete(`/my/tickets/${id}`);
      loadTickets();
    } catch {
      alert("Could not delete this ticket.");
    }
  };



    return (
    <div className="flex min-h-screen gap-4 bg-black p-4">

      <aside className="flex w-64 flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold">
              ◆
            </div>
            <div>
              <div className="text-sm font-semibold leading-none text-white">Support</div>
              <div className="text-xs text-gray-500">Ticket System</div>
            </div>
          </div>
          <nav className="space-y-1.5">
            {links.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-neutral-900">
          <div className="h-9 w-9 rounded-full bg-neutral-700" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{profile?.name || profile?.email || "..."}</div>
            <div className="text-xs text-gray-500">{profile?.role ?? ""}</div>
          </div>
        </Link>
      </aside>




      <div className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="max-w-md flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Tickets"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
            />
          </form>
          <Link href="/dashboard/profile" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-700" />
            <span className="text-sm font-medium text-white">{profile?.name || profile?.email || "..."}</span>
          </Link>
        </div>
        {searchError && <p className="mb-6 text-sm text-red-400">{searchError}</p>}
        {!searchError && <div className="mb-6" />}



                <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Tickets</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage your support tickets</p>
          </div>
          <button
            onClick={loadTickets}
            className="flex items-center gap-2 rounded-xl border border-neutral-800 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-900"
          >
            ⟳ Refresh
          </button>
        </div>



                <div className="mt-6 flex gap-3">
          <span className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-medium text-white">All Tickets</span>
          <Link
            href="/dashboard/tickets/new"
            className="rounded-xl border border-neutral-800 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-neutral-900"
          >
            New
          </Link>
        </div>


                <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800">
          <div className="px-5 py-4">
            <h2 className="font-semibold text-white">All Tickets</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-5 py-2.5 text-left font-medium">ID</th>
                <th className="px-5 py-2.5 text-left font-medium">Subject</th>
                <th className="px-5 py-2.5 text-left font-medium">Status</th>
                <th className="px-5 py-2.5 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result?.data.map((t) => (
                <tr key={t.id} className="border-t border-neutral-800 hover:bg-neutral-900">
                  <td onClick={() => router.push(`/dashboard/tickets/${t.id}`)} className="cursor-pointer px-5 py-3 text-gray-300">
                    #TKT-{t.id}
                  </td>
                  <td onClick={() => router.push(`/dashboard/tickets/${t.id}`)} className="cursor-pointer px-5 py-3 text-gray-300">
                    {t.title}
                  </td>
                  <td className={`px-5 py-3 font-medium ${statusColors[t.status]}`}>{t.status.toUpperCase()}</td>
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
              {result && result.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                    No tickets yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



                {result && result.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-gray-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </span>
            <button
              disabled={page >= result.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-gray-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}



              </div>
    </div>
  );
}