import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowRight, Circle } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center border !text-heading4 text-white whitespace-nowrap rounded-full font-normal uppercase transition-colors focus-visible:outline-none dark:bg-white gap-x-[12px] px-[32px] h-[56px] ",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 border-primary-500 hover:bg-primary-600 disabled:bg-primary-200 dark:text-primary-500 dark:hover:bg-primary-50 dark:border-primary-500  dark:disabled:bg-primary-200 dark:disabled:border-primary-200",
        secondary:
          "bg-secondary-500 border-secondary-500 hover:bg-secondary-600 disabled:bg-secondary-200 dark:text-secondary-500 dark:hover:bg-secondary-50 dark:border-secondary-500 200",
        success:
          "bg-success-500 border-success-500 hover:bg-success-600 disabled:bg-success-200 dark:text-success-500 dark:hover:bg-success-50 dark:border-success-500  dark:disabled:bg-success-200 dark:disabled:border-success-200",
        danger:
          "bg-danger-500 border-danger-500 hover:bg-danger-600 disabled:bg-danger-200 dark:text-danger-500 dark:hover:bg-danger-50 dark:border-danger-500  dark:disabled:bg-danger-200 dark:disabled:border-danger-200",
        warning:
          "bg-warning-500 border-warning-500 hover:bg-warning-600 disabled:bg-warning-200 dark:text-warning-500 dark:hover:bg-warning-50 dark:border-warning-500  dark:disabled:bg-warning-200 dark:disabled:border-warning-200",
        "primary-outline":
          "border-primary-500 bg-transparent text-primary-500 hover:text-primary-500 hover:bg-primary-50 disabled:border-primary-200",
        "secondary-outline":
          "border-secondary-500 bg-transparent text-secondary-500 hover:text-secondary-500 hover:bg-secondary-50 disabled:border-secondary-200",
        "success-outline":
          "border-success-500 bg-transparent text-success-500 hover:text-success-500 hover:bg-success-50 disabled:border-success-200",
        "danger-outline":
          "border-danger-500 bg-transparent text-danger-500 hover:text-danger-500 hover:bg-danger-50 disabled:border-danger-200",
        "warning-outline":
          "border-warning-500 bg-transparent text-prwarningimary-500 hover:text-warning-500 hover:bg-warning-50 disabled:border-warning-200",
      },

      size: {
        sm: "w-fit",
        lg: "w-full",
      },
      icon: {
        none: "none",
        after: "after",
        before: "before",
        afterBefore: "afterBefore",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
      icon: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, variant, size, icon, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "relative ",
          buttonVariants({ variant, size, icon, className })
        )}
        ref={ref}
        {...props}
      >
        <Circle
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
        {children}
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
Button.displayName = "RectangleButton";

export { Button as RectangleButton, buttonVariants };
