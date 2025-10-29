import WishList from "@/WishList/index";
import { Metadata } from "next";
import React from "react";
import Breadcrumbs from "@/components/custom/Breadcrumbs";

export default function page() {
  return (
    <>
      <Breadcrumbs page="wishlist" />
      <WishList/>
    </>
  );
}

export const metadata: Metadata = {
  title: "wishlist - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
