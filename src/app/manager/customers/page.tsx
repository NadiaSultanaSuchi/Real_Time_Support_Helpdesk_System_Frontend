"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function statusColor(status) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700"; // Open
}

function averageRating(tickets) {
    const rated = tickets.filter((t) => t.rating != null);
    if (rated.length === 0) return null;
    const sum = rated.reduce((total, t) => total + t.rating, 0);
    return Number((sum / rated.length).toFixed(1));
}

// Simple, rule-based flagging — NOT real AI/ML.
function checkSuspicious(tickets) {
    const reasons = [];

    if (tickets.length >= 5) {
        reasons.push("High ticket volume (5+)");
    }

    const titleCounts = {};
    tickets.forEach((t) => {
        titleCounts[t.title] = (titleCounts[t.title] || 0) + 1;
    });
    const hasDuplicateTitle = Object.values(titleCounts).some((count) => count >= 2);
    if (hasDuplicateTitle) {
        reasons.push("Duplicate ticket titles");
    }

    const sortedDates = tickets
        .map((t) => new Date(t.createdAt).getTime())
        .sort((a, b) => a - b);

    for (let i = 1; i < sortedDates.length; i++) {
        const gapHours = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60);
        if (gapHours < 1) {
            reasons.push("Multiple tickets within 1 hour");
            break;
        }
    }

    return reasons;
}

export default function CustomersPage() {

    const [customers, setCustomers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [openNotesTicketId, setOpenNotesTicketId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    useEffect(() => {

        const loadData = async () => {
            try {
                const [customersRes, ticketsRes] = await Promise.all([
                    axios.get("http://localhost:3000/api/users/customers", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get("http://localhost:3000/api/tickets?limit=100", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);

                setCustomers(customersRes.data);
                setTickets(ticketsRes.data.data);
            }
            catch (error) {
                if (error.response) {
                    setErrorMessage(error.response.data?.error || "Could not load customers");
                } else {
                    setErrorMessage("Could not reach the server. Is the backend running?");
                }
            }
            finally {
                setLoading(false);
            }
        }

        loadData();

    }, [])

    const ticketsFor = (customerId) => {
        return tickets.filter((t) => t.customer?.id === customerId);
    }

    const handleToggleNotes = async (ticketId) => {
        if (openNotesTicketId === ticketId) {
            setOpenNotesTicketId(null);
            return;
        }

        setOpenNotesTicketId(ticketId);
        setCommentText("");
        setCommentsLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/tickets/${ticketId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data);
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not load notes");
            setOpenNotesTicketId(null);
        }
        finally {
            setCommentsLoading(false);
        }
    }

    const handlePostComment = async () => {
        if (!commentText.trim()) return;

        setPostingComment(true);
        try {
            const response = await axios.post(
                `http://localhost:3000/api/tickets/${openNotesTicketId}/comments`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments((prev) => [...prev, response.data]);
            setCommentText("");
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not post note");
        }
        finally {
            setPostingComment(false);
        }
    }

    const handleReportCustomer = async (customer, reasons) => {
    const extra = window.prompt(
        `Report ${customer.name || customer.email} to Admin?\n\nAuto-detected: ${reasons.join(", ")}\n\nAdd a note (optional):`
    );
    if (extra === null) return; // cancelled

    try {
        await axios.patch(
            `http://localhost:3000/api/users/customers/${customer.id}/report`,
            { reason: `${reasons.join(", ")}${extra ? " — " + extra : ""}` },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Reported to Admin.");
    }
    catch (error) {
        alert(error.response?.data?.error || "Could not send report");
    }
}

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    const selectedCustomer = customers.find((c) => c.id === selectedId);

    const suspiciousCount = customers.filter(
        (c) => checkSuspicious(ticketsFor(c.id)).length > 0
    ).length;
    const normalCount = customers.length - suspiciousCount;

    const fraudCheckData = [
        { name: "Normal", count: normalCount },
        { name: "Suspicious", count: suspiciousCount },
    ];

    return (
        <div>

            <h1 className="text-3xl font-bold">CUSTOMERS</h1><br />

            {customers.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Fraud Check Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={140}>
                                <BarChart data={fraudCheckData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#ef4444" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <br />
                </>
            )}

            <div className="grid grid-cols-3 gap-6">

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>All Customers</CardTitle>
                    </CardHeader>
                    <CardContent>

                        {customers.length === 0 ? (
                            <p className="text-sm text-slate-500">No customers yet</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Tickets</TableHead>
                                        <TableHead>Satisfaction</TableHead>
                                        <TableHead>Flag</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => {
                                        const custTickets = ticketsFor(customer.id);
                                        const avg = averageRating(custTickets);
                                        const suspiciousReasons = checkSuspicious(custTickets);

                                        return (
                                            <TableRow key={customer.id}>
                                                <TableCell>#{customer.id}</TableCell>
                                                <TableCell>{customer.name || "—"}</TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto"
                                                        onClick={() => setSelectedId(customer.id)}
                                                    >
                                                        {custTickets.length} ticket(s)
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    {avg === null ? (
                                                        <span className="text-slate-400">Not rated</span>
                                                    ) : (
                                                        <span>⭐ {avg} / 5</span>
                                                    )}
                                                </TableCell>
                                               <TableCell>
    {suspiciousReasons.length === 0 ? (
        <span className="text-slate-300">—</span>
    ) : (
        <div className="flex items-center gap-2">
            <Badge
                className="bg-red-100 text-red-700"
                title={suspiciousReasons.join(", ")}
            >
                ⚠ Suspicious
            </Badge>
            <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleReportCustomer(customer, suspiciousReasons)}
            >
                Report
            </Button>
        </div>
    )}
</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedCustomer ? `Tickets — ${selectedCustomer.email}` : "Select a customer"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>

                        {!selectedCustomer ? (
                            <p className="text-sm text-slate-500">Click ticket ...see details.</p>
                        ) : (
                            <>
                                {checkSuspicious(ticketsFor(selectedCustomer.id)).length > 0 && (
                                    <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
                                        <p className="font-medium">⚠ Flagged for review:</p>
                                        <ul className="list-disc list-inside">
                                            {checkSuspicious(ticketsFor(selectedCustomer.id)).map((reason) => (
                                                <li key={reason}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {ticketsFor(selectedCustomer.id).length === 0 ? (
                                    <p className="text-sm text-slate-500">No tickets from this customer</p>
                                ) : (
                                    <div className="space-y-3">
                                        {ticketsFor(selectedCustomer.id).map((ticket) => (
                                            <div key={ticket.id} className="border-b border-slate-100 pb-2">
                                                <p className="text-sm font-medium">#{ticket.id} — {ticket.title}</p>
                                                <Badge className={statusColor(ticket.status)}>{ticket.status}</Badge>
                                                <span className="ml-2 text-sm text-slate-500">
                                                    {ticket.rating != null ? `⭐ ${ticket.rating}/5` : "Not rated"}
                                                </span>

                                                <div>
                                                    <button
                                                        type="button"
                                                        className="mt-1 text-xs text-blue-600 hover:underline"
                                                        onClick={() => handleToggleNotes(ticket.id)}
                                                    >
                                                        {openNotesTicketId === ticket.id ? "Hide notes" : "View / add notes"}
                                                    </button>
                                                </div>

                                                {openNotesTicketId === ticket.id && (
                                                    <div className="mt-2 rounded-md border bg-slate-50 p-2">
                                                        {commentsLoading ? (
                                                            <p className="text-xs text-slate-400">Loading notes...</p>
                                                        ) : (
                                                            <div className="space-y-2 max-h-[140px] overflow-y-auto">
                                                                {comments.length === 0 ? (
                                                                    <p className="text-xs text-slate-400">No notes yet</p>
                                                                ) : (
                                                                    comments.map((c) => (
                                                                        <div key={c.id} className="text-xs border-b border-slate-200 pb-1">
                                                                            <p className="font-medium text-slate-700">{c.author?.name || c.author?.email}</p>
                                                                            <p className="text-slate-600">{c.content}</p>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-2 flex gap-2">
                                                            <Input
                                                                value={commentText}
                                                                onChange={(e) => setCommentText(e.target.value)}
                                                                placeholder="Leave a note..."
                                                                className="h-8 text-xs"
                                                                onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                                                            />
                                                            <Button size="sm" onClick={handlePostComment} disabled={postingComment}>
                                                                Post
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                    </CardContent>
                </Card>

            </div>

        </div>
    );
}