"use client";
import Container from "@/components/custom/Container";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import CategoryList from "./CategoryList";
import CategoryListItem from "./CategoryListItem";
import {
  TypeCategoryModel,
  TypePageModel,
  TypeSubCategoryModel,
  TypeProductModel,
  TypeSlideModel,
} from "@/types/models";
import Image from "next/image";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { FormattedMessage } from "react-intl";
import { LocaleLink } from "@/components/custom/LocaleLink";

export default function Menus({
  products,
  pages,
  categories,
  campaigns,
}: {
  pages: TypePageModel[];
  categories: TypeCategoryModel[];
  products: TypeProductModel[];
  campaigns: TypeSlideModel[];
}) {
  const [showCatItem, setShowCatItem] = useState<TypeSubCategoryModel[]>([]);
  const [showCat, setShowCat] = useState<boolean>(false);
  return (
    <>
      <div className="bg-white lg:py-[16px] relative">
        <Container>
          <div className="hidden lg:flex justify-between items-center">
            <div className="flex gap-[24px] items-center">
              <div className="relative">
                <RectangleButton
                  onClick={() => setShowCat(!showCat)}
                  icon="none"
                  className="bg-secondary-700 border-none"
                >
                  <FormattedMessage id={`header.all-categories`} />
                  <ChevronDown />
                </RectangleButton>
                <CategoryList
                  showCat={showCat}
                  setShowCatItem={setShowCatItem}
                  categories={categories}
                />
              </div>
              {pages &&
                pages.map((item, idx) => (
                  <LocaleLink
                    key={idx}
                    href={`/${item.slug}`}
                    className="flex items-center text-gray-600 
                    text-body-sm-400 gap-[6px] hover:text-primary-500"
                  >
                    <Image alt="icon" src={item.image} width={24} height={24} />
                    <span className="capitalize">
                      <FormattedMessage id={`header.${item.slug}`} />
                    </span>
                  </LocaleLink>
                ))}
            </div>
            <div className="flex gap-[8px] items-center text-body-l-400 text-gray-900">
              <LocaleLink
                target="_blank"
                href={process.env.NEXT_PUBLIC_API_URL ?? ""}
                className="bg-primary-500 uppercase inline-flex gap-4 p-4 text-white"
              >
                <FormattedMessage id={`header.become-seller`} />
                <ChevronRight />
              </LocaleLink>
            </div>
          </div>
        </Container>
        <CategoryListItem
          campaigns={campaigns}
          products={products}
          showCatItem={showCatItem}
          setShowCatItem={setShowCatItem}
        />
      </div>
    </>
  );
}
