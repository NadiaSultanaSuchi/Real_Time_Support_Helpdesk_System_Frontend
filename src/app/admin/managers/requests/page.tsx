"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type Manager = {
  id: number;
  email: string;
  name?: string;
  contactNumber?: string;
  address?: string;
  createdAt?: string;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function ManagerRequestsPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem("accessToken");

      const response = await axios.get<Manager[]>(
        `${API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            role: "Manager",
          },
        }
      );

      setManagers(response.data);
    } catch (error) {
      console.error(error);
      setError("Could not load manager requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleApprove = async (userId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this manager?"
    );

    if (!confirmed) return;

    try {
      setApprovingId(userId);
      setError("");

      const accessToken =
        localStorage.getItem("accessToken");

      await axios.post(
        `${API_URL}/auth/approve-manager/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      alert(
        "Manager approved successfully. A temporary password has been sent by email."
      );

      // Remove from this list after approval
      setManagers((prev) =>
        prev.filter((manager) => manager.id !== userId)
      );
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Could not approve manager."
        );
      } else {
        setError("Could not approve manager.");
      }
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Heading */}
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-blue-600">
          Management
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Manager Requests
        </h1>

        <p className="mt-2 text-slate-500">
          Review and approve manager access requests.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Manager Requests
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : managers.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              ♙
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Status
              </p>

              <h2 className="mt-2 text-lg font-bold text-amber-600">
                Awaiting Review
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
              ◷
            </div>
          </div>
        </div>
      </div>

      {/* Requests */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Manager Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Users who have requested manager access.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading manager requests...
          </div>
        ) : managers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
              ✓
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No manager requests
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are currently no manager accounts to review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Applied
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {managers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      #{manager.id}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-900">
                      {manager.name || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {manager.email}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {manager.createdAt
                        ? new Date(
                            manager.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                        Pending
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() =>
                          handleApprove(manager.id)
                        }
                        disabled={
                          approvingId === manager.id
                        }
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {approvingId === manager.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}