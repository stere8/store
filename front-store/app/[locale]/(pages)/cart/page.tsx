import Cart from "@/cart";
import { Metadata } from "next";
import React from "react";
import Breadcrumbs from "@/components/custom/Breadcrumbs";

export default function page() {
  return (
    <>
      <Breadcrumbs page="Cart" />
      <Cart />
    </>
  );
}

export const metadata: Metadata = {
  title: "Cart - E-Mall Rwanda",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/branding/e-mall-rwanda-app-icon.png",
  },
};
