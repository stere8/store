import { getCart } from "@/actions/cart";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import CartReservation from "@/cart/CartReservation";
import { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";

export default async function page({ params }: { params: { _id: string } }) {
  const cart = await getCart(params._id);

  if (!cart._id) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs page="cart" />
      <CartReservation cart={cart} />
    </>
  );
}

export const metadata: Metadata = {
  title: "Reserve Cart - E-City - Ecommerce",
  description: "Reserve storefront products using the .NET API checkout flow.",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
