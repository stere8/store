import CustomerAuthPage from "@/components/auth/CustomerAuthPage";
import { Metadata } from "next";
import React from "react";

export default function Page() {
  return <CustomerAuthPage mode="sign-in" />;
}

export const metadata: Metadata = {
  title: "E-City - Login page",
  description:
    "A Ecommerce app. We are selling clothing, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
