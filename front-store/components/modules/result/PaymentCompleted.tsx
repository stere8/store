"use client";

import React from "react";
import Container from "@/components/custom/Container";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { RectangleButton } from "@/components/custom/RectangleButton";

export default function PaymentCompleted() {
  const routerPath = useRouter();

  return (
    <section className="py-20">
      <Container>
        <div className="flex flex-col gap-8 items-center">
          <Button
            className="h-[66px] w-[66px] rounded-full border-2 border-success-500 bg-success-100"
            size="sm"
          >
            <Check className="text-success-500" />
          </Button>

          <h3>Reservation flow active</h3>

          <p className="text-body-sm-400 text-center max-w-md">
            The storefront now uses reservation checkout instead of the older
            online payment flow. Use the cart confirmation screen to capture the
            reservation number and pickup code for collection.
          </p>

          <div className="flex gap-4">
            <RectangleButton
              icon="none"
              variant="primary-outline"
              onClick={() => routerPath.push("/cart")}
            >
              Back to cart
            </RectangleButton>

            <RectangleButton
              onClick={() => routerPath.push("/products")}
              variant="primary"
              icon="after"
            >
              Browse products
            </RectangleButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
