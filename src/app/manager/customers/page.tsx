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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function CustomersPage() {

    const [customers, setCustomers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

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

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

    const selectedCustomer = customers.find((c) => c.id === selectedId);

    // shudhu jader rating ache tader diyei chart banacchi,
    // "Not rated" customer-ke 0 hisebe dekhale mone hobe se kharap
    // rating diyeche, ja bhul bojhabe — tai bad dilam.
    const satisfactionData = customers
        .map((c) => ({
            name: c.name || c.email,
            satisfaction: averageRating(ticketsFor(c.id)),
        }))
        .filter((row) => row.satisfaction !== null);

    return (
        <div>

            <h1 className="text-3xl font-bold">CUSTOMERS</h1><br />

            {satisfactionData.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Satisfaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={satisfactionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="satisfaction" fill="#f59e0b" />
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => {
                                        const custTickets = ticketsFor(customer.id);
                                        const avg = averageRating(custTickets);

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
                            <p className="text-sm text-slate-500">Click "N ticket(s)" on the left to see details.</p>
                        ) : ticketsFor(selectedCustomer.id).length === 0 ? (
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
                                    </div>
                                ))}
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>

        </div>
    );
}