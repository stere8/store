import { getProduct, getProducts } from "@/actions/product";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Collections from "@/components/modules/collections";
import Products from "@/components/modules/products";
import { mergeOpenGraph } from "@/lib/mergeOpenGraph";
import React from "react";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function page({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  const products = await getProducts();

  if (!product._id) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs product={product} />
      <Products product={product} />
      <Collections products={products} />
    </>
  );
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const product = await getProduct(params.slug);

  if (!product._id) {
    return {};
  }

  const images = product.images[0]?.url;

  return {
    title: `Buy ${params.slug} - E-city`,
    description: "Online Ecommerce for selling anything electronics",
    icons: {
      icon: "/assets/images/logo.png",
    },
    openGraph: mergeOpenGraph({
      title: `Buy ${product.name.substring(0, 60)}`,
      url: `/${params.locale}/products/${params.slug}`,
      images: `${images}`,
      description: `${
        product.seoDescription
          ? product.seoDescription.substring(0, 60)
          : product.description
      }`,
    }),
  };
}