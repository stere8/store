import Payments from "@/components/custom/Payments";
import BestDeals from "@/components/modules/best-deals";
import Categories from "@/components/modules/categories";
import HomeSlide from "@/components/modules/hero/HomeSlide";
import { Metadata } from "next";
import * as React from "react";
import Collections from "@/components/modules/collections";
import Newsletters from "@/components/modules/newsletters";
import { getProducts } from "@/actions/product";
import { getCampaign, getCampaigns } from "@/actions/campaign";
import Firework from "@/components/custom/Firework"

export const revalidate = 3600;

export default async function Home() {
  const products = await getProducts();
  const firstZone = await getCampaign("homepage-slideshow-first-zone");
  const secondZone = await getCampaign("homepage-slideshow-second-zone");
  const thirdZone = await getCampaign("homepage-slideshow-third-zone");
  const campaigns = await getCampaigns("homepage-product-best-deals-section");
  const campaignsCta = await getCampaigns("homepage-cta-small-first-zone");
  const campaignsCtaTwo = await getCampaigns("homepage-cta-small-second-zone");

  return (
    <>
      <Firework/>
      <HomeSlide
        firstZone={firstZone}
        secondZone={secondZone}
        thirdZone={thirdZone}
      />
      <Payments />
      <BestDeals products={products} campaigns={campaigns} />
      <Categories campaigns={campaignsCta} campaignsTwo={campaignsCtaTwo} />
      <Collections products={products} />
      <Newsletters />
    </>
  );
}

export const metadata: Metadata = {
  title: "Home - E-City - Ecommerce",
  description:
    "A Ecommerce app. We are selling everything, shoes for mens womens and kids",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};
