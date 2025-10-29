import Breadcrumbs from "@/components/custom/Breadcrumbs";
import OrderTrackDetails from "@/components/modules/order-track/OrderTrackDetails";
import { Metadata } from "next";
import React from "react";

export default function page() {
  return (
    <>
      <Breadcrumbs page="track order" />
      <OrderTrackDetails />
    </>
  );
}

export const metadata: Metadata = {
  title: "Order tracking - E-city - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
