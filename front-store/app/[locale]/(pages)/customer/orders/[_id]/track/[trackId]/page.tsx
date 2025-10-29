import Breadcrumbs from "@/components/custom/Breadcrumbs";
import React from "react";

import { Metadata } from "next";
import OrderTracking from "@/components/modules/customers/orders/OrderTracking";

export const revalidate = 3600;

export default function page({ params }: { params: { trackId: string } }) {
  return (
    <>
      <Breadcrumbs page="track orders" />
      <OrderTracking _id={params.trackId} />
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
