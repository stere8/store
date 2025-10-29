"use client";
import Container from "@/components/custom/Container";
import { TypeProductModel } from "@/types/models";
import React from "react";
import ProductDesription from "./ProductDescription";
import { ProductTabs } from "./ProductTabs";

export default function Products({ product }: { product: TypeProductModel }) {

  return (
    <section className="pt-8">
      <Container>
        <ProductDesription
          product={product}
        />
        <ProductTabs product={product} />
      </Container>
    </section>
  );
}
