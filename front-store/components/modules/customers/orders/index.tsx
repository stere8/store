"use client";

import React from "react";
import LeftSidebar from "../LeftSidebar";
import Container from "@/components/custom/Container";
import Link from "next/link";

export default function Orders() {
  return (
    <section className="py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-8">
          <LeftSidebar />
          <div className="col-span-3 rounded-lg border border-gray-100 bg-white p-8">
            <h2 className="text-heading4">
              Reservation history is not linked yet
            </h2>
            <p className="mt-3 max-w-2xl text-body-sm-400 text-gray-700">
              The current .NET API supports reservations created from the cart,
              but this legacy screen still depended on the older user order
              service. Reserve a cart to receive a reservation number and pickup
              code immediately.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full border border-primary-500 px-6 py-3 text-sm font-medium text-primary-500"
              >
                Browse products
              </Link>
              <Link
                href="/cart"
                className="rounded-full bg-primary-500 px-6 py-3 text-sm font-medium text-white"
              >
                Open cart
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
