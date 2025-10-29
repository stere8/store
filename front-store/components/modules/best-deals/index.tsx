"use client";
import Container from "@/components/custom/Container";
import React from "react";
import ProductCard from "./ProductCard";
import LeftBanner from "./LeftBanner";
import Heading from "./Heading";
import { TypeProductModel, TypeSlideModel } from "@/types/models";

export default function BestDeals({
  products,
  campaigns,
}: {
  products: TypeProductModel[];
  campaigns: TypeSlideModel[];
}) {
  return (
    <section className="my-[72px]">
      <Container>
        <Heading />
        <div className="flex flex-wrap gap-y-4 lg:gap-0 lg:flex-nowrap">
          <LeftBanner campaigns={campaigns} />
          <div className="flex flex-wrap gap-y-4 sm:justify-between lg:gap-0">
            {products &&
              products
                .slice(0, 6)
                .map((item: TypeProductModel) => (
                  <ProductCard item={item} key={item._id} />
                ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
