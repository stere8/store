import { Badge } from "@/components/custom/Badge";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { Rating } from "@mui/material";
import React from "react";
import { discountPrice, getRatingNote } from "@/lib/utils";
import Image from "next/image";
import { TypeProductModel } from "@/types/models";
import { useRouter } from "next/navigation";

export default function ProductCard({ item }: { item: TypeProductModel }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/products/${item.slug}`)}
      className="group w-full p-2 border  gap-1 border-gray-100 sm:w-[248px] md:w-[248px]  lg:w-[232px] xl:w-[248px]  cursor-pointer flex items-center justify-center flex-wrap sm:flex-wrap md:flex-wrap xl:flex-wrap hover:border-primary-500"
    >
      <div className="relative ">
        <Image
          src={item.images[0] && item.images[0].url}
          width="200"
          height={0}
          alt=""
          className="h-[200px] object-contain "
        />
        <div className="flex gap-2 flex-col absolute top-4 left-0">
          {item.discount > 0 && (
            <Badge variant="warning" className="text-black">
              {item.discount} % OFF
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-2 items-center">
          <Rating
            className="text-primary-500 text-sm"
            readOnly
            name="hover-feedback"
            value={getRatingNote(item.reviews)}
            precision={0.5}
          />
          <span className="text-gray-500 text-body-tiny-400">
            ({item.reviews.length})
          </span>
        </div>
        <div>
          <p className="text-body-sm-400 text-balance text-center">
            {item.name.substring(0, 50)}
          </p>
        </div>
        <div className="inline-flex items-center gap-[10px]">
          {item.discount > 0 && (
            <>
              <CurrencyFormat
                value={discountPrice(item.price, item.discount)}
                className="w-[100px] !text-secondary-500 text-body-l-600  text-left"
              />

              <CurrencyFormat
                value={item.price}
                className="w-[100px] !text-gray-300 text-body-l-400 line-through"
              />
            </>
          )}

          {item.discount === 0 && (
            <>
              <CurrencyFormat
                value={item.price}
                className="w-20 !text-secondary-500 text-body-l-600  text-left"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
