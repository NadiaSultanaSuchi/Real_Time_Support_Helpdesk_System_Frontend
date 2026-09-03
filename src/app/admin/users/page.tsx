"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name?: string;
  contactNumber?: string;
  address?: string;
  profilePicture?: string;
  role: "Admin" | "Manager" | "Customer";
  createdAt?: string;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get<User[]>(
        `${API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            role:
              roleFilter === "ALL"
                ? undefined
                : roleFilter,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      const accessToken =
        localStorage.getItem("accessToken");

      await axios.delete(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers((prev) =>
        prev.filter((user) => user.id !== id)
      );
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Could not delete user."
        );
      } else {
        alert("Could not delete user.");
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Users</option>
          <option value="Admin">Admins</option>
          <option value="Manager">Managers</option>
          <option value="Customer">Customers</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Created
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    #{user.id}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.name || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "Manager"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(user.id)
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}