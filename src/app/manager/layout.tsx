"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AssistantPanel from "@/components/AssistantPanel";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const pathname = usePathname();

    const [authorized, setAuthorized] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        name: "",
        email: "",
    })

    useEffect(() => {

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const decoded = jwtDecode<{ sub: number; email: string; role: string }>(token);

            if (decoded.role != "Manager") {
                router.push("/login");
                return;
            }

            setCurrentUser({ name: decoded.email, email: decoded.email });
            setAuthorized(true);
        }
        catch (error) {
            router.push("/login");
        }

    }, [])

    if (!authorized) {
        return null;
    }

    const navItems = [
        { href: "/manager", label: "Dashboard" },
        { href: "/manager/assigned", label: "Assigned Tickets" },
        { href: "/manager/tickets", label: "Ticket Details" },
        { href: "/manager/team", label: "Team Management" },
        { href: "/manager/reports", label: "Reports" },
        { href: "/manager/customers", label: "Customers" }
    ];

    return (
        <div className="min-h-screen bg-slate-50">

            <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-950 text-white">

                <div className="flex h-20 items-center border-b border-slate-800 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
                        S
                    </div>
                    <h1 className="ml-3 font-semibold">Support Ticket System</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex w-full items-center rounded-xl px-3 py-3 text-sm transition-colors",
                                pathname === item.href
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <Separator className="bg-slate-800" />

                <div className="p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
                        onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            router.push("/login");
                        }}
                    >
                        Logout
                    </Button>
                </div>

            </aside>

            <div className="ml-64">

                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-white px-8">

                    <Input
                        type="text"
                        placeholder="Search tickets, users, or keywords..."
                        className="max-w-md"
                    />

                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{currentUser.name}</span>
                    </div>

                </header>

                <main className="p-8">
                    {children}
                </main>

            </div>

            <AssistantPanel />

        </div>
    );
}