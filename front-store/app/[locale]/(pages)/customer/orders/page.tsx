import Breadcrumbs from "@/components/custom/Breadcrumbs";
import React from "react";

import { Metadata } from "next";
import Orders from "@/components/modules/customers/orders";

export const revalidate = 3600;

export default function page() {
  return (
    <>
      <Breadcrumbs page="orders" />
      <Orders />
    </>
  );
}

export const metadata: Metadata = {
  title: "Orders - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
