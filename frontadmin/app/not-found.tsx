import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">404</p>
        <h1 className="mt-3 text-3xl font-bold text-white">This frontadmin route does not exist.</h1>
        <p className="mt-4 text-sm text-slate-300">
          The requested page was removed during the EStore.Api refactor or the URL is incorrect.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950"
          >
            Admin dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
