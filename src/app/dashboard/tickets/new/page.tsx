"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";
import type { Product, TicketPriority } from "@/lib/types";

export default function NewTicketPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [productId, setProductId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Product[]>("/products").then((res) => setProducts(res.data));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/my/tickets", {
        title,
        description,
        priority,
        productId: productId ? Number(productId) : undefined,
      });
      router.push(`/dashboard/tickets/${res.data.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Could not create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold text-white">New Ticket</h1>
      <p className="mt-1 text-sm text-gray-500">Tell us what's going on and we'll take a look.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-800 p-6 lg:col-span-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required minLength={5} maxLength={150}
              placeholder="Briefly summarize the issue"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required minLength={10} maxLength={2000} rows={6}
              placeholder="Steps to reproduce, what you expected, what happened instead..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Product (optional)</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white"
              >
                <option value="">None</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Submit Ticket"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 p-5">
            <h2 className="font-semibold text-white">Tips for a faster resolution</h2>
            <ul className="mt-3 space-y-3 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-purple-400">•</span> Be specific — include exact error messages if you have them.</li>
              <li className="flex gap-2"><span className="text-purple-400">•</span> Mention the device or app version you were using.</li>
              <li className="flex gap-2"><span className="text-purple-400">•</span> Set priority honestly — Urgent is for things blocking you completely.</li>
              <li className="flex gap-2"><span className="text-purple-400">•</span> Link the right product so the right team sees it faster.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-purple-600/20 to-indigo-700/20 p-5">
            <h2 className="font-semibold text-white">What happens next?</h2>
            <p className="mt-2 text-sm text-gray-400">
              Your ticket starts as <span className="text-blue-400">Open</span>. A support agent will pick it up,
              and you'll see status updates and a notification here as things change.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}