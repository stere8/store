import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center border !text-heading4 text-white dark:bg-white whitespace-nowrap rounded-[2px] font-normal uppercase ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 h-[48px] w-[48px]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 border-primary-500 hover:bg-primary-600 disabled:bg-primary-200 dark:text-primary-500 dark:hover:bg-primary-50 dark:disabled:bg-primary-50 dark:border-primary-500",
        secondary:
          "bg-secondary-500 border-secondary-500 hover:bg-secondary-600 disabled:bg-secondary-200 dark:text-secondary-500 dark:hover:bg-secondary-50 dark:disabled:bg-secondary-50 dark:border-secondary-500",
        success:
          "bg-success-500 border-success-500 hover:bg-success-600 disabled:bg-success-200 dark:text-success-500 dark:hover:bg-sucess-50 dark:disabled:bg-sucess-50 dark:border-sucess-500",
        danger:
          "bg-danger-500 border-danger-500 hover:bg-danger-600 disabled:bg-danger-200 dark:text-danger-500 dark:hover:bg-danger-50 dark:disabled:bg-danger-50 dark:border-danger-900",
        warning:
          "bg-warning-500 border-warning-500 hover:bg-warning-600 disabled:bg-warning-200 dark:text-warning-500 dark:hover:bg-warning-50 dark:disabled:bg-warning-50 dark:border-warning-500",
        gray: "bg-gray-900 border-gray-900 hover:bg-gray-700 disabled:bg-gray-700 dark:text-gray-900 dark:hover:bg-gray-50 dark:disabled:bg-gray-50 dark:border-gray-500",
      },

      forms: {
        square: "rounded-0",
        circle: "rounded-full",
      },
      icon: {
        none: "none",
        after: "after",
        before: "before",
      },
    },
    defaultVariants: {
      variant: "primary",
      forms: "square",
      icon: "before",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, forms, icon, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "relative ",
          buttonVariants({ variant, forms, icon, className })
        )}
        ref={ref}
        {...props}
      >
        <ArrowLeft
          className={cn(
            "h-[24px] w-[24px]",
            icon === "after" && "hidden",
            icon === "none" && "hidden",
            variant === "primary" && "dark:text-primary-500",
            variant === "secondary" && "dark:text-secondary-500",
            variant === "success" && "dark:text-success-500",
            variant === "danger" && "dark:text-danger-500",
            variant === "warning" && "dark:text-warning-500"
          )}
        />
        <ArrowRight
          className={cn(
            "h-[24px] w-[24px] ",
            icon === "before" && "hidden",
            icon === "none" && "hidden",
            variant === "primary" && "dark:text-primary-500",
            variant === "secondary" && "dark:text-secondary-500",
            variant === "success" && "dark:text-success-500",
            variant === "danger" && "dark:text-danger-500",
            variant === "warning" && "dark:text-warning-500"
          )}
        />
      </Comp>
    );
  }
);
Button.displayName = "ArrowButton";

export { Button as ArrowButton, buttonVariants };
