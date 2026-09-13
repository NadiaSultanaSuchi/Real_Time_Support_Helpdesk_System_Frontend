"use client"

import axios from 'axios';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = [
    "Show today's ticket summary",
    "Which tickets are pending?",
    "Show team performance",
    "Generate weekly report",
    "Find high priority tickets",
];

export default function AssistantPanel() {

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:3000/api/assistant/query", { message: text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages((prev) => [...prev, { role: "assistant", text: response.data.reply }]);
        }
        catch (error) {
            const errText = error.response?.data?.error || "Something went wrong, try again.";
            setMessages((prev) => [...prev, { role: "assistant", text: errText }]);
        }
        finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full text-xl shadow-lg"
            >
                🤖
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 z-30 flex h-[520px] w-[360px] flex-col shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Support AI Assistant</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>✕</Button>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden pt-0">

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">

                    {messages.length === 0 && (
                        <p className="text-sm text-slate-500">
                            Hi! I can help with ticket insights, reports, team performance, and more.
                        </p>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={
                                m.role === "user"
                                    ? "ml-auto max-w-[85%] rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                                    : "mr-auto max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm"
                            }
                        >
                            {m.text}
                        </div>
                    ))}

                    {loading && (
                        <div className="mr-auto max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400">
                            typing...
                        </div>
                    )}

                </div>

                <div className="mt-3 space-y-2">
                    {messages.length === 0 && suggestions.map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                            {s} →
                        </button>
                    ))}
                </div>

                <div className="mt-3 flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                        placeholder="Ask me anything..."
                    />
                    <Button size="sm" onClick={() => sendMessage(input)} disabled={loading}>
                        Send
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}