import Container from "@/components/custom/Container";
import Settings from "@/components/modules/admin/settings";
import { checkRole } from "@/lib/roles";
import { Metadata } from "next";
import React from "react";

export default async function page() {
  const check = await checkRole("admin");
  return (
    <section className="py-10">
      <Container>
        <Settings check={check} />
      </Container>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Settings - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
