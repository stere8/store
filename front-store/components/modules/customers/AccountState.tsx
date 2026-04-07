"use client";

import Link from "next/link";

type AccountStateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type AccountStateProps = {
  title: string;
  description: string;
  primaryAction?: AccountStateAction;
  secondaryAction?: AccountStateAction;
};

const actionClassName = (variant: AccountStateAction["variant"] = "primary") =>
  variant === "secondary"
    ? "rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
    : "rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600";

export default function AccountState({
  title,
  description,
  primaryAction,
  secondaryAction,
}: AccountStateProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className={actionClassName(primaryAction.variant)}
            >
              {primaryAction.label}
            </Link>
          )}

          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={actionClassName(secondaryAction.variant)}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
