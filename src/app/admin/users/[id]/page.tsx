"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  name?: string;
  contactNumber?: string;
  address?: string;
  profilePicture?: string;
  role: "Admin" | "Manager" | "Customer";
  createdAt?: string;
  updatedAt?: string;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem("accessToken");

      const response = await axios.get<User>(
        `${API_URL}/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(response.data);
      setRole(response.data.role);
    } catch (error) {
      console.error(error);
      setError("Could not load user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleRoleChange = async () => {
    if (!user || role === user.role) return;

    const confirmed = window.confirm(
      `Change ${user.email}'s role to ${role}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      const accessToken =
        localStorage.getItem("accessToken");

      const response = await axios.patch<User>(
        `${API_URL}/users/${id}/role`,
        {
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(response.data);
      setRole(response.data.role);

      alert("User role updated successfully.");
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Could not update role."
        );
      } else {
        setError("Could not update role.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading user...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center text-red-500">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="mb-4 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Users
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          User Details
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage user information
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="max-w-2xl rounded-xl border bg-white">
        {/* User information */}
        <div className="border-b p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            User Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                User ID
              </p>
              <p className="mt-1 text-sm text-gray-900">
                #{user.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Name
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Contact Number
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.contactNumber || "—"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-gray-500">
                Address
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Created
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Change Role
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Customer">Customer</option>
            </select>

            <button
              onClick={handleRoleChange}
              disabled={
                saving || role === user.role
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
