import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import React from "react";

export default function Page() {
  return (
    <div className="flex justify-center items-center py-20">
      <SignIn appearance={{}} />
    </div>
  );
}

export const metadata: Metadata = {
  title: "E-City - Login page",
  description:
    "A Ecommerce app. We are selling clothing, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
