"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

    const [customerSatisfaction, setCustomerSatisfaction] = useState({
        overallAvgRating: 0,
        trend: [],
    })

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null); // Nadia

    useEffect(() => {

        const loadDashboard = async () => {

            try {
                const token = localStorage.getItem("accessToken");

                const response = await axios.get("http://localhost:3000/api/dashboard/manager", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(response.data);

                setProfile(response.data.profile);
                setStats(response.data.stats);
                setTicketVolume(response.data.ticketVolume);
                setTicketStatusBreakdown(response.data.ticketStatusBreakdown);
                setRecentTickets(response.data.recentTickets);
                setTeamMembersCount(response.data.teamMembersCount);
                setAvgResponseTimeMinutes(response.data.avgResponseTimeMinutes);
                setCustomerSatisfaction(response.data.customerSatisfaction);

                setLoading(false);
            }
            catch (error) {
            
                if (error.response) {
                    console.log(error.response.data);
                    setErrorMessage(error.response.data?.error || "Could not load dashboard");
                } else {
                    console.log(error.message);
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

            <div className="grid grid-cols-2 gap-6">

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

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Satisfaction (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={customerSatisfaction.trend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="avgRating" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}