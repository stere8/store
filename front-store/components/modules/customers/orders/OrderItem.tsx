import Image from "next/image";
import React from "react";
import { discountPrice } from "@/lib/utils";
import { TypeOrderItemModel } from "@/types/models";
import Link from "next/link";

export default function OrderItem({ item }: { item: TypeOrderItemModel }) {
  const images =
    item.cartItem.variant.sizeImages &&
    item.cartItem.variant.sizeImages.length > 0
      ? item.cartItem.variant.sizeImages[0].url
      : item.cartItem.variant.colorImages &&
        item.cartItem.variant.colorImages.length > 0 &&
        item.cartItem.variant.colorImages[0].url;
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <th
        scope="row"
        className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
      >
        <div className="grid grid-cols-4 gap-6">
          <Image
            src={images ? images : item.cartItem.productImage}
            width="200"
            height={0}
            alt="prod"
            className="h-20 w-20 object-contain"
          />
          <div className="flex flex-col gap-2">
            <span className="capitalize">
              {item.cartItem.productName.substring(0, 30)}
            </span>
            <div className="inline-flex gap-4 font-bold">
              <span className="font-bold">{item.cartItem.qty}</span>
              <span>X</span>
              <span className="font-bold">
                RWF
                {item.cartItem.variant.discount
                  ? discountPrice(
                      item.cartItem.variant.price,
                      item.cartItem.variant.discount
                    )
                  : item.cartItem.variant.price}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <div className="inline-flex gap-4 items-center">
                <span className="">Variant: </span>
                <span className="font-bold"> {item.cartItem.variant.name}</span>
              </div>
            </div>
          </div>
        </div>
      </th>
      <td className="text-center">{item.cartItem.qty}</td>
      <td className="px-6 py-4 text-xl">
      RWF
        {item.cartItem.variant.discount
          ? discountPrice(
              item.cartItem.variant.price,
              item.cartItem.variant.discount
            )
          : item.cartItem.variant.price}
      </td>
      <td className="px-6 py-4 text-xl">{item.shippingAmount}</td>

      <td className="px-6 py-4 text-xl">
      RWF
        {(
          discountPrice(
            item.cartItem.variant.price,
            item.cartItem.variant.discount
          ) *
            item.cartItem.qty +
          item.shippingAmount
        ).toFixed(2)}
      </td>

      <td>
        <Link
          href={`/customer/orders/${item._id}/track/${item.trackorder._id}`}
          className="text-primary-500"
        >
          Track order
        </Link>
      </td>
    </tr>
  );
}
