import { getProduct, getProducts } from "@/actions/product";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Collections from "@/components/modules/collections";
import Products from "@/components/modules/products";
import { mergeOpenGraph } from "@/lib/mergeOpenGraph";
import React from "react";

export const revalidate = 3600; // 1h

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function page({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  const products = await getProducts();

  return (
    <>
      <Breadcrumbs product={product} />
      <Products product={product} />
      <Collections products={products} />
    </>
  );
}

// automatically add any further dynamic segment in generateStaticParams for example if a new product has been approved by admin it will added statically cached
export const dynamicParams = true;

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return [];
}

// SEO Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const product = await getProduct(params.slug);
  const images = product && product.images[0].url;
 
  return {
    title: `Buy ${params.slug} - E-city`,
    description: "Online Ecommerce for selling anything electronics",
    icons: {
      icon: "/assets/images/logo_dark.svg",
    },

    //For SEO: Sharing on social media twitter, whatsapp, Linkeidn etc
    openGraph: mergeOpenGraph({
      title: `Buy ${product && product.name.substring(0, 60)}`,
      url: `/${params.locale}/products/${params.slug}`,
      images: `${images}`,
      description: `${
        product && product.seoDescription
          ? product.seoDescription.substring(0, 60)
          : product.description
      }`,
    }),
  };
}
