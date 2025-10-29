import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-xs font-semibold transition-colors w-fit capitalize cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 border-primary-500 hover:bg-primary-600 disabled:bg-primary-200 dark:text-primary-500 dark:hover:bg-primary-50 dark:border-primary-500  dark:disabled:bg-primary-200 dark:disabled:border-primary-200 px-2.5 py-0.5",
        secondary:
          "bg-secondary-500 border-secondary-500 hover:bg-secondary-600 disabled:bg-secondary-200 dark:text-secondary-500 dark:hover:bg-secondary-50 dark:border-secondary-500 200 px-2.5 py-0.5",
        success:
          "bg-success-500 border-success-500 hover:bg-success-600 disabled:bg-success-200 dark:text-success-500 dark:hover:bg-success-50 dark:border-success-500  dark:disabled:bg-success-200 dark:disabled:border-success-200 px-2.5 py-0.5",
        danger:
          "bg-danger-500 border-danger-500 hover:bg-danger-600 disabled:bg-danger-200 dark:text-danger-500 dark:hover:bg-danger-50 dark:border-danger-500  dark:disabled:bg-danger-200 dark:disabled:border-danger-200 px-2.5 py-0.5",
        warning:
          "bg-warning-500 border-warning-500 hover:bg-warning-600 disabled:bg-warning-200 dark:text-warning-500 dark:hover:bg-warning-50 dark:border-warning-500  dark:disabled:bg-warning-200 dark:disabled:border-warning-200 px-2.5 py-0.5",
        outline:
          "text-slate-950 px-[12px] py-[6px] border border-gray-800 text-white hover:bg-gray-800 dark:text-slate-50 px-2.5 py-0.5",

        gray: "text-black px-[24px] py-[14px] bg-gray-50 hover:bg-gray-200 dark:text-slate-50",
        "primary-outline":
          "bg-gray-50 py-4 border-gray-200 hover:bg-primary-600 hover:text-white disabled:bg-primary-200 px-2.5 py-0.5",
      },
      active: {
        true: "bg-gray-800",
        false: "",
      },
      size: {
        rounded:
          "bg-white p-3  rounded-full !flex !w-full justify-center items-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      active: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  active?: boolean;
}

function Badge({ className, variant, active, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className, active)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
