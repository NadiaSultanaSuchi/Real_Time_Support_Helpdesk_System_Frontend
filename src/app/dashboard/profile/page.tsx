"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import type { PaginatedTickets, Profile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [ticketTotal, setTicketTotal] = useState<number | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    api.get<Profile>("/profile").then((res) => {
      setProfile(res.data);
      setName(res.data.name ?? "");
      setContactNumber(res.data.contactNumber ?? "");
    });
    api.get<PaginatedTickets>("/my/tickets", { params: { page: 1, limit: 1 } }).then((res) => {
      setTicketTotal(res.data.total);
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

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setPasswordStatus("saving");
    try {
      await api.patch("/auth/change-password", { currentPassword, newPassword });
      setPasswordStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus("error");
      if (axios.isAxiosError(err)) {
        setPasswordError(err.response?.data?.message || err.response?.data?.error || "Could not change password.");
      } else {
        setPasswordError("Could not change password.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your account details</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-800 p-6">
            <h2 className="text-sm font-semibold text-gray-300">Account Details</h2>
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

          <form onSubmit={handleChangePassword} className="space-y-5 rounded-2xl border border-neutral-800 p-6">
            <h2 className="text-sm font-semibold text-gray-300">Change Password</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
            {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={passwordStatus === "saving"}
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
              >
                {passwordStatus === "saving" ? "Updating..." : "Update Password"}
              </button>
              {passwordStatus === "saved" && <span className="text-sm text-green-400">Password changed!</span>}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-white/30" />
            <div className="mt-3 text-lg font-semibold text-white">{profile?.name || profile?.email || "..."}</div>
            <div className="text-sm text-purple-100">{profile?.role ?? ""}</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 p-5">
            <h2 className="text-sm font-semibold text-gray-300">Account Overview</h2>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Tickets Raised</span>
              <span className="text-lg font-bold text-white">{ticketTotal ?? "—"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-neutral-800 py-3 text-sm font-medium text-gray-300 hover:bg-neutral-900"
          >
            Log Out
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}