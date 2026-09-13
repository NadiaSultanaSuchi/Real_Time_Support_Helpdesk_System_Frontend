"use client";

import axios from "axios";
import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";
import { markTicketSeen } from "@/lib/notifications";
import type { Ticket, Comment } from "@/lib/types";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [ticketRes, commentsRes] = await Promise.all([
      api.get<Ticket>(`/my/tickets/${id}`),
      api.get<Comment[]>(`/tickets/${id}/comments`),
    ]);
    setTicket(ticketRes.data);
    setTitle(ticketRes.data.title);
    setDescription(ticketRes.data.description);
    setComments(commentsRes.data);
    markTicketSeen(ticketRes.data); 
  };

  useEffect(() => { load(); }, [id]);

  const handleSaveEdit = async () => {
    setError("");
    try {
      await api.patch(`/my/tickets/${id}`, { title, description });
      setEditing(false);
      load();
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Could not update ticket.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket?")) return;
    try {
      await api.delete(`/my/tickets/${id}`);
      router.push("/dashboard/tickets");
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Could not delete ticket.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await api.post(`/tickets/${id}/comments`, { content: newComment });
    setNewComment("");
    load();
  };

  const handleSubmitRating = async () => {
    if (ratingValue < 1) return;
    try {
      await api.patch(`/my/tickets/${id}/rating`, { rating: ratingValue, comment: ratingComment || undefined });
      load();
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Could not submit rating.");
    }
  };

  if (!ticket) {
    return (
      <DashboardShell>
        <p className="text-gray-500">Loading...</p>
      </DashboardShell>
    );
  }

  const canEdit = ticket.status === "Open";
  const canRate = ticket.status === "Resolved" || ticket.status === "Closed";

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">#TKT-{ticket.id}</h1>
        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-gray-300">{ticket.status}</span>
      </div>

      <div className="max-w-2xl rounded-2xl border border-neutral-800 p-6">
        {editing ? (
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white">{ticket.title}</h2>
            <p className="mt-2 text-gray-400">{ticket.description}</p>
            <div className="mt-4 flex gap-6 text-sm text-gray-500">
              <span>Priority: {ticket.priority}</span>
              <span>Product: {ticket.product?.name ?? "None"}</span>
            </div>
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {canEdit && !editing && (
          <div className="mt-5 flex gap-3">
            <button onClick={() => setEditing(true)} className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-900">
              Edit
            </button>
            <button onClick={handleDelete} className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950">
              Delete
            </button>
          </div>
        )}
        {!canEdit && !canRate && (
          <p className="mt-5 text-xs text-gray-600">This ticket is {ticket.status} and can no longer be edited.</p>
        )}
      </div>

      {canRate && (
        <div className="mt-6 max-w-2xl rounded-2xl border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-white">
            {ticket.rating ? "Your Rating" : "Rate this resolution"}
          </h2>
          <div className="mt-3 flex gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRatingValue(star)}
                className={star <= (ratingValue || ticket.rating || 0) ? "text-amber-400" : "text-neutral-700"}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder={ticket.ratingComment ?? "Optional feedback..."}
            rows={2}
            className="mt-3 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSubmitRating}
            className="mt-3 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400"
          >
            {ticket.rating ? "Update Rating" : "Submit Rating"}
          </button>
        </div>
      )}

      <div className="mt-8 max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold text-white">Comments</h2>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-800 p-4">
              <div className="text-sm font-medium text-white">{c.author.name ?? c.author.email}</div>
              <p className="mt-1 text-sm text-gray-400">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-600">No comments yet.</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
          />
          <button onClick={handleAddComment} className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500">
            Post
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}