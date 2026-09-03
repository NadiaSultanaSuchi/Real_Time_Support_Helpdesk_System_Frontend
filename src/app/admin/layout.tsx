"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    // No access token
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(
        atob(accessToken.split(".")[1])
      );

      // Check admin role
      if (payload.role !== "Admin") {
        router.replace("/login");
        return;
      }

      // Token exists and user is Admin
      setAuthorized(true);
    } catch {
      // Invalid token
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      router.replace("/login");
    }
  }, [router]);

  // Don't show the admin dashboard until authentication is checked
  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-950 text-white">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/20">
              S
            </div>

            <div>
              <h1 className="font-semibold tracking-tight">
                SupportDesk
              </h1>

              <p className="text-xs text-slate-400">
                Administration
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Overview
          </p>

          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
            >
              <span className="text-lg">▦</span>
              Dashboard
            </Link>
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <div className="space-y-1">
            <Link
              href="/admin/tickets"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">▤</span>
              Tickets
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">♙</span>
              Users
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">▣</span>
              Products
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">◫</span>
              Reports
            </Link>
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <Link
            href="/admin/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span className="text-lg">◎</span>
            My Profile
          </Link>
        </nav>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                Administrator
              </p>

              <p className="truncate text-xs text-slate-500">
                Admin account
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">
              Welcome back
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              Administrator
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <span className="text-lg">♧</span>

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                A
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  Admin
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}