import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Container from "@/components/custom/Container";
import Order from "@/components/modules/customers/orders/Order";
import { Metadata } from "next";
import React from "react";

export default async function page({ params }: { params: { _id: string } }) {
  return (
    <>
      <Breadcrumbs page="orders" />
      <section className="py-10">
        <Container>
          <Order _id={params._id} />
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Detail Order - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
