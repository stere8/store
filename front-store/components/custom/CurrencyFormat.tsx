import { cn } from "@/lib/utils";
import React from "react";
import { NumericFormat } from "react-number-format";

export default function CurrencyFormat({
  value,
  className,
  suffix = false,
}: {
  value: number;
  suffix?: boolean;
  className?: string;
}) {
  return (
    <NumericFormat
      className={cn(
        "tracking-wider inline-flex max-w-[160px] outline-none",
        className
      )}
      prefix="RWF"
      suffix={suffix ? "" : ""}
      value={value}
      decimalScale={0}
      thousandSeparator=","
      decimalSeparator="."
    />
  );
}
