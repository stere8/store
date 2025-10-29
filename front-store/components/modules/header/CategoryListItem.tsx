"use client";

import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { cn } from "@/lib/utils";
import {
  TypeSubCategoryModel,
  TypeProductModel,
  TypeSlideModel,
} from "@/types/models";
import Image from "next/image";
import React from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { LocaleLink } from "@/components/custom/LocaleLink";

export default function CategoryListItem({
  showCatItem,
  setShowCatItem,
  products,
  campaigns,
}: {
  products: TypeProductModel[];
  campaigns: TypeSlideModel[];
  showCatItem: TypeSubCategoryModel[];
  setShowCatItem: (v: TypeSubCategoryModel[]) => void;
}) {
  const router = useRouter();
  const filterProducts = products.filter((item) => item.featured == true);

  return (
    <m.div
      onMouseLeave={() => setShowCatItem([])}
      initial={{ opacity: 0, y: -15 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "absolute p-[20px] left-[560px] top-[88px] h-[470px] overflow-auto bg-white shadow-md shadow-black z-50 grid grid-cols-[200px_384px_384px] gap-[20px]",
        showCatItem.length === 0 && "hidden"
      )}
    >
      <ul className="flex flex-col col-span-1">
        {showCatItem &&
          showCatItem
            .slice(0, 11)
            .map((item: TypeSubCategoryModel, idx: number) => (
              <li className="w-content capitalize list-none group" key={idx}>
                <LocaleLink
                  href={`/categories/${item.slug}/products`}
                  className="px-[24px] py-[10px] flex items-center justify-between text-body-sm-400 text-gray-600 group-hover:bg-gray-50 group-hover:text-black group-hover:font-[500]"
                >
                  {item.name}
                </LocaleLink>
              </li>
            ))}
      </ul>

      {filterProducts.length > 0 && (
        <ul className="col-span-1 flex flex-col gap-[16px]">
          <li className="">
            <span className="text-body-md-600">FEATURED PRODUCTS</span>
          </li>
          {filterProducts.slice(0, 3).map((item: TypeProductModel, idx) => (
            <li
              className="w-fit h-[120px] capitalize list-none group border hover:border-primary-500"
              key={idx}
            >
              <LocaleLink
                href={`/products/${item.slug}/products`}
                className="h-full px-[24px] py-[10px] flex items-center text-body-sm-400 text-gray-600  gap-[12px] justify-center"
              >
                <Image
                  className="object-scale-down"
                  style={{ height: "100%" }}
                  src={item.images[0].url ?? ""}
                  width="80"
                  height="80"
                  alt=""
                />
                <div className="flex flex-col gap-[8px]">
                  <span className="max-w-[200px]">{item.name}</span>
                  <CurrencyFormat
                    className="text-secondary-500"
                    value={item.price}
                  />
                </div>
              </LocaleLink>
            </li>
          ))}
        </ul>
      )}

      {campaigns[0] && campaigns[0].slideItem[0] && campaigns[0].slideItem[0].product && (
        <ul className="col-span-1 bg-warning-200 p-[32px]  flex flex-col gap-[24px] items-center">
          <li>
            <Image
              className="object-scale-down w-40 h-40"
              alt="product"
              src={campaigns[0].slideItem[0].product.images[0].url}
              height="46"
              width="248"
            />
          </li>
          <li>
            <span className="text-heading2 text-gray-900">
              {campaigns[0].slideItem[0].product.discount}% Discount
            </span>
          </li>
          {/* <li>
            <p className="text-center text-body-md-400 text-gray-700">
              {campaigns[0].slideItem[0].product.description.substring(0, 15)}
            </p>
          </li> */}

          <li className="flex gap-[8px] items-center">
            <span className="text-body-sm-400 text-gray-700">
              Starting price:
            </span>
            <CurrencyFormat
              value={campaigns[0].slideItem[0].product.price}
              suffix={true}
              className="bg-white text-black w-[120px] px-[12px] py-[6px] text-center"
            />
          </li>

          <li>
            <RectangleButton
              variant="primary"
              icon="after"
              onClick={() =>
                router.push(campaigns[0].slideItem[0].product.slug)
              }
            >
              SHOPPING NOW
            </RectangleButton>
          </li>
        </ul>
      )}
    </m.div>
  );
}
