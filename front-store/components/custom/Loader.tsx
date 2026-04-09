import { Loader2 } from "lucide-react";
import { BRAND, BRAND_ASSETS, BRAND_IMAGE_DIMENSIONS } from "@/lib/branding";
import Image from "next/image";
import React from "react";

export default function Loader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div
        className="flex flex-col items-center gap-5 text-center"
        role="status"
        aria-label={`Loading ${BRAND.fullName}`}
      >
        <div className="rounded-full bg-primary-50/80 p-4 shadow-sm ring-1 ring-primary-100">
          <Image
            src={BRAND_ASSETS.symbol}
            alt={`${BRAND.shortName} symbol`}
            width={BRAND_IMAGE_DIMENSIONS.symbol.width}
            height={BRAND_IMAGE_DIMENSIONS.symbol.height}
            priority
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3 text-primary-800">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm font-medium tracking-wide">
            Loading {BRAND.shortName}
          </span>
        </div>
      </div>
    </div>
  );
}
