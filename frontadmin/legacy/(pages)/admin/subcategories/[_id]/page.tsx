import Container from "@/components/custom/Container";
import SubcategoryForm from "@/components/modules/admin/subcategories/SubCategoryForm";
import { Metadata } from "next";
import React from "react";

export default async function page({ params }: { params: { _id: string } }) {
  return (
    <>
      <section className="py-10">
        <Container>
          <SubcategoryForm _id={params._id} />
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Category - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
