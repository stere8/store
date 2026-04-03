import Container from "@/components/custom/Container";
import Subcategories from "@/components/modules/admin/subcategories";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export default async function page() {
  return (
    <>
      <section className="py-10">
        <Container>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap space-y-4 justify-between items-center">
              <Heading
                name="Sub-Categories"
                description="Group of subs categories available."
              />
              <Link
                href="/admin/subcategories/new"
                className="bg-black p-4 flex items-center gap-4 text-white rounded-md text-xl"
              >
                <Plus className="me-1" />
                Add new
              </Link>
            </div>
            <Separator />
          </div>
        </Container>
      </section>
      <section className="py-10">
        <Container>
          <Subcategories />
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Categories - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
