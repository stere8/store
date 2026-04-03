import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/10",
        className
      )}
    >
      {children}
    </section>
  );
}
