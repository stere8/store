import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypeProductVariantModel } from "@/types/models";

export default function ProductSizes({
  activeSizes,
  setActiveOption,
}: {
  activeSizes: TypeProductVariantModel[];
  setActiveOption: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-between">
      <ul className="flex flex-col gap-y-2">
        <span className="text-body-sm-400 text-gray-400">Sizes/Options</span>
        <Select onValueChange={(e) => setActiveOption(e)}>
          <SelectTrigger className="w-[340px]">
            <SelectValue placeholder="select a size/option" />
          </SelectTrigger>
          <SelectContent className="w-[340px]">
            {activeSizes &&
              activeSizes.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.size && p.size.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </ul>
    </div>
  );
}
