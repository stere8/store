"use client";

import { cn } from "@/lib/utils";
import { CustomerReservationStatus } from "@/hooks/useCustomerAccount";

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

export default function ReservationStatusBadge({
  status,
}: {
  status: CustomerReservationStatus;
}) {
  const normalizedStatus = status?.toLowerCase() || "unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[normalizedStatus] ||
          "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {status || "Unknown"}
    </span>
  );
}
