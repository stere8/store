import Breadcrumbs from "@/components/custom/Breadcrumbs";
import React from "react";

import { Metadata } from "next";
import Orders from "@/components/modules/customers/orders";

export const revalidate = 3600;

export default function page() {
  return (
    <>
      <Breadcrumbs page="Reservations" />
      <Orders />
    </>
  );
}

export const metadata: Metadata = {
  title: "Reservations - E-Mall Rwanda",
  description: "Customer reservation history and pickup details.",
  icons: {
    icon: "/assets/branding/e-mall-rwanda-app-icon.png",
  },
};
