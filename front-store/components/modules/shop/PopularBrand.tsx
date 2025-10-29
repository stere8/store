"use client";

import React, { useEffect, useState } from "react";
import { TypeBrandModel } from "@/types/models";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PopularBrand({
  setLoading,
  setBrand,
}: {
  setLoading: (v: boolean) => void;
  setBrand: (v: string) => void;
}) {
  const [brands, setBrands] = useState<TypeBrandModel[]>();

  useEffect(() => {
    const getBrands = async () => {
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/brands")
        .then((response) => {
          setBrands(response.data.data);
        })
        .catch((error) => {
          console.log(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getBrands();
  }, [setLoading]);

  return (
    <div className="w-full flex flex-col gap-[16px]">
      <RadioGroup defaultValue="comfortable" className="flex flex-col gap-4">
        {brands &&
          brands.slice(0, 20).map((item: TypeBrandModel, idx: number) => (
            <div
              onClick={() => setBrand(item._id)}
              className="flex items-center gap-[20px]"
              key={idx}
            >
              <RadioGroupItem
                className="h-[24px] w-[24px] border-slate-200"
                value={item.name}
                id={item._id}
              />
              <Label
                className="capitalize text-gray-700"
                htmlFor={item._id}
              >
                {item.name}
              </Label>
            </div>
          ))}
      </RadioGroup>
    </div>
  );
}
