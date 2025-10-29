import Container from "@/components/custom/Container";
import React from "react";
import Dashboard from "@/components/modules/admin/dashboard";
import { Metadata } from "next";

export default async function page() {
  return (
    <section className="py-10">
      <Container>
        <Dashboard />
      </Container>
    </section>
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
