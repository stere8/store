import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { TypeProductModel } from "@/types/models";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function ProductCard({ item }: { item: TypeProductModel }) {
  return (
    <Link href={`/products/${item.slug}`} className="flex gap-3 items-center border border-gray-100 p-3 
     cursor-pointer hover:border-primary-500">
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
