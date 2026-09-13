"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function statusColor(status) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700"; // Open / New
}

function priorityColor(priority) {
    if (priority === "Urgent" || priority === "Critical") return "bg-red-100 text-red-700";
    if (priority === "High") return "bg-orange-100 text-orange-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600"; // Low
}

const donutColors = {
    Open: "#3b82f6",
    New: "#3b82f6",
    InProgress: "#f59e0b",
    Resolved: "#22c55e",
    Closed: "#94a3b8",
};

export default function ManagerDashboard() {

    const [profile, setProfile] = useState({
        id: 0,
        name: "",
        role: "",
    })

    const [stats, setStats] = useState({
        totalTickets: { value: 0, changePct: 0 },
        newTickets: { value: 0, changePct: 0 },
        resolvedTickets: { value: 0, changePct: 0 },
        inProgressTickets: { value: 0, changePct: 0 },
    })

    const [ticketVolume, setTicketVolume] = useState([]);
    const [ticketStatusBreakdown, setTicketStatusBreakdown] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [avgResponseTimeMinutes, setAvgResponseTimeMinutes] = useState(0);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {

        const loadDashboard = async () => {

            try {
                const token = localStorage.getItem("accessToken");

                const response = await axios.get("http://localhost:3000/api/dashboard/manager", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProfile(response.data.profile);
                setStats(response.data.stats);
                setTicketVolume(response.data.ticketVolume);
                setTicketStatusBreakdown(response.data.ticketStatusBreakdown);
                setRecentTickets(response.data.recentTickets);
                setTeamMembersCount(response.data.teamMembersCount);
                setAvgResponseTimeMinutes(response.data.avgResponseTimeMinutes);

                setLoading(false);
            }
            catch (error) {
                if (error.response) {
                    setErrorMessage(error.response.data?.error || "Could not load dashboard");
                } else {
                    setErrorMessage("Could not reach the server. Is the backend running?");
                }
                setLoading(false);
            }

        }

        loadDashboard();

    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    return (
        <div>

            <h1 className="text-3xl font-bold">MANAGER DASHBOARD</h1><br />

            <div className="grid grid-cols-4 gap-6">

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Tickets</p>
                        <p className="text-3xl font-bold">{stats.totalTickets.value}</p>
                        <p className={stats.totalTickets.changePct >= 0 ? "text-xs text-green-600" : "text-xs text-red-600"}>
                            {stats.totalTickets.changePct >= 0 ? "↑" : "↓"} {stats.totalTickets.changePct}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">New Tickets</p>
                        <p className="text-3xl font-bold">{stats.newTickets.value}</p>
                        <p className={stats.newTickets.changePct >= 0 ? "text-xs text-green-600" : "text-xs text-red-600"}>
                            {stats.newTickets.changePct >= 0 ? "↑" : "↓"} {stats.newTickets.changePct}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Resolved Tickets</p>
                        <p className="text-3xl font-bold">{stats.resolvedTickets.value}</p>
                        <p className={stats.resolvedTickets.changePct >= 0 ? "text-xs text-green-600" : "text-xs text-red-600"}>
                            {stats.resolvedTickets.changePct >= 0 ? "↑" : "↓"} {stats.resolvedTickets.changePct}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-3xl font-bold">{stats.inProgressTickets.value}</p>
                        <p className={stats.inProgressTickets.changePct >= 0 ? "text-xs text-green-600" : "text-xs text-red-600"}>
                            {stats.inProgressTickets.changePct >= 0 ? "↑" : "↓"} {stats.inProgressTickets.changePct}% from last month
                        </p>
                    </CardContent>
                </Card>

            </div>

            <br />

            <Card>
                <CardHeader>
                    <CardTitle>Ticket Volume (This Week)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ticketVolume}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#60a5fa" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <br />

            <div className="grid grid-cols-3 gap-6">

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTickets.length === 0 ? (
                            <p className="text-sm text-slate-500">No tickets yet</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTickets.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell>#TKT-{ticket.id}</TableCell>
                                            <TableCell>{ticket.title}</TableCell>
                                            <TableCell>{ticket.customerName}</TableCell>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">

                        <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                                <Pie
                                    data={ticketStatusBreakdown}
                                    dataKey="count"
                                    nameKey="status"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                >
                                    {ticketStatusBreakdown.map((entry) => (
                                        <Cell key={entry.status} fill={donutColors[entry.status] ?? "#cbd5e1"} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-4 w-full space-y-2">
                            {ticketStatusBreakdown.map((entry) => (
                                <div key={entry.status} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: donutColors[entry.status] ?? "#cbd5e1" }}
                                        />
                                        {entry.status}
                                    </span>
                                    <span className="font-medium">{entry.count}</span>
                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>

            </div>

        </div>
    );
}