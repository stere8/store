import type { ReservationStatus } from "@/lib/estore-api";

export const getCurrencyCode = () =>
  process.env.NEXT_PUBLIC_ESTORE_CURRENCY || "USD";

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: getCurrencyCode(),
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const slugLabel = (segments: string[]) =>
  segments
    .map((segment) =>
      segment
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    )
    .join(" / ");

export const statusTone = (status?: ReservationStatus | string | null) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30";
    case "Confirmed":
      return "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30";
    case "Rejected":
      return "bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/30";
    case "Cancelled":
      return "bg-slate-400/15 text-slate-200 ring-1 ring-slate-400/30";
    default:
      return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30";
  }
};

export const buildFlashSearch = (
  path: string,
  kind: "success" | "error",
  message: string
) => {
  const url = new URL(path, "http://frontadmin.local");
  url.searchParams.set(kind, message);
  return `${url.pathname}${url.search}`;
};
