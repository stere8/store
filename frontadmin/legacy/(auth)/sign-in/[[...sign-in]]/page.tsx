import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import React from "react";

export default function Page() {
  return (
    <div className="h-full grid grid-cols-1">
      <div className="flex justify-center items-center">
        <SignIn />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "E-city - Login page",
  description:
    "A Ecommerce app. We are selling clothing, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo.svg",
  },
};
