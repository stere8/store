import React from "react";
import { cn } from "@/lib/utils";

export default function Row({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center h-full", className)}>{children}</div>
  );
}
