"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getUnseenNotifications, markAllSeen, type TicketNotification } from "@/lib/notifications";
import type { PaginatedTickets, Profile } from "@/lib/types";

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
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 004 0" />
    </svg>
  ),
};

const links = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/dashboard/tickets", label: "My Tickets", icon: icons.tickets },
  { href: "/dashboard/tickets/new", label: "New Ticket", icon: icons.new },
  { href: "/dashboard/profile", label: "Profile", icon: icons.profile },
];

interface SearchConfig {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function DashboardShell({
  children,
  search,
}: {
  children: React.ReactNode;
  search?: SearchConfig;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = () => {
    api.get<PaginatedTickets>("/my/tickets", { params: { page: 1, limit: 50 } }).then((res) => {
      setNotifications(getUnseenNotifications(res.data.data));
    });
  };

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || current.role !== "Customer") {
      router.replace("/login");
      return;
    }
    setChecked(true);
    api.get<Profile>("/profile").then((res) => setProfile(res.data));
    loadNotifications();
  }, [router]);

  const handleMarkAllRead = () => {
    api.get<PaginatedTickets>("/my/tickets", { params: { page: 1, limit: 50 } }).then((res) => {
      markAllSeen(res.data.data);
      setNotifications([]);
      setShowNotifications(false);
    });
  };

  if (!checked) {
    return <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen gap-4 bg-black p-4">

      <aside className="flex w-64 flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold shadow-lg shadow-purple-900/40">
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
                    active ? "bg-purple-600 text-white shadow-md shadow-purple-900/30" : "text-gray-400 hover:bg-neutral-900 hover:text-white"
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
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{profile?.name || profile?.email || "..."}</div>
            <div className="text-xs text-gray-500">{profile?.role ?? ""}</div>
          </div>
        </Link>
      </aside>


      <div className="flex flex-1 flex-col gap-4">

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-4">
          {search ? (
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search..."}
              className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
            />
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="relative rounded-full p-2 text-gray-400 hover:bg-neutral-900 hover:text-white"
              >
                {icons.bell}
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-purple-400 hover:text-purple-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-gray-500">You're all caught up.</p>
                    )}
                    {notifications.map((n) => (
                      <Link
                        key={n.ticketId}
                        href={`/dashboard/tickets/${n.ticketId}`}
                        onClick={() => setShowNotifications(false)}
                        className="block border-b border-neutral-900 px-4 py-3 text-sm hover:bg-neutral-900"
                      >
                        <div className="font-medium text-white">#TKT-{n.ticketId} — {n.title}</div>
                        <div className="mt-0.5 text-xs text-purple-400">Status changed to {n.status}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/dashboard/profile" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800" />
              <span className="text-sm font-medium text-white">{profile?.name || profile?.email || "..."}</span>
            </Link>
          </div>
        </div>


        <div className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">{children}</div>
      </div>
    </div>
  );
}