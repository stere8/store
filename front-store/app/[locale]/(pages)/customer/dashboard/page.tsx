import Breadcrumbs from "@/components/custom/Breadcrumbs";
import React from "react";

import { Metadata } from "next";
import Dashboard from "@/components/modules/customers/dashboard";

export const revalidate = 3600;

export default function page() {
  return (
    <>
      <Breadcrumbs page="My account" />
      <Dashboard />
    </>
  );
}

export const metadata: Metadata = {
  title: "My Account - E-Mall Rwanda",
  description: "Customer profile, reservation activity, and pickup history.",
  icons: {
    icon: "/assets/branding/e-mall-rwanda-app-icon.png",
  },
};
