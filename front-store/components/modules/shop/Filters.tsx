import { Input } from "@/components/custom/Input";
import React, { useState } from "react";
import ProductsCatAccordions from "./ProductsCatAccordions";
import HeadingShop from "@/components/custom/HeadingShop";
import PopularBrand from "./PopularBrand";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
//import { Label } from "@/components/ui/label";
import { FormattedMessage } from "react-intl";

export default function Filters({
  maxPrice,
  setMinPrice,
  setCategory,
  setLoading,
  setBrand,
  setMaxPrice,
  loading,
}: {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  setCategory: (value: string) => void;
  setBrand: (value: string) => void;
  loading: boolean;
  setLoading: (e: boolean) => void;
}) {
  const [minPricePreview, setMinPricePreview] = useState(0);
  const [maxPricePreview, setMaxPricePreview] = useState(0);
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-1 my-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex w-full col-span-2">
            <input
              disabled={loading}
              defaultValue={0}
              type="range"
              min="0"
              max="7000"
              step="10"
              onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                setMinPrice(parseInt(e.currentTarget.value))
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMinPricePreview(parseInt(e.target.value))
              }
              className="h-1 w-full bg-gray-100"
            />

            <input
              disabled={loading}
              defaultValue={maxPrice}
              type="range"
              min="0"
              max="7000"
              step="10"
              onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                setMaxPrice(parseInt(e.currentTarget.value))
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMaxPricePreview(parseInt(e.target.value))
              }
              className="h-1 w-full bg-gray-100"
            />
          </div>

          <div className="col-span-2 flex items-center justify-between space-x-2">
            <Input
              type="number"
              id="min-price-input"
              min="0"
              max="7000"
              value={minPricePreview}
              readOnly
              className=""
              placeholder="Min price"
              required
            />

            
              <FormattedMessage
                id="range.to"
              defaultMessage="to"
              />
           

            <Input
              type="number"
              id="max-price-input"
              min="0"
              max="7000"
              className=""
              placeholder="Max price"
              readOnly
              required
              value={maxPricePreview}
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          {/* product categories  */}
          <div className="lg:hidden flex flex-col gap-4  w-full">
            <HeadingShop name="categories" />
            <ProductsCatAccordions setCategory={setCategory} />
          </div>

          <div className="lg:hidden flex flex-col gap-4 ">
            <HeadingShop name="Popular brands" />
            <div className="flex gap-4 h-full flex-wrap">
              <PopularBrand setLoading={setLoading} setBrand={setBrand} />
            </div>
          </div>
        </div>
        {/* <div className="flex flex-col gap-4">
          <div className="w-full flex flex-col gap-[16px]">
            <RadioGroup
              defaultValue="comfortable"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="all"
                  id="all"
                />
                <Label className="capitalize text-gray-700" htmlFor="all">
                  All price
                </Label>
              </div>
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="20"
                  id="20"
                />
                <Label className="capitalize text-gray-700" htmlFor="20">
                  under $20
                </Label>
              </div>
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="100"
                  id="100"
                />
                <Label className="capitalize text-gray-700" htmlFor="100">
                  $25 to $100
                </Label>
              </div>
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="300"
                  id="300"
                />
                <Label className="capitalize text-gray-700" htmlFor="300">
                  $100 to $300
                </Label>
              </div>
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="1000"
                  id="1000"
                />
                <Label className="capitalize text-gray-700" htmlFor="1000">
                  $500 to $1000
                </Label>
              </div>
              <div className="flex items-center gap-[20px]">
                <RadioGroupItem
                  className="h-[24px] w-[24px] border-slate-200"
                  value="10000"
                  id="10000"
                />
                <Label className="capitalize text-gray-700" htmlFor="10000">
                  $1000 to $10000
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div> */}
      </div>
    </div>
  );
}
