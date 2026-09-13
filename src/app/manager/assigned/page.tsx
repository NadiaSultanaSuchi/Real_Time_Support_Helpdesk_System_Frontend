"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function statusColor(status: string) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700";
}

function priorityColor(priority: string) {
    if (priority === "Urgent") return "bg-red-100 text-red-700";
    if (priority === "High") return "bg-orange-100 text-orange-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
}

export default function AssignedTicketsPage() {

    const [totalAssigned, setTotalAssigned] = useState(0);
    const [byStatus, setByStatus] = useState<any>({});
    const [tickets, setTickets] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [actingOnId, setActingOnId] = useState<number | null>(null);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

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
        catch (error: any) {
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
    }, [])

    const handleRowClick = async (ticketId: number) => {
        setSheetOpen(true);
        setDetailLoading(true);
        setSelectedTicket(null);

        try {
            const response = await axios.get(`http://localhost:3000/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTicket(response.data);
        }
        catch (error: any) {
            alert(error.response?.data?.error || "Could not load ticket details");
            setSheetOpen(false);
        }
        finally {
            setDetailLoading(false);
        }
    }

    const handleEscalate = async (ticketId: number) => {
        setActingOnId(ticketId);
        try {
            await axios.patch(`http://localhost:3000/api/tickets/${ticketId}/escalate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadAssignedTickets();
        }
        catch (error: any) {
            alert(error.response?.data?.error || "Could not escalate ticket");
        }
        finally {
            setActingOnId(null);
        }
    }

    const handleClose = async (ticketId: number) => {
        setActingOnId(ticketId);
        try {
            await axios.patch(`http://localhost:3000/api/tickets/${ticketId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadAssignedTickets();
        }
        catch (error: any) {
            alert(error.response?.data?.error || "Could not close ticket");
        }
        finally {
            setActingOnId(null);
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

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
                </CardHeader>
                <CardContent>

                    {tickets.length === 0 ? (
                        <p className="text-sm text-slate-500">No assigned tickets</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
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
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEscalate(ticket.id)}
                                                    disabled={actingOnId === ticket.id || ticket.priority === "Urgent"}
                                                >
                                                    Escalate
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleClose(ticket.id)}
                                                    disabled={actingOnId === ticket.id || ticket.status === "Closed"}
                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Ticket Details</SheetTitle>
                    </SheetHeader>

                    <div className="px-4">
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

                                <div className="flex gap-2">
                                    <Badge className={statusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                                    <Badge className={priorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
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
                                        <p className="text-sm text-slate-500">Rating</p>
                                        <p className="text-sm">⭐ {selectedTicket.rating}/5</p>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}