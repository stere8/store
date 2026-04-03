import { formatMoney } from "@/lib/admin-ui";

export function MetricCard({
  label,
  value,
  detail,
  currency,
}: {
  label: string;
  value: number;
  detail: string;
  currency?: boolean;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/60 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-bold text-white">
        {currency ? formatMoney(value) : value.toLocaleString("en-US")}
      </p>
      <p className="mt-3 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
