"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Frontadmin Error</p>
        <h1 className="mt-3 text-3xl font-bold text-white">The admin app hit an unexpected error.</h1>
        <p className="mt-4 text-sm text-slate-300">{error.message || "Unknown error."}</p>
        <button
          className="mt-6 rounded-full bg-orange-400 px-5 py-2 text-sm font-semibold text-slate-950"
          onClick={() => reset()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
