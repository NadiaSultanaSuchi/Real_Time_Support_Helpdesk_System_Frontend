"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ManagerLayout({ children }) {

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
            console.log("no token, redirecting");
            router.push("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            console.log(decoded);

            if (decoded.role != "Manager") {
                console.log("not a manager, redirecting");
                router.push("/login");
                return;
            }

            setCurrentUser({ name: decoded.name, email: decoded.email });
            setAuthorized(true);
        }
        catch (error) {
            console.log(error);
            router.push("/login");
        }

    }, [])

    if (!authorized) {
        return null;
    }

    const navItems = [
        { href: "/manager", label: "Dashboard" },
        { href: "/manager/assigned", label: "Assigned Tickets" },
        { href: "/manager/team", label: "Team Management" },
        { href: "/manager/customers", label: "Customers" },
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

                <nav className="flex-1 px-4 py-6">

                    {navItems.map((item) => (
                        <div key={item.href}>
                            <Link
                                href={item.href}
                                className={
                                    pathname === item.href
                                        ? "flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-3 text-sm"
                                        : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300"
                                }
                            >
                                {item.label}
                            </Link><br />
                        </div>
                    ))}

                </nav>

                <div className="border-t border-slate-800 p-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            console.log("logging out");
                            router.push("/login");
                        }}
                        className="text-sm text-slate-300"
                    >
                        Logout
                    </button>
                </div>

            </aside>

            <div className="ml-64">

                <header className="sticky top-0 z-10 flex h-20 items-center justify-end border-b bg-white px-8">

                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{currentUser.name ? currentUser.name.charAt(0) : "M"}</AvatarFallback>
                        </Avatar>
                        <span>{currentUser.email}</span>
                    </div>

                </header>

                <main className="p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}