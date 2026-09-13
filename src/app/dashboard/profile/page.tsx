"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

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


export default function ProfilePage() {
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");



    useEffect(() => {
    api.get<Profile>("/profile").then((res) => {
      setProfile(res.data);
      setName(res.data.name ?? "");
      setContactNumber(res.data.contactNumber ?? "");
    });
  }, []);


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const res = await api.patch<Profile>("/profile", { name, contactNumber });
      setProfile(res.data);
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("Could not update profile. Please try again.");
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
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account details</p>

        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-5">
          <div className="h-14 w-14 rounded-full bg-white/30" />
          <div>
            <div className="text-lg font-semibold text-white">{profile?.name || profile?.email || "..."}</div>
            <div className="text-sm text-purple-100">{profile?.role ?? ""}</div>
          </div>
        </div>


                <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-5 rounded-2xl border border-neutral-800 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
            <input
              value={profile?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Contact Number</label>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
            >
              {status === "saving" ? "Saving..." : "Save Changes"}
            </button>
            {status === "saved" && <span className="text-sm text-green-400">Saved!</span>}
          </div>
        </form>



              </div>
    </div>
  );
}