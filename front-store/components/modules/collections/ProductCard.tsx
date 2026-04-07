import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { getProductVendorName } from "@/lib/utils";
import { TypeProductModel } from "@/types/models";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function ProductCard({ item }: { item: TypeProductModel }) {
  const vendorName = getProductVendorName(item);

  return (
    <Link
      href={`/products/${item.slug}`}
      className="relative flex cursor-pointer items-center gap-3 border border-gray-100 p-3 hover:border-primary-500"
    >
      {vendorName && (
        <div className="absolute right-3 top-3 max-w-[120px] truncate rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white">
          {vendorName}
        </div>
      )}
      <Image
        src={item.images[0].url}
        alt="product"
        width={100}
        height={0}
        sizes="100vw"
        className="h-20 w-auto object-contain"
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-body-sm-400">{item.name}</h3>
        <CurrencyFormat
          value={item.price}
          className="!text-secondary-500 text-body-sm-600"
        />
      </div>
    </Link>
  );
}
