import { getWishlist } from "@/actions/wishlist";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Shipping from "@/components/modules/shippings";
import { Metadata } from "next";
import React from "react";

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function page({ params }: { params: { _id: string } }) {
  const wishlist = await getWishlist(params._id);

  return (
    <>
      <Breadcrumbs page="wishlist" />
      <Shipping wishlist={wishlist} />
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
