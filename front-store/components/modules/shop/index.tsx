"use client";
import Container from "@/components/custom/Container";
import React, { useState } from "react";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";

export default function Categories({ slug }: { slug?: string }) {
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [category, setCategory] = useState<string>(slug ? slug : "");
  const [tag, setTag] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <section className="my-10">
      <Container>
        {/* Content page  */}
        <div className="mt-10 flex  gap-12 items-start">
          {/* sidebar left  */}
          <LeftSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            setBrand={setBrand}
            setCategory={setCategory}
            setTag={setTag}
            loading={loading}
            setLoading={setLoading}
            className="hidden lg:block"
          />
          {/* main content */}
          <MainContent
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            loading={loading}
            setLoading={setLoading}
            slug={slug}
            brand={brand}
            tag={tag}
            category={category}
            setCategory={setCategory}
            setBrand={setBrand}
            setTag={setTag}
            className="flex-1 lg:flex flex-col gap-4 justify-start h-full"
          />
        </div>
      </Container>
    </section>
  );
}
