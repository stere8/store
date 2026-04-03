import { statusTone } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        statusTone(status)
      )}
    >
      {status}
    </span>
  );
}
