import Container from "@/components/custom/Container";
import SubCategoryForm from "@/components/modules/admin/subcategories/SubCategoryForm";
import { Metadata } from "next";
import React from "react";

export default async function page() {
  return (
    <>
      <section className="py-10">
        <Container>
          <SubCategoryForm />
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "New Sub Categories - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
