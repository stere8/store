import Breadcrumbs from "@/components/custom/Breadcrumbs";
import React from "react";

import { Metadata } from "next";
import Dashboard from "@/components/modules/customers/dashboard";

export const revalidate = 3600;

export default function page() {
  return (
    <>
      <Breadcrumbs page="dashboard" />
      <Dashboard />
    </>
  );
}

export const metadata: Metadata = {
  title: "Dashboard - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
