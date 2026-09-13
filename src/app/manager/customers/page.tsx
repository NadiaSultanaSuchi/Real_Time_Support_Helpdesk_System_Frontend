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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function statusColor(status) {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "InProgress") return "bg-amber-100 text-amber-700";
    if (status === "Closed") return "bg-slate-200 text-slate-600";
    return "bg-blue-100 text-blue-700";
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
    const [editEmail, setEditEmail] = useState("");
    const [saving, setSaving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
            setErrorMessage(null);
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

    useEffect(() => {
        loadData();
    }, [])

    const selectedCustomer = customers.find((c) => c.id === selectedId);

    useEffect(() => {
        if (selectedCustomer) {
            setEditEmail(selectedCustomer.email);
        }
    }, [selectedId])

    const ticketsFor = (customerId) => {
        return tickets.filter((t) => t.customer?.id === customerId);
    }

    const handleSaveEmail = async () => {
        if (!selectedCustomer || editEmail === selectedCustomer.email) return;

        setSaving(true);
        try {
            await axios.patch(`http://localhost:3000/api/users/customers/${selectedCustomer.id}`, { email: editEmail }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadData();
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not update customer");
        }
        finally {
            setSaving(false);
        }
    }

    const handleDelete = async () => {
        if (!selectedCustomer) return;
        const confirmed = confirm(`Delete ${selectedCustomer.email}? This cannot be undone.`);
        if (!confirmed) return;

        setSaving(true);
        try {
            await axios.delete(`http://localhost:3000/api/users/customers/${selectedCustomer.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedId(null);
            await loadData();
        }
        catch (error) {
            alert(error.response?.data?.error || "Could not delete customer");
        }
        finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    if (errorMessage) {
        return <p className="text-red-600">{errorMessage}</p>
    }

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
                                            <TableRow
                                                key={customer.id}
                                                onClick={() => setSelectedId(customer.id)}
                                                className={
                                                    selectedId === customer.id
                                                        ? "cursor-pointer bg-blue-50"
                                                        : "cursor-pointer"
                                                }
                                            >
                                                <TableCell>#{customer.id}</TableCell>
                                                <TableCell>{customer.name || "—"}</TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>{custTickets.length} ticket(s)</TableCell>
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
                            {selectedCustomer ? `#${selectedCustomer.id} — ${selectedCustomer.name || "Customer"}` : "Select a customer"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>

                        {!selectedCustomer ? (
                            <p className="text-sm text-slate-500">Click a row on the left to see and edit details.</p>
                        ) : (
                            <div className="space-y-4">

                                <div>
                                    <p className="mb-1 text-xs text-slate-500">Email</p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                        />
                                        <Button
                                            size="sm"
                                            disabled={saving || editEmail === selectedCustomer.email}
                                            onClick={handleSaveEmail}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={saving}
                                    onClick={handleDelete}
                                >
                                    Delete Customer
                                </Button>

                                <div>
                                    <p className="mb-2 text-xs text-slate-500">Tickets</p>
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
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>

        </div>
    );
}