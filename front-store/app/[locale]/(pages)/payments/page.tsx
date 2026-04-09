import React from "react";
import { Metadata } from "next";
import PaymentCompleted from "@/components/modules/result/PaymentCompleted";

export default function page() {
  return <PaymentCompleted />;
}

export const metadata: Metadata = {
  title: "Payment completed - E-Mall Rwanda",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/branding/e-mall-rwanda-app-icon.png",
  },
};
