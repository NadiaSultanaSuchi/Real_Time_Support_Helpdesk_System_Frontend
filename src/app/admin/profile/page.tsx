"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:3000/api";

type Profile = {
  id?: number;
  name?: string;
  email?: string;
  contactNumber?: string;
  profilePicture?: string;
  address?: string;
  role?: string;
};

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const [error, setError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const getAccessToken = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return null;
    }

    return token;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      setProfile(data);

      setName(data.name || "");
      setContactNumber(data.contactNumber || "");
      setProfilePicture(data.profilePicture || "");
      setAddress(data.address || "");
    } catch (err: any) {
      console.error("Error fetching profile:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      setError("");
      setProfileSuccess("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        {
          name,
          contactNumber,
          profilePicture,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setName(updatedProfile.name || name);
      setContactNumber(
        updatedProfile.contactNumber || contactNumber
      );
      setProfilePicture(
        updatedProfile.profilePicture || profilePicture
      );
      setAddress(updatedProfile.address || address);

      setProfileSuccess("Profile updated successfully.");
    } catch (err: any) {
      console.error("Error updating profile:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your profile information.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-4xl font-bold text-gray-500">
                {name ? name.charAt(0).toUpperCase() : "A"}
              </div>
            )}

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {profile?.name || "Admin"}
            </h2>

            <p className="mt-1 break-all text-sm text-gray-500">
              {profile?.email || "No email available"}
            </p>

            <span className="mt-3 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {profile?.role || "Admin"}
            </span>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Contact Number</p>

                <p className="mt-1 text-gray-700">
                  {profile?.contactNumber || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Address</p>

                <p className="mt-1 text-gray-700">
                  {profile?.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your personal information.
            </p>
          </div>

          {profileSuccess && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={updateProfile} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Email cannot be changed.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Number
              </label>

              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+8801712345678"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Picture URL
              </label>

              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Enter a publicly accessible image URL.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}