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
import { Ticket, FileText, CheckCircle2, Clock, Users, UserCheck } from "lucide-react";

function statusColor(status: string) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700";
}

function priorityColor(priority: string) {
    if (priority === "Urgent" || priority === "Critical") return "bg-red-100 text-red-700";
    if (priority === "High") return "bg-orange-100 text-orange-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
}

const donutColors: Record<string, string> = {
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
        email: "",
        role: "",
    })

    const [stats, setStats] = useState({
        totalTickets: { value: 0, changePct: 0 },
        newTickets: { value: 0, changePct: 0 },
        resolvedTickets: { value: 0, changePct: 0 },
        inProgressTickets: { value: 0, changePct: 0 },
    })

    const [ticketVolume, setTicketVolume] = useState<any[]>([]);
    const [ticketStatusBreakdown, setTicketStatusBreakdown] = useState<any[]>([]);
    const [recentTickets, setRecentTickets] = useState<any[]>([]);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [customerSatisfaction, setCustomerSatisfaction] = useState<any>({
        overallAvgRating: null,
    })

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                setTotalCustomers(response.data.totalCustomers);
                setCustomerSatisfaction(response.data.customerSatisfaction);

                setLoading(false);
            }
            catch (error: any) {
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

    const totalStatusCount = ticketStatusBreakdown.reduce((sum, e) => sum + e.count, 0);

    return (
        <div className="space-y-4">

            <h1 className="text-2xl font-bold">MANAGER DASHBOARD</h1>

            <div className="grid grid-cols-3 gap-3">

                <Card className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <p className="text-sm font-medium">{profile.email}</p>
                    <p className="text-xs text-slate-500">{profile.role}</p>
                    <p className="text-xs text-slate-500">
                        Satisfaction {customerSatisfaction.overallAvgRating != null ? `${customerSatisfaction.overallAvgRating}/5` : "not rated yet"}
                    </p>
                </Card>

                <div className="col-span-2 grid grid-cols-3 gap-2">

                    <Card className="border-none bg-gradient-to-br from-violet-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-violet-100 p-1.5">
                                <Ticket className="h-3.5 w-3.5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Tickets</p>
                                <p className="text-base font-bold leading-tight">{stats.totalTickets.value}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-sky-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-sky-100 p-1.5">
                                <FileText className="h-3.5 w-3.5 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">New Tickets</p>
                                <p className="text-base font-bold leading-tight">{stats.newTickets.value}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-emerald-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-emerald-100 p-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Resolved</p>
                                <p className="text-base font-bold leading-tight">{stats.resolvedTickets.value}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-amber-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-amber-100 p-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">In Progress</p>
                                <p className="text-base font-bold leading-tight">{stats.inProgressTickets.value}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-pink-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-pink-100 p-1.5">
                                <Users className="h-3.5 w-3.5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Customers</p>
                                <p className="text-base font-bold leading-tight">{totalCustomers}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-indigo-50 to-white">
                        <CardContent className="flex items-start gap-2 py-2.5">
                            <div className="rounded-lg bg-indigo-100 p-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Team Members</p>
                                <p className="text-base font-bold leading-tight">{teamMembersCount}</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>

            <div className="grid grid-cols-2 gap-3">

                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm">Ticket Volume (This Week)</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={ticketVolume}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" fontSize={12} />
                                <YAxis fontSize={12} width={24} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm">Ticket Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pb-3">
                        <div className="relative">
                            <ResponsiveContainer width={190} height={190}>
                                <PieChart>
                                    <Pie
                                        data={ticketStatusBreakdown}
                                        dataKey="count"
                                        nameKey="status"
                                        innerRadius={58}
                                        outerRadius={85}
                                        paddingAngle={2}
                                    >
                                        {ticketStatusBreakdown.map((entry) => (
                                            <Cell key={entry.status} fill={donutColors[entry.status] ?? "#cbd5e1"} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold">{totalStatusCount}</span>
                                <span className="text-xs text-slate-500">Total</span>
                            </div>
                        </div>
                        <div className="mt-1 flex flex-wrap justify-center gap-3">
                            {ticketStatusBreakdown.map((entry) => (
                                <span key={entry.status} className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: donutColors[entry.status] ?? "#cbd5e1" }}
                                    />
                                    {entry.status} {entry.count}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>

            <Card>
                <CardHeader className="py-2">
                    <CardTitle className="text-sm">Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto pb-3">
                    {recentTickets.length === 0 ? (
                        <p className="text-sm text-slate-500">No tickets yet</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">ID</TableHead>
                                    <TableHead className="text-xs">Subject</TableHead>
                                    <TableHead className="text-xs">User</TableHead>
                                    <TableHead className="text-xs">Assigned To</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="text-xs">Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="text-xs">#TKT-{ticket.id}</TableCell>
                                        <TableCell className="text-xs">{ticket.title}</TableCell>
                                        <TableCell className="text-xs">{ticket.customerName}</TableCell>
                                        <TableCell className="text-xs">{ticket.assigneeName}</TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColor(ticket.status)} text-xs`}>{ticket.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${priorityColor(ticket.priority)} text-xs`}>{ticket.priority}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}