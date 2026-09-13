"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  isEscalated: boolean;
  escalatedAt?: string | null;
  rating?: number | null;
  ratingComment?: string | null;
  ratedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  customer?: {
    id?: number;
    email?: string;
  };

  assignee?: {
    id?: number;
    email?: string;
  } | null;

  product?: {
    id?: number;
    name?: string;
  } | null;
};

type Comment = {
  id: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;

  author?: {
    id?: number;
    email?: string;
    role?: string;
  };

  user?: {
    id?: number;
    email?: string;
    role?: string;
  };
};

type Manager = {
  id: number;
  email: string;
  role?: string;
};

const API_URL = "http://127.0.0.1:3000/api";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);

  const [managers, setManagers] = useState<Manager[]>([]);

  const [loading, setLoading] = useState(true);

  const [commentsLoading, setCommentsLoading] = useState(true);

  const [managersLoading, setManagersLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [commentLoading, setCommentLoading] = useState(false);

  const [assignLoading, setAssignLoading] = useState(false);

  const [editingCommentId, setEditingCommentId] =
    useState<number | null>(null);

  const [commentText, setCommentText] = useState("");

  const [editingText, setEditingText] = useState("");

  const [selectedManagerId, setSelectedManagerId] =
    useState<string>("");

  const [error, setError] = useState("");

  const [commentError, setCommentError] = useState("");

  const [assignError, setAssignError] = useState("");

  const ticketId = params.id;

  // =========================
  // GET ACCESS TOKEN
  // =========================

  const getAccessToken = () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/login");
      return null;
    }

    return accessToken;
  };

  // =========================
  // FETCH TICKET
  // =========================

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      const response = await axios.get<Ticket>(
        `${API_URL}/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setTicket(response.data);

      // Set currently assigned manager in dropdown
      if (response.data.assignee?.id) {
        setSelectedManagerId(
          String(response.data.assignee.id)
        );
      } else {
        setSelectedManagerId("");
      }
    } catch (err: any) {
      console.error("Error loading ticket:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        router.replace("/login");
        return;
      }

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH COMMENTS
  // =========================

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const commentsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setComments(commentsData);
    } catch (err: any) {
      console.error("Error loading comments:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        router.replace("/login");
        return;
      }

      setCommentError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load comments."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // =========================
  // FETCH MANAGERS
  // =========================

  const fetchManagers = async () => {
    try {
      setManagersLoading(true);
      setAssignError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/users?role=Manager`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      /*
       * Backend may return:
       * 
       * [
       *   { id: 2, email: "manager@example.com" }
       * ]
       *
       * or:
       *
       * { data: [...] }
       */

      const managersData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setManagers(managersData);
    } catch (err: any) {
      console.error("Error loading managers:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        router.replace("/login");
        return;
      }

      setAssignError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load managers."
      );
    } finally {
      setManagersLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchComments();
      fetchManagers();
    }
  }, [ticketId]);

  // =========================
  // ASSIGN MANAGER
  // =========================

  const assignManager = async () => {
    if (!ticket) {
      return;
    }

    if (!selectedManagerId) {
      setAssignError("Please select a manager.");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      await axios.patch(
        `${API_URL}/tickets/${ticket.id}/assign`,
        {
          assigneeId: Number(selectedManagerId),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Reload ticket so the new assignee is displayed
      await fetchTicket();
    } catch (err: any) {
      console.error("Error assigning manager:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        router.replace("/login");
        return;
      }

      setAssignError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to assign manager."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // =========================
  // TICKET ACTION
  // =========================

  const performAction = async (
    action: "accept" | "escalate" | "close"
  ) => {
    if (!ticket) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      await axios.patch(
        `${API_URL}/tickets/${ticket.id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchTicket();
    } catch (err: any) {
      console.error(`Error performing ${action}:`, err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `Failed to ${action} ticket.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // ADD COMMENT
  // =========================

  const addComment = async () => {
    const content = commentText.trim();

    if (!content) {
      setCommentError("Please write a comment.");
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      await axios.post(
        `${API_URL}/tickets/${ticketId}/comments`,
        {
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setCommentText("");

      await fetchComments();
    } catch (err: any) {
      console.error("Error adding comment:", err);

      setCommentError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // =========================
  // START EDIT COMMENT
  // =========================

  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
    setCommentError("");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingText("");
    setCommentError("");
  };

  // =========================
  // UPDATE COMMENT
  // =========================

  const updateComment = async (commentId: number) => {
    const content = editingText.trim();

    if (!content) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      await axios.patch(
        `${API_URL}/comments/${commentId}`,
        {
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setEditingCommentId(null);
      setEditingText("");

      await fetchComments();
    } catch (err: any) {
      console.error("Error updating comment:", err);

      setCommentError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const deleteComment = async (commentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError("");

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      await axios.delete(
        `${API_URL}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingText("");
      }

      await fetchComments();
    } catch (err: any) {
      console.error("Error deleting comment:", err);

      setCommentError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-orange-100 text-orange-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-700";

      case "InProgress":
        return "bg-purple-100 text-purple-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      case "Closed":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCommentAuthor = (comment: Comment) => {
    return (
      comment.author?.email ||
      comment.user?.email ||
      "Unknown User"
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading ticket details...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !ticket) {
    return (
      <div className="p-6">
        <Link
          href="/admin/tickets"
          className="mb-5 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Tickets
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/admin/tickets"
            className="mb-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Tickets
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Ticket #{ticket.id}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View complete ticket information.
          </p>
        </div>

        {/* Ticket Actions */}
        <div className="flex flex-wrap gap-2">
          {ticket.status !== "Closed" && (
            <>
              <button
                onClick={() => performAction("accept")}
                disabled={actionLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Accept"}
              </button>

              {!ticket.isEscalated && (
                <button
                  onClick={() => performAction("escalate")}
                  disabled={actionLoading}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Escalate
                </button>
              )}

              <button
                onClick={() => performAction("close")}
                disabled={actionLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ticket Description */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Ticket Title
              </p>

              <h2 className="text-xl font-semibold text-gray-900">
                {ticket.title}
              </h2>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </p>

              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                {ticket.description ||
                  "No description provided."}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Ticket Information
            </h2>

            <div className="space-y-5">
              {/* Status */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status === "InProgress"
                    ? "In Progress"
                    : ticket.status}
                </span>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Priority
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </div>

              {/* Product */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Product
                </p>

                {ticket.product ? (
                  <div className="mt-1">
                    <p className="font-medium text-gray-900">
                      {ticket.product.name ||
                        "Unnamed Product"}
                    </p>

                    {ticket.product.id && (
                      <p className="text-xs text-gray-500">
                        Product ID: {ticket.product.id}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">
                    No product assigned
                  </p>
                )}
              </div>

              {/* Customer */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Customer
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {ticket.customer?.email || "Unknown"}
                </p>

                {ticket.customer?.id && (
                  <p className="text-xs text-gray-500">
                    Customer ID: {ticket.customer.id}
                  </p>
                )}
              </div>

              {/* Assigned Manager */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Assigned To
                </p>

                {managersLoading ? (
                  <p className="mt-2 text-sm text-gray-500">
                    Loading managers...
                  </p>
                ) : (
                  <>
                    <select
                      value={selectedManagerId}
                      onChange={(e) => {
                        setSelectedManagerId(e.target.value);
                        setAssignError("");
                      }}
                      disabled={
                        assignLoading ||
                        managers.length === 0
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    >
                      <option value="">
                        Select a manager
                      </option>

                      {managers.map((manager) => (
                        <option
                          key={manager.id}
                          value={manager.id}
                        >
                          {manager.email}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={assignManager}
                      disabled={
                        assignLoading ||
                        !selectedManagerId ||
                        managers.length === 0
                      }
                      className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assignLoading
                        ? "Assigning..."
                        : ticket.assignee
                        ? "Reassign Manager"
                        : "Assign Manager"}
                    </button>

                    {ticket.assignee && (
                      <p className="mt-2 text-xs text-gray-500">
                        Currently assigned to:{" "}
                        <span className="font-medium text-gray-700">
                          {ticket.assignee.email ||
                            "Unknown"}
                        </span>
                      </p>
                    )}

                    {managers.length === 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        No managers available.
                      </p>
                    )}
                  </>
                )}

                {assignError && (
                  <p className="mt-2 text-sm text-red-600">
                    {assignError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Dates
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Created
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(ticket.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Last Updated
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(ticket.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Escalation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Escalation
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Escalated
              </p>

              <p
                className={`mt-1 font-semibold ${
                  ticket.isEscalated
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {ticket.isEscalated ? "Yes" : "No"}
              </p>
            </div>

            {ticket.isEscalated && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Escalated At
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(ticket.escalatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      {(ticket.rating !== null &&
        ticket.rating !== undefined) ||
      ticket.ratingComment ||
      ticket.ratedAt ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Customer Rating
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rating
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {ticket.rating ?? "—"}

                {ticket.rating !== null &&
                  ticket.rating !== undefined &&
                  " / 5"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rated At
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatDate(ticket.ratedAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Comment
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {ticket.ratingComment ||
                  "No comment"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* =========================
          COMMENTS
      ========================= */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Comments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Conversation and updates related to this ticket.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {comments.length}{" "}
            {comments.length === 1
              ? "Comment"
              : "Comments"}
          </span>
        </div>

        {/* Comment Error */}
        {commentError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {commentError}
          </div>
        )}

        {/* Add Comment */}
        <div className="mb-8">
          <label
            htmlFor="comment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Add Comment
          </label>

          <textarea
            id="comment"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              setCommentError("");
            }}
            placeholder="Write a comment..."
            rows={4}
            disabled={commentLoading}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={addComment}
              disabled={
                commentLoading ||
                !commentText.trim()
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentLoading
                ? "Sending..."
                : "Add Comment"}
            </button>
          </div>
        </div>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              Loading comments...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No comments yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Be the first to add a comment to this ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              >
                {/* Comment Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getCommentAuthor(comment)}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(comment.createdAt)}

                      {comment.updatedAt &&
                        comment.updatedAt !==
                          comment.createdAt &&
                        " • Edited"}
                    </p>
                  </div>

                  {/* Admin Actions */}
                  {editingCommentId !==
                    comment.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          startEditingComment(
                            comment
                          )
                        }
                        disabled={commentLoading}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteComment(
                            comment.id
                          )
                        }
                        disabled={commentLoading}
                        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Content / Edit */}
                {editingCommentId ===
                comment.id ? (
                  <div className="mt-4">
                    <textarea
                      value={editingText}
                      onChange={(e) => {
                        setEditingText(
                          e.target.value
                        );
                        setCommentError("");
                      }}
                      rows={4}
                      disabled={commentLoading}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={
                          cancelEditingComment
                        }
                        disabled={commentLoading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() =>
                          updateComment(
                            comment.id
                          )
                        }
                        disabled={
                          commentLoading ||
                          !editingText.trim()
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {commentLoading
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {comment.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}