import CustomerAuthPage from "@/components/auth/CustomerAuthPage";
import { Metadata } from "next";
import React from "react";

export default async function Page() {
  return <CustomerAuthPage mode="sign-up" />;
}

export const metadata: Metadata = {
  title: "E-Mall Rwanda - Register",
  description:
    "A Ecommerce app. We are selling clothing, shoes for mens womens and kids",
  icons: {
    icon: "/assets/branding/e-mall-rwanda-app-icon.png",
  },
};
