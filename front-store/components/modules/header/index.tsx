import React from "react";
import TopBar from "./TopBar";
import SocialMenu from "./SocialMenu";
import MainMenu from "./MainMenu";
import Menus from "./Menus";
import { getCategories } from "@/actions/category";
import { getPages } from "@/actions/page";
import { getProducts } from "@/actions/product";
import { getCampaigns } from "@/actions/campaign";

export default async function Header() {
  const pages = await getPages();
  const categories = await getCategories();
  const products = await getProducts();
  const campaigns = await getCampaigns("homepage-product-best-deals-section");

  return (
    <header className="">
      <TopBar />
      <SocialMenu className="hidden lg:block" />
      <MainMenu />
      <Menus
        pages={pages}
        categories={categories}
        products={products}
        campaigns={campaigns}
      />
    </header>
  );
}
