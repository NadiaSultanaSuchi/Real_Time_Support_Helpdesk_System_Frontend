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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

function statusColor(status) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700"; // Open
}

function priorityColor(priority) {
    if (priority === "Urgent") return "bg-red-100 text-red-700";
    if (priority === "High") return "bg-orange-100 text-orange-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600"; // Low
}

const STATUS_OPTIONS = ["Open", "InProgress", "Resolved", "Closed"];

export default function AssignedTicketsPage() {

    const [totalAssigned, setTotalAssigned] = useState(0);
    const [byStatus, setByStatus] = useState({});
    const [tickets, setTickets] = useState([]);
    const [team, setTeam] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [pendingAssigneeId, setPendingAssigneeId] = useState(null);

    const [transferQuery, setTransferQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const loadAssignedTickets = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/tickets/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTotalAssigned(response.data.totalAssigned);
            setByStatus(response.data.byStatus);
            setTickets(response.data.tickets);
            setErrorMessage(null);
        }
        catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data?.error || "Could not load assigned tickets");
            } else {
                setErrorMessage("Could not reach the server. Is the backend running?");
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAssignedTickets();

        axios.get("http://localhost:3000/api/users/team", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => setTeam(res.data)).catch(() => {});
    }, [])

    const handleRowClick = async (ticketId) => {
        setSheetOpen(true);
        setDetailLoading(true);
        setSelectedTicket(null);
        setComments([]);
        setCommentText("");
        setTransferQuery("");
        setShowSuggestions(false);
        setPendingAssigneeId(null);

        try {
            const response = await axios.get(`http://localhost:3000/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTicket(response.data);
            setPendingStatus(response.data.status);

            const commentsRes = await axios.get(`http://localhost:3000/api/tickets/${ticketId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(commentsRes.data);
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not load ticket details");
            setSheetOpen(false);
        }
        finally {
            setDetailLoading(false);
        }
    }

    const handlePickTeammate = (member) => {
        setPendingAssigneeId(member.id);
        setTransferQuery(member.name || member.email);
        setShowSuggestions(false);
    }

    const handleSaveAll = async () => {
        const statusChanged = pendingStatus !== selectedTicket.status;
        const transferChosen = pendingAssigneeId !== null;

        if (!statusChanged && !transferChosen) return;

        setSaving(true);
        try {
            if (statusChanged) {
                await axios.patch(
                    `http://localhost:3000/api/tickets/${selectedTicket.id}/status`,
                    { status: pendingStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (transferChosen) {
                await axios.patch(
                    `http://localhost:3000/api/tickets/${selectedTicket.id}/assign`,
                    { assigneeId: Number(pendingAssigneeId) },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            await loadAssignedTickets();
            setSheetOpen(false);
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not save changes");
        }
        finally {
            setSaving(false);
        }
    }

    const handlePostComment = async () => {
        if (!commentText.trim()) return;

        setPostingComment(true);
        try {
            const response = await axios.post(
                `http://localhost:3000/api/tickets/${selectedTicket.id}/comments`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments((prev) => [...prev, response.data]);
            setCommentText("");
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not post comment");
        }
        finally {
            setPostingComment(false);
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") return true;

    return (
        String(ticket.id).includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        (ticket.customer?.name || "").toLowerCase().includes(query) ||
        (ticket.customer?.email || "").toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query)
    );
});

    const filteredTeam = team
        .filter((member) => member.id !== selectedTicket?.assignee?.id)
        .filter((member) =>
            (member.name || member.email).toLowerCase().includes(transferQuery.toLowerCase())
        );

    const hasUnsavedChanges =
        selectedTicket &&
        (pendingStatus !== selectedTicket.status || pendingAssigneeId !== null);

    return (
        <div>

            <h1 className="text-3xl font-bold">ASSIGNED TICKETS</h1><br />

            <div className="grid grid-cols-4 gap-6">

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Assigned</p>
                        <p className="text-3xl font-bold">{totalAssigned}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Open</p>
                        <p className="text-3xl font-bold">{byStatus.Open ?? 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-3xl font-bold">{byStatus.InProgress ?? 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Resolved</p>
                        <p className="text-3xl font-bold">{byStatus.Resolved ?? 0}</p>
                    </CardContent>
                </Card>

            </div>

            <br />

            <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title or customer email..."
                        className="mt-2 max-w-sm"
                    />
                </CardHeader>
                <CardContent>

                    {filteredTickets.length === 0 ? (
                        <p className="text-sm text-slate-500">No matching tickets</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => handleRowClick(ticket.id)}
                                    >
                                        <TableCell>#{ticket.id}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>{ticket.customer?.email ?? "—"}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColor(ticket.status)}>{ticket.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={priorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Ticket Details</SheetTitle>
                    </SheetHeader>

                    <div className="px-4 flex-1 overflow-y-auto">
                        {detailLoading ? (
                            <p>Loading...</p>
                        ) : !selectedTicket ? (
                            <p className="text-sm text-slate-500">No ticket selected</p>
                        ) : (
                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-slate-500">Title</p>
                                    <p className="font-medium">{selectedTicket.title}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Description</p>
                                    <p className="text-sm">{selectedTicket.description}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setPendingStatus(option)}
                                                className={
                                                    pendingStatus === option
                                                        ? "rounded-md px-3 py-1.5 text-xs font-medium bg-violet-700 text-white"
                                                        : "rounded-md px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }
                                            >
                                                {option === "InProgress" ? "In Progress" : option}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        <Badge className={priorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Customer</p>
                                    <p className="text-sm">{selectedTicket.customer?.name || selectedTicket.customer?.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Created</p>
                                    <p className="text-sm">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                </div>

                                {selectedTicket.rating != null && (
                                    <div>
                                        <p className="text-sm text-slate-500">Customer Rating</p>
                                        <p className="text-sm">⭐ {selectedTicket.rating}/5 (rated by customer)</p>
                                    </div>
                                )}

                                <div className="relative">
                                    <p className="text-sm text-slate-500 mb-1">Transfer to teammate</p>

                                    <Input
                                        value={transferQuery}
                                        onChange={(e) => {
                                            setTransferQuery(e.target.value);
                                            setPendingAssigneeId(null);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Type a name..."
                                    />

                                    {showSuggestions && transferQuery.trim() !== "" && (
                                        <div className="absolute z-50 mt-1 w-full max-h-[160px] overflow-y-auto rounded-md border bg-white shadow-md">
                                            {filteredTeam.length === 0 ? (
                                                <p className="px-3 py-2 text-sm text-slate-400">No match found</p>
                                            ) : (
                                                filteredTeam.map((member) => (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                                                        onClick={() => handlePickTeammate(member)}
                                                    >
                                                        {member.name || member.email} — {member.assignedTickets} assigned
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {pendingAssigneeId !== null && (
                                        <p className="mt-1 text-xs text-violet-700">Will transfer on save ✓</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 mb-2">Internal Notes</p>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                                        {comments.length === 0 ? (
                                            <p className="text-sm text-slate-400">No notes yet</p>
                                        ) : (
                                            comments.map((c) => (
                                                <div key={c.id} className="text-sm border-b border-slate-100 pb-2">
                                                    <p className="font-medium text-slate-700">{c.author?.name || c.author?.email}</p>
                                                    <p className="text-slate-600">{c.content}</p>
                                                    <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-2 flex gap-2">
                                        <Input
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Leave a note for the team..."
                                            onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                                        />
                                        <Button size="sm" onClick={handlePostComment} disabled={postingComment}>
                                            Post
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {selectedTicket && (
                        <div className="border-t p-4">
                            <button
                                type="button"
                                onClick={handleSaveAll}
                                disabled={saving || !hasUnsavedChanges}
                                className="w-full rounded-md bg-violet-800 py-2.5 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    );
}