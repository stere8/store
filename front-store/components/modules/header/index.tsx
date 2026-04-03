import React from "react";
import TopBar from "./TopBar";
import SocialMenu from "./SocialMenu";
import MainMenu from "./MainMenu";
import Menus from "./Menus";
import { getCategories } from "@/actions/category";
import { getProducts } from "@/actions/product";

export default async function Header() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <header className="">
      <TopBar />
      <SocialMenu className="hidden lg:block" />
      <MainMenu />
      <Menus
        pages={[]}
        categories={categories}
        products={products}
        campaigns={[]}
      />
    </header>
  );
}
