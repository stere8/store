"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  tone?: "supported" | "planned";
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export function NavMenu({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">
            {section.label}
          </p>
          <div className="mt-3 space-y-1">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{item.label}</span>
                  {item.tone === "planned" ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                        active
                          ? "bg-slate-950/10 text-slate-900"
                          : "bg-white/10 text-slate-400"
                      )}
                    >
                      Planned
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
