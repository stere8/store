import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 text-3xl font-bold text-white lg:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
