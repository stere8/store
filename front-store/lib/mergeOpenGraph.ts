import type { Metadata } from "next";
import { BRAND, BRAND_ASSETS } from "@/lib/branding";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "");
const defaultOpenGraphImage = baseUrl
  ? `${baseUrl}${BRAND_ASSETS.primaryLogo}`
  : BRAND_ASSETS.primaryLogo;

// Default open graph
const defaultOpenGraph: Metadata["openGraph"] = {
  title: BRAND.fullName,
  description: BRAND.description,
  images: [
    {
      url: defaultOpenGraphImage,
    },
  ],
  type: "website",
  url: baseUrl || "/",
  siteName: BRAND.fullName,
};

// Dynamic open graph
export const mergeOpenGraph = (og?: Metadata["openGraph"]) => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
    title: og?.title ? og.title : defaultOpenGraph.title,
    url: og?.url ? og.url : defaultOpenGraph.url,
  };
};
