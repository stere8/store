import * as React from "react";
import { Badge } from "@/components/custom/Badge";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { discountPrice } from "@/lib/utils";
import { TypeProductModel } from "@/types/models";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ item }: { item: TypeProductModel }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/products/${item.slug}`)}
      className="relative w-full p-2 border gap-1 border-gray-100 sm:w-[248px] md:w-[248px] lg:w-[232px] xl:w-[248px]  hover:border-primary-500 cursor-pointer flex items-center flex-wrap sm:flex-wrap md:flex-wrap xl:flex-wrap justify-center"
    >
      <div className="">
        <Image
          src={item.images[0] && item.images[0].url}
          width={200}
          height={0}
          sizes="100vw"
          alt=""
          className="h-40 w-auto object-cover"
        />
        <div className="flex gap-2 flex-col absolute top-4 left-4 w-max">
          {item.discount > 0 && (
            <Badge variant="warning" className="text-black">
              {item.discount} % OFF
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div>
          <p className="text-body-sm-400 text-balance capitalize text-center">
            {item.name.substring(0, 50)}
          </p>
        </div>
        <div className="inline-flex items-center gap-[4px]">
          {item.discount > 0 && (
            <>
              <CurrencyFormat
                value={discountPrice(item.price, item.discount)}
                className="w-20 !text-secondary-500 text-body-l-600  text-left"
              />

              <CurrencyFormat
                value={item.price}
                className="w-20 !text-gray-300 text-body-l-400 line-through"
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
