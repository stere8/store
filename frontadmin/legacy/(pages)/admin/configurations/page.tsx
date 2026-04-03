import Container from "@/components/custom/Container";
import ConfigurationForm from "@/components/modules/admin/configurations/ConfigurationForm";
import { Metadata } from "next";
import React from "react";

export default function page() {
  return (
    <>
      <section className="py-10">
        <Container>
          <ConfigurationForm />
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Branding - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
