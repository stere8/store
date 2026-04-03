export function FlashMessage({
  kind,
  message,
}: {
  kind: "success" | "error";
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        kind === "success"
          ? "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
          : "rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
      }
    >
      {message}
    </div>
  );
}
