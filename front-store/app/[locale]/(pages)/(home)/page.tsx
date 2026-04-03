import Payments from "@/components/custom/Payments";
import BestDeals from "@/components/modules/best-deals";
import Categories from "@/components/modules/categories";
import HomeSlide from "@/components/modules/hero/HomeSlide";
import { Metadata } from "next";
import * as React from "react";
import Collections from "@/components/modules/collections";
import Newsletters from "@/components/modules/newsletters";
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category";
import Firework from "@/components/custom/Firework";

export const revalidate = 3600;

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <>
      <Firework />
      <HomeSlide
        firstZone={[]}
        secondZone={[]}
        thirdZone={[]}
        fallbackProducts={products}
      />
      <Payments />
      <BestDeals products={products} campaigns={[]} />
      <Categories
        categories={categories}
        campaigns={[]}
        campaignsTwo={[]}
      />
      <Collections products={products} />
      <Newsletters />
    </>
  );
}

export const metadata: Metadata = {
  title: "Home - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
