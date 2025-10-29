import { cn } from "@/lib/utils";
import { TypeProductVariantModel } from "@/types/models";
import React from "react";

export default function ProductColors({
  variants,
  activeOptionVariant,
  setActiveOption,
}: {
  variants: TypeProductVariantModel[];
  activeOptionVariant?: TypeProductVariantModel;
  setActiveOption: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-between">
      <ul className="flex flex-col gap-y-4">
        <span className="text-body-sm-400 text-gray-400">Color/Style</span>

        <div className="flex flex-wrap gap-8 justify-between">
          {variants.map((variant) => {
            return (
              <div
                onClick={() => {
                  setActiveOption(variant._id);
                 
                }}
                key={variant._id}
                className={cn(
                  "rounded-full h-10 w-10 border  cursor-pointer",
                  activeOptionVariant?.color._id == variant.color._id &&
                    "outline outline-primary-500 outline-offset-4"
                )}
                style={{
                  background: `${variant.colorValue && variant.colorValue}`,
                  backgroundImage: `url(${
                    variant.colorImages[0] && variant.colorImages[0].url
                  })`,
                  backgroundSize: "cover",
                }}
              ></div>
            );
          })}
        </div>
      </ul>
    </div>
  );
}
