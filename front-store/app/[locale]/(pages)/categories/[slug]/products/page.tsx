import { getCategory } from "@/actions/category";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Shop from "@/components/modules/shop";
import React from "react";

export const revalidate = 3600; // 1h

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function page({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  return (
    <>
      <Breadcrumbs page="categories" />
      <Shop slug={category && category._id} />
    </>
  );
}

// SEO Dynamic metadata
// or Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `${params.slug} - E-city`,
    description: "Online Ecommerce for selling anything electronics",
    icons: {
      icon: "/assets/images/logo_dark.svg",
    },
  };
}
