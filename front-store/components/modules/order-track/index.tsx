"use client";

import Container from "@/components/custom/Container";
import React from "react";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

export default function OrderTrack() {
  const router = useRouter();

  return (
    <section className="py-10">
      <Container>
        <div className="flex flex-col gap-4">
          <p className="text-black my-2 text-heading1 capitalize">
            <FormattedMessage id="need-help.Track-order-title" />
          </p>
          <p className="max-w-2xl text-body-sm-400 text-gray-700">
            The current .NET API supports reservations and pickup codes rather
            than shipment-style order tracking. After reserving your cart, keep
            the reservation number and pickup code shown on the confirmation
            screen.
          </p>
        </div>

        <div className="py-8">
          <div className="max-w-2xl rounded-lg border border-gray-100 bg-white p-8">
            <p className="text-body-sm-400 text-gray-700">
              Reserve products from the cart to get the details you need for
              pickup.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RectangleButton
                icon="none"
                onClick={() => router.push("/products")}
              >
                Browse products
              </RectangleButton>
              <RectangleButton
                icon="after"
                variant="primary-outline"
                onClick={() => router.push("/cart")}
              >
                Open cart
              </RectangleButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
