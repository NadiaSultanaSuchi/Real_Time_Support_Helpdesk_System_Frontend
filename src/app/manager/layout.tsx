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
            setCurrentUser({ name: decoded.email, email: decoded.email });
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

                    <Link href="/manager" className={pathname == "/manager" ? "flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-3 text-sm" : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300"}>
                        Dashboard
                    </Link><br />

                    <Link href="/manager/assigned" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300">
                        Assigned Tickets
                    </Link><br />

                    <Link href="/manager/tickets" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300">
                        Ticket Details
                    </Link><br />

                    <Link href="/manager/team" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300">
                        Team Management
                    </Link><br />

                    <Link href="/manager/reports" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300">
                        Reports
                    </Link><br />

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

                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-white px-8">

                    <input
                        type="text"
                        placeholder="Search tickets, users, or keywords..."
                        className="w-full max-w-md rounded-xl border px-4 py-2.5 text-sm"
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

        </div>
    );
}