import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import React from "react";

export default function ProductQty({
  qty,
  setQty,
}: {
  qty: number;
  setQty: (v: number) => void;
}) {
  const updateQty = (value: string) => {
    if (value === "dec") {
      if (qty === 1) {
        return;
      }
    }
    if (value === "inc") {
      if (qty === 10) {
        // Assuming the maximum quantity is 10
        return;
      }
    }

    // Cart operation
    if (value === "dec") {
      setQty(qty === 1 ? qty : qty - 1);
    }
    if (value === "inc") {
      setQty(qty === 10? qty : qty + 1);
      // Assuming the maximum quantity is 10
    }
  };

  return (
    <div className="flex gap-[4px] border border-border items-center w-full md:w-fit justify-center">
      <Button
        onClick={() => updateQty("dec")}
        variant="outline"
        size="lg"
        className="border-none py-1"
      >
        <Minus />
      </Button>
      <strong className="text-xl w-10 text-center">{qty}</strong>
      <Button
        onClick={() => updateQty("inc")}
        variant="outline"
        size="lg"
        className="border-none py-1"
      >
        <Plus />
      </Button>
    </div>
  );
}
