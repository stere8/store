import { getCart } from "@/actions/cart";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Shipping from "@/components/modules/shippings";
import { Metadata } from "next";
import React from "react";

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function page({ params }: { params: { _id: string } }) {
  const cart = await getCart(params._id);

  return (
    <>
      <Breadcrumbs page="shipping" />
      <Shipping cart={cart} />
    </>
  );
}

export const metadata: Metadata = {
  title: "Shipping - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
