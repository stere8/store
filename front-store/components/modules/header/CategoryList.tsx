"use client";
import { TypeCategoryModel, TypeSubCategoryModel } from "@/types/models";
import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { LocaleLink } from "@/components/custom/LocaleLink";

export default function CategoryList({
  categories,
  setShowCatItem,
  showCat,
}: {
  categories: TypeCategoryModel[];
  showCat: boolean;
  setShowCatItem: (v: TypeSubCategoryModel[]) => void;
}) {
  return (
    <>
      <m.div
        initial={{ opacity: 0, y: -15 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "hidden absolute top-[70px] h-[440px] bg-white shadow-xl z-50 ",
          showCat && "block"
        )}
      >
        <ul className="flex flex-col">
          {categories &&
            categories.map((item: TypeCategoryModel, idx: number) => (
              <li
                className="w-[240px] capitalize group "
                key={idx}
                onMouseEnter={() => setShowCatItem(item.subCategory)}
              >
                <LocaleLink
                  href={`/categories/${item.slug}/products`}
                  className="px-[24px] py-[10px] flex items-center justify-between text-body-sm-400 text-gray-600 group-hover:bg-gray-50 group-hover:text-black group-hover:font-[500]"
                >
                  {item.name}
                  {item.subCategory.length > 0 && <ChevronRight size={12} />}
                </LocaleLink>
              </li>
            ))}
        </ul>
      </m.div>
    </>
  );
}
