import Container from "@/components/custom/Container";
import StoreModal from "@/components/modules/sellers/header/StoreModal";
import { checkRole } from "@/lib/roles";
import { TypeStoreModel } from "@/types/models";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

export default async function page() {
  if ((await checkRole("admin")) === true) {
    redirect("/admin/dashboard");
  }

  return (
    <section>
      <Container>
        <div className="flex flex-col justify-center items-center gap-12 p-40">
          <Image
            src="/assets/images/logo_dark.svg"
            width={200}
            height={200}
            alt="logo"
          />
          <h6 className="text-3xl font-light tracking-wider">
            Welcome on &nbsp;
            <strong className="!text-primary-900 font-bold text-3xl">
              E-City
            </strong>
            Multi Vendor online shop
          </h6>
          <h6 className="text-xl tracking-wider">
            Create or select a store below
          </h6>

          <StoreModal className="w-[600px] border border-border" />
        </div>
      </Container>
    </section>
  );
}

export const dynamicParams = true; // automatically add any further dynamic segment in generateStaticParams

export async function generateStaticParams() {
  const stores = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/admin/stores"
  ).then((res) => res.json());

  return stores.map((store: TypeStoreModel) => ({
    storeId: store._id,
  }));
}

export const metadata: Metadata = {
  title: "E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
