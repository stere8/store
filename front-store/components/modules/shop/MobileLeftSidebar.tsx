import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowDownZA } from "lucide-react";
import Filters from "./Filters";

export default function MobileSidebarLeft({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  setBrand,
  setCategory,
  loading,
  setLoading,
}: {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (e: number) => void;
  setMaxPrice: (e: number) => void;
  setCategory: (e: string) => void;
  setBrand: (e: string) => void;
  loading: boolean;
  setLoading: (e: boolean) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <span className="flex gap-2 items-center">
            <ArrowDownZA className="h-4 w-4 hover:text-primary-900 hover:font-bold" />
            Filters
          </span>
        </SheetTrigger>
        <SheetContent className="px-4 w-full md:w-[400px] p-0" side="left">
          <SheetHeader className="bg-backgorund p-1 border-b flex justify-start">
            <SheetTitle className="text-slate-700 text-sm">Filters</SheetTitle>
            <SheetDescription>
              Filter par price / category/ brand
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-screen p-4">
            <Filters
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setCategory={setCategory}
              setBrand={setBrand}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
