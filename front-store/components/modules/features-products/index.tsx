"use client";
import Container from "@/components/custom/Container";
import React, { useState } from "react";
import LeftBanner from "./LeftBanner";
import BrowserLink from "@/components/custom/BrowserLink";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "react-intl";

export default function FeaturesProducts() {
  const [activeTab, setActiveTab] = useState("all");
  return (
    <section className="my-[72px] w-full">
      <Container>
        <div className="flex flex-wrap gap-y-4 lg:gap-2 lg:flex-nowrap">
          <LeftBanner />
          <div className="flex flex-col w-full gap-4">
            <div
              className="flex gap-4 flex-wrap justify-between items-center 
            w-full"
            >
              <h3>
                {" "}
                <FormattedMessage id={`main.featured-products`} />
              </h3>
              <div className="flex gap-6">
                <ul className="lg:flex flex-wrap gap-4 justify-between capitalize text-gray-600 text-body-sm-400 hidden">
                  <li
                    onClick={() => setActiveTab("all")}
                    className={cn(
                      "cursor-pointer",
                      activeTab === "all" &&
                        "text-black border-b-2 border-primary-500"
                    )}
                  >
                    <FormattedMessage id={`main.all-products`} />
                  </li>
                  <li
                    onClick={() => setActiveTab("smartphone")}
                    className={cn(
                      "cursor-pointer",
                      activeTab === "smartphone" &&
                        "text-black border-b-2 border-primary-500"
                    )}
                  >
                    smart phone
                  </li>
                  <li
                    onClick={() => setActiveTab("laptop")}
                    className={cn(
                      "cursor-pointer",
                      activeTab === "laptop" &&
                        "text-black border-b-2 border-primary-500"
                    )}
                  >
                    laptop
                  </li>
                  <li
                    onClick={() => setActiveTab("headphone")}
                    className={cn(
                      "cursor-pointer",
                      activeTab === "headphone" &&
                        "text-black border-b-2 border-primary-500"
                    )}
                  >
                    headphones
                  </li>
                  <li
                    onClick={() => setActiveTab("tv")}
                    className={cn(
                      "cursor-pointer",
                      activeTab === "tv" &&
                        "text-black border-b-2 border-primary-500"
                    )}
                  >
                    tv
                  </li>
                </ul>

                <BrowserLink
                  name={`products`}
                  className="text-primary-500"
                  link="/products"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-y-4 sm:justify-between xl:justify-between lg:gap-y-1 xl:gap-y-4">
              <ProductCard />
              <ProductCard />
              <ProductCard />
              <ProductCard />
              <ProductCard />
              <ProductCard />
              <ProductCard />
              <ProductCard />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
