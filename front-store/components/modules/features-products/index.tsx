"use client";
import Container from "@/components/custom/Container";
import React, { useEffect, useMemo, useState } from "react";
import LeftBanner from "./LeftBanner";
import BrowserLink from "@/components/custom/BrowserLink";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "react-intl";
import { apiClient } from "@/lib/epoc-api";
import { createCategoryLookup, toFrontCategory, toFrontProduct } from "@/lib/epoc-mappers";
import { TypeCategoryModel, TypeProductModel } from "@/types/models";

export default function FeaturesProducts() {
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<TypeCategoryModel[]>([]);
  const [products, setProducts] = useState<TypeProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          apiClient.get("/api/categories"),
          apiClient.get("/api/products"),
        ]);

        const categoryItems = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        const productItems = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        const categoryLookup = createCategoryLookup(categoryItems);
        setCategories(categoryItems.map(toFrontCategory));
        setProducts(
          productItems.map((item) => toFrontProduct(item, categoryLookup))
        );
      } catch (error) {
        console.error("Unable to load featured products", error);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const tabs = useMemo(
    () => [{ slug: "all", name: "All products" }, ...categories.slice(0, 5)],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") {
      return products;
    }

    return products.filter((item) => item.category?.slug === activeTab);
  }, [activeTab, products]);

  return (
    <section className="my-[72px] w-full">
      <Container>
        <div className="flex flex-wrap gap-y-4 lg:gap-2 lg:flex-nowrap">
          <LeftBanner />
          <div className="flex flex-col w-full gap-4">
            <div
              className="flex gap-4 flex-wrap justify-between items-center 
            w-full"
            >
              <h3>
                {" "}
                <FormattedMessage id={`main.featured-products`} />
              </h3>
              <div className="flex gap-6">
                <ul className="lg:flex flex-wrap gap-4 justify-between capitalize text-gray-600 text-body-sm-400 hidden">
                  {tabs.map((tab) => (
                    <li
                      key={tab.slug}
                      onClick={() => setActiveTab(tab.slug)}
                      className={cn(
                        "cursor-pointer",
                        activeTab === tab.slug &&
                          "text-black border-b-2 border-primary-500"
                      )}
                    >
                      {tab.slug === "all" ? (
                        <FormattedMessage id={`main.all-products`} />
                      ) : (
                        tab.name
                      )}
                    </li>
                  ))}
                </ul>

                <select
                  className="lg:hidden rounded-full border border-gray-200 px-4 py-2 text-body-sm-400"
                  value={activeTab}
                  onChange={(event) => setActiveTab(event.target.value)}
                >
                  {tabs.map((tab) => (
                    <option key={tab.slug} value={tab.slug}>
                      {tab.slug === "all" ? "All products" : tab.name}
                    </option>
                  ))}
                </select>

                <BrowserLink
                  name={`products`}
                  className="text-primary-500"
                  link="/products"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-y-4 sm:justify-between xl:justify-between lg:gap-y-1 xl:gap-y-4">
              {loading ? (
                <p className="text-body-sm-400 text-gray-500">
                  Loading featured products...
                </p>
              ) : filteredProducts.length > 0 ? (
                filteredProducts
                  .slice(0, 8)
                  .map((item) => <ProductCard key={item._id} item={item} />)
              ) : (
                <p className="text-body-sm-400 text-gray-500">
                  No products available for this category yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
