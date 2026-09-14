import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">

      <header className="flex w-full items-center justify-between px-8 py-6">

        <div className="text-lg font-bold">SupportDesk</div>

        <nav className="flex gap-8">
          <Link className="text-sm tracking-wider text-gray-300 transition hover:text-white" href="/">HOME</Link>
          <Link className="text-sm tracking-wider text-gray-300 transition hover:text-white" href="/tickets">TICKETS</Link>
          <Link className="text-sm tracking-wider text-gray-300 transition hover:text-white" href="/profile">PROFILE</Link>
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition duration-300 hover:bg-gray-200"
        >
          Sign In
        </Link>

      </header>

      <section className="grid flex-1 grid-cols-1 items-center gap-8 px-8 md:grid-cols-2 md:px-16">

        <div className="space-y-6">

          <span className="inline-block rounded-full border-2 border-violet-500 px-8 py-2 text-sm">
            INTRODUCING
          </span>

          <h2 className="text-6xl font-bold leading-tight md:text-8xl">
            Support
            <br />
            Desk
          </h2>

          <div className="text-xl text-gray-300">
            <p>Easily keep track of your support</p>
            <p>tickets and get help from us!</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              className="rounded-full border border-purple-500 bg-violet-500 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500 transition duration-300 hover:bg-violet-400 hover:shadow-xl"
              href="/login"
            >
              Tickets
            </Link>

            <Link
              className="rounded-full border border-gray-500 bg-gray-900 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-gray-700 transition duration-300 hover:bg-gray-800 hover:shadow-xl"
              href="/register"
            >
              Get Started
            </Link>
          </div>

        </div>

        <div className="hidden h-full items-center justify-center md:flex">
          <div className="relative h-[530px] w-[750px] overflow-hidden">
            <iframe
              src="https://my.spline.design/robotfollowcursorforlandingpagemc-L4aXlK6ivcp17W0u5V4DunBq/"
              className="h-full w-full border-0"
              style={{ transform: "scale(1.3)", transformOrigin: "center" }}
              allow="autoplay; fullscreen"
            />
          </div>
        </div>

      </section>

      <footer className="px-8 pb-6 text-right text-xs text-slate-400">
        © 2026 SupportDesk
      </footer>

    </main>
  );
}