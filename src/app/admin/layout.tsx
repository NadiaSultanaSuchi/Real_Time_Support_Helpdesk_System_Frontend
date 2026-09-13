"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(accessToken.split(".")[1])
      );

      if (payload.role !== "Admin") {
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

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
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive("/admin")
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
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
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive("/admin/tickets")
                  ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">▤</span>
              Tickets
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive("/admin/users")
                  ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">♙</span>
              Users
            </Link>

            {/* Manager Requests */}
            {/* 
            <Link
              href="/admin/managers/requests"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive("/admin/managers/requests")
                  ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">🙏🥺</span>
              Manager Requests
            </Link>
            */}

            <Link
              href="/admin/products"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive("/admin/products")
                  ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">▣</span>
              Products
            </Link>

            {/* Reports */}
            {/* 
            <Link
              href="/admin/reports"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive("/admin/reports")
                  ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">◫</span>
              Reports
            </Link>
            */}
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <Link
            href="/admin/profile"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              isActive("/admin/profile")
                ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-lg">◎</span>
            My Profile
          </Link>
        </nav>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-900 p-3">
            <div className="flex items-center gap-3">
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

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <span className="text-lg">↪</span>
              Logout
            </button>
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
            {/* 
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <span className="text-lg">♧</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
            </button>
            */}

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