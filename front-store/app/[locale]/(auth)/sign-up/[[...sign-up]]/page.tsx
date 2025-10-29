import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import React from "react";

export default async function Page() {
  return (
    <div className="flex justify-center items-center py-20">
      <SignUp />;
    </div>
  );
}

export const metadata: Metadata = {
  title: "E-City - Register page",
  description:
    "A Ecommerce app. We are selling clothing, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
