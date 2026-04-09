import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Shop from "@/components/modules/shop";

import React from "react";

export const revalidate = 3600; // 1h

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function page() {
  return (
    <>
      <Breadcrumbs page="store" />
      <Shop />
    </>
  );
}

// or Dynamic metadata
export async function generateMetadata() {
  return {
    title: `Store - E-Mall Rwanda`,
    description: "Online Ecommerce for selling anything electronics",
    icons: {
      icon: "/assets/branding/e-mall-rwanda-app-icon.png",
    },
  };
}
