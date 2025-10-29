import Image from "next/image";
import React from "react";
import CurrencyFormat from "./CurrencyFormat";
import { discountPrice } from "@/lib/utils";
import { TypeCartItemModel,TypeWishListItemModel } from "@/types/models";
type Props = {
  item: TypeCartItemModel | TypeWishListItemModel;
};

export default function ProductItem({ item }: Props) {
  const images =
    item.variant.sizeImages && item.variant.sizeImages.length > 0
      ? item.variant.sizeImages[0].url
      : item.variant.colorImages.length > 0 && item.variant.colorImages[0].url;


  return (
    <div className="grid grid-cols-3 gap-[16px] items-center p-4">
      <Image
        src={images ? images : item.productImage}
        width="40"
        height="40"
        alt="product"
        className="col-span-1"
      />
      <div className="col-span-2 flex flex-col gap-[8px]">
        <p className="text-body-sm-400">{item.productName.substring(0, 60)}</p>
        <div className="inline-flex items-center gap-[4px]">
          <span className="text-body-sm-400 text-gray-600">{item.qty}</span>
          <span className="text-body-sm-400 text-gray-600">x</span>
          <span className="text-body-sm-600 text-secondary-500">
            <CurrencyFormat
              className=""
              value={
                item.variant.discount
                  ? discountPrice(item.variant.price, item.variant.discount)
                  : item.variant.price
              }
            />
          </span>
        </div>
      </div>
    </div>
  );
}
