import Link from "next/link";

export default function HomePage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020203] text-white">
            {/* Background purple glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 72% 46%, rgba(91, 33, 182, 0.18), transparent 36%)",
                }}
            />

            {/* Navigation */}
            <header className="relative z-10">
                <nav className="mx-auto flex max-w-6xl items-center justify-center gap-6 px-6 py-8 sm:gap-10">
                    <Link
                        href="/landing"
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white"
                    >
                        Home
                    </Link>

                    <Link
                        href="/tickets"
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white"
                    >
                        Tickets
                    </Link>

                    <Link
                        href="/profile"
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white"
                    >
                        Profile
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-full bg-white px-7 py-3 text-xs font-semibold uppercase text-black transition hover:bg-zinc-200"
                    >
                        Sign In
                    </Link>
                </nav>
            </header>

            {/* Hero section */}
            <section className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-6xl items-center px-6 pb-24">
                <div className="max-w-xl">
                    <div className="mb-7 inline-flex rounded-full border border-purple-500 px-9 py-2 shadow-[0_0_30px_rgba(147,51,234,0.16)]">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                            Introducing
                        </span>
                    </div>

                    <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
                        Ticket
                        <br />
                        Support
                    </h1>

                    <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-400 sm:text-xl">
                        Easily keep track of your support tickets and get help
                        from us!
                    </p>

                    <div className="mt-9 flex flex-wrap gap-4">
                        <Link
                            href="/tickets"
                            className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-9 py-4 font-semibold text-white shadow-[0_0_28px_rgba(126,34,206,0.55)] transition hover:scale-[1.03] hover:from-purple-500 hover:to-violet-500"
                        >
                            Tickets
                        </Link>

                        <Link
                            href="/register"
                            className="rounded-full border border-zinc-600 bg-zinc-950 px-9 py-4 font-semibold text-zinc-100 transition hover:border-purple-500 hover:bg-zinc-900"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}