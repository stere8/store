"use client";
import Container from "@/components/custom/Container";
import React from "react";
import ProductCard from "./ProductCard";
import LeftBanner from "./LeftBanner";
import Heading from "./Heading";
import { TypeProductModel, TypeSlideModel } from "@/types/models";
import { cn } from "@/lib/utils";

export default function BestDeals({
  products,
  campaigns,
}: {
  products: TypeProductModel[];
  campaigns: TypeSlideModel[];
}) {
  const hasCampaign = Boolean(campaigns[0]?.slideItem?.length);

  return (
    <section className="my-[72px]">
      <Container>
        <Heading />
        <div
          className={cn(
            "flex flex-wrap gap-y-4",
            hasCampaign ? "lg:gap-0 lg:flex-nowrap" : "gap-4"
          )}
        >
          {hasCampaign && <LeftBanner campaigns={campaigns} />}
          <div
            className={cn(
              "flex flex-wrap gap-y-4 sm:justify-between",
              hasCampaign ? "lg:gap-0" : "w-full gap-4"
            )}
          >
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
