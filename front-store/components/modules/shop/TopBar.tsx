"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TypeProductModel } from "@/types/models";
import MobileSidebarLeft from "./MobileLeftSidebar";
import { Badge } from "@/components/custom/Badge";
import { FormattedMessage } from "react-intl";
export default function TopBar({
  slug,
  setFilter,
  filter,
  loading,
  setMinPrice,
  setMaxPrice,
  minPrice,
  maxPrice,
  setLoading,
  products,
  setCategory,
  setBrand,
}: {
  slug?: string;
  perpage: number;
  filter: string;
  setPerPages: (value: number) => void;
  setFilter: (value: string) => void;
  loading: boolean;
  minPrice: number;
  maxPrice: number;
  setLoading: (e: boolean) => void;
  setMinPrice: (e: number) => void;
  setMaxPrice: (e: number) => void;
  setBrand: (e: string) => void;
  setCategory: (e: string) => void;
  setTag: (e: string) => void;
  maxPage: number;
  page: number;
  products: TypeProductModel[];
  brand: string;
  tag: string;
  category: string;
}) {
  return (
    <div className="lg:flex flex-col items-center justify-between w-full ">
      <div className="w-full flex items-center gap-4 flex-1 justify-between">
        <MobileSidebarLeft
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          setCategory={setCategory}
          setBrand={setBrand}
          loading={loading}
          setLoading={setLoading}
        />
        {/* <div className="flex relative">
          <Input placeholder="Search for anything" className="w-80" />
          <Search size={20} className="absolute right-4 top-2" />
        </div> */}
        {/* <div className="hidden lg:flex">
          Showing {maxPage === page ? products.length : perpage * page} of{" "}
          {products.length} results
        </div> */}

        <div className="ms-auto flex items-center gap-8">
          <FormattedMessage id="products.sortBy" defaultMessage="Sort by:" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-none" variant="outline">
                {filter ? filter : slug}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-none">
              <DropdownMenuRadioGroup value={"bottom"}>
                <DropdownMenuRadioItem
                  value="top"
                  onClick={() => setFilter("alphabetic")}
                >
                   <FormattedMessage id="sort.alphabetic" defaultMessage="Alphabetic" />
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value={filter}
                  onClick={() => setFilter("priceLowToHigh")}
                >
                 <FormattedMessage id="sort.lowToHigh" defaultMessage="Price: Low to high" />
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value={filter}
                  onClick={() => setFilter("priceHighToLow")}
                >
                 <FormattedMessage id="sort.highToLow" defaultMessage="Price: High to low" />
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value={filter}
                  onClick={() => setFilter("latest")}
                >
                 <FormattedMessage id="sort.latest" defaultMessage="Latest" />
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex w-full px-2 py-4 justify-between bg-gray-50 mt-4">
        <div className="inline-flex">
          <Badge
            variant="primary"
            onClick={() => {
              setCategory("");
              setBrand("");
              setMinPrice(0);
              setMaxPrice(7000);
            }}
            className="text-body-sm-400 text-white"
          >
           <FormattedMessage id="filters.reset" defaultMessage="Reset filters" />
          </Badge>
        </div>
        
         <FormattedMessage
            id="results.found"
            defaultMessage="{count, plural, =0 {No results found} one {# result found} other {# results found}}"
            values={{ count: products.length }}
          />
        
      </div>
    </div>
  );
}
