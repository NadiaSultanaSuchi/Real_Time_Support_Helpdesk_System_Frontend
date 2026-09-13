import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      

      <header className="relative z-10 flex w-full items-center justify-between p-4">
        
      </header>

      <nav className="relative z-10 flex justify-center gap-6">
        <Link className="text-sm tracking-wider text-gray-300 hover:text-white transition" href="/">HOME</Link>

        <Link className="text-sm tracking-wider text-gray-300 hover:text-white transition" href="/login">TICKETS</Link>

        <Link className="text-sm tracking-wider text-gray-300 hover:text-white transition" href="/login">PROFILE</Link>
      </nav>

      <div className="absolute top-8 right-170 z-[99]">
        <Link
          href="/login"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-gray-100 hover:bg-gray-200 hover:shadow-gray-100 transition duration-300">Sign In</Link>
      </div>

      <div className="absolute left-40 bottom-170 z-[99]">
      <span className="inline-block border-2 border-violet-500 rounded-full px-8 py-2 text-white text-sm">INTRODUCING</span>
      </div>

      <div className="absolute right-347 bottom-115 text-8xl font-bold">
        <h2>Support</h2>
        <h2>Desk</h2>
      </div>

      <div className="absolute text-xl left-42.5 top-130 text-gray-300">
        <p>Easily keep track of your support</p>
        <p>tickets and get help from us!</p>
      </div>

      <div className="absolute left-40 top-160">
        <Link className="rounded-full border-1 border-purple-500 bg-violet-500 px-7 py-4.5 text-m font-semibold text-white shadow-lg shadow-violet-500 hover:bg-violet-400 hover:shadow-xl hover:shadow-violet-400 transition duration-300" href="/login">Tickets
        </Link>
      </div>

      <div className="absolute left-73 top-161">
        <Link className="rounded-full border-1 border-gray-500 bg-gray-900 px-7 py-5 text-m font-semibold text-white shadow-lg shadow-gray-700 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-400 transition duration-300" href="/registration">Get Started</Link>
      </div>

      <iframe
        src="https://my.spline.design/robotfollowcursorforlandingpagemc-L4aXlK6ivcp17W0u5V4DunBq/"
        className="absolute inset-0 h-full w-full border-0 ml-120 -translate-y-20"
        allow="autoplay; fullscreen"
      />
      <p className="absolute right-10 top-230 text-xs text-slate-400">
          © 2026 SupportDesk
        </p>
    </main>
  );
}

