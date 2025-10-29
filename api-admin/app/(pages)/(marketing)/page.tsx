import Hero from "@/components/modules/marketing/hero";
import { mergeOpenGraph } from "@/lib/mergeOpenGraph";
import { Metadata } from "next";
import React from "react";

export const revalidate = 3600 //rebuild data cached after 1hour if this request is called 

export default function page() {
  return <Hero />;
}

export const metadata: Metadata = {
  title: "E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },

  //For SEO: Sharing on social media twitter, whatsapp, Linkeidn etc
  openGraph: mergeOpenGraph({
    title: `E-City - Ecommerce`,
    url: `/`,
  }),
};
