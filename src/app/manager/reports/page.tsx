"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {

        const loadReport = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                const response = await axios.get("http://localhost:3000/api/tickets/reports/summary", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setReport(response.data);
            }
            catch (error) {
                if (error.response) {
                    setErrorMessage(error.response.data?.error || "Could not load report");
                } else {
                    setErrorMessage("Could not reach the server. Is the backend running?");
                }
            }
            finally {
                setLoading(false);
            }
        }

        loadReport();

    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    const statusData = Object.keys(report.byStatus).map((key) => ({
        name: key,
        count: report.byStatus[key],
    }));

    const priorityData = Object.keys(report.byPriority).map((key) => ({
        name: key,
        count: report.byPriority[key],
    }));

    return (
        <div>

            <h1 className="text-3xl font-bold">REPORTS</h1><br />

            <div className="grid grid-cols-2 gap-6">

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Tickets</p>
                        <p className="text-3xl font-bold">{report.totalTickets}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Escalated Tickets</p>
                        <p className="text-3xl font-bold">{report.escalatedCount}</p>
                    </CardContent>
                </Card>

            </div>

            <br />

            <div className="grid grid-cols-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Tickets by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#60a5fa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tickets by Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={priorityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}