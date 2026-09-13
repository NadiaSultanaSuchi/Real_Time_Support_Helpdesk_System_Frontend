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

export default function TeamPage() {

    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    useEffect(() => {

        const loadTeam = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/users/team", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTeam(response.data);
            }
            catch (error) {
                if (error.response) {
                    setErrorMessage(error.response.data?.error || "Could not load team");
                } else {
                    setErrorMessage("Could not reach the server. Is the backend running?");
                }
            }
            finally {
                setLoading(false);
            }
        }

        loadTeam();

    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    const totalMembers = team.length;
    const totalAssigned = team.reduce((sum, m) => sum + m.assignedTickets, 0);
    const totalResolved = team.reduce((sum, m) => sum + m.resolvedTickets, 0);

    return (
        <div>

            <h1 className="text-3xl font-bold">TEAM MANAGEMENT</h1><br />

            <div className="grid grid-cols-3 gap-6">

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Team Members</p>
                        <p className="text-3xl font-bold">{totalMembers}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Assigned</p>
                        <p className="text-3xl font-bold">{totalAssigned}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Resolved</p>
                        <p className="text-3xl font-bold">{totalResolved}</p>
                    </CardContent>
                </Card>

            </div>

            <br />

            <Card>
                <CardHeader>
                    <CardTitle>Team Workload</CardTitle>
                </CardHeader>
                <CardContent>

                    {team.length === 0 ? (
                        <p className="text-sm text-slate-500">No team members found</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Assigned</TableHead>
                                    <TableHead>In Progress</TableHead>
                                    <TableHead>Resolved</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.name || "—"}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge className={member.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{member.assignedTickets}</TableCell>
                                        <TableCell>{member.inProgressTickets}</TableCell>
                                        <TableCell>{member.resolvedTickets}</TableCell>
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