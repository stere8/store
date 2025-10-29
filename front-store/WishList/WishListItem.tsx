import { Button } from "@/components/ui/button";
import { WishListItem as WLI } from "@/types";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useDispatch } from "react-redux";
import { removeFromWishList, updateToWishList } from "@/store/WishListSlice";
import { discountPrice } from "@/lib/utils";
import WishListQuantity from "./WishListQuantity";
import { memoize } from "proxy-memoize";
import { IRootState } from "@/store";
import { useSelector } from "react-redux";

export default function WishListItem({ item }: { item: WLI | null }) {
  if (
    !item ||
    !item.variant ||
    typeof item.variant.price !== "number"
  ) {
    return null;
  }

  const images =
    item.variant.sizeImages && item.variant.sizeImages.length > 0
      ? item.variant.sizeImages[0].url
      : item.variant.colorImages.length > 0 && item.variant.colorImages[0].url;

  const dispatch = useDispatch();

  const { WishList } = useSelector(memoize((state: IRootState) => ({ ...state })));

  const handleRemoveItem = (item: WLI) => {
    const newWishList = WishList.items.filter(
      (p: WLI) => p.variant._id !== item.variant._id
    );

    dispatch(updateToWishList(newWishList));
    dispatch(removeFromWishList(item.variant._id));
  };

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <th
        scope="row"
        className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
      >
        <div className="grid grid-cols-2  lg:grid-cols-4 gap-6">
          <td className="m-auto col-span-1">
            <Button
              onClick={() => handleRemoveItem(item)}
              className="hover:text-primary-500  rounded-full"
              variant="outline"
              size="icon"
            >
              <X size={24} />
            </Button>
          </td>
          <div className="col-span-1">
            <Image
              src={images ? images : item.productImage}
              width="200"
              height={0}
              alt="prod"
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="hidden lg:flex flex-col gap-2 col-span-2">
            <span className="capitalize">
              {item.productName.substring(0, 30)}
            </span>
            <div className="inline-flex gap-4 font-bold">
              <span className="font-bold">{item.qty}</span>
              <span>X</span>
              <span className="font-bold">
                RWF
                {item.variant.discount
                  ? discountPrice(item.variant.price, item.variant.discount)
                  : item.variant.price}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <div className="inline-flex gap-4 items-center">
                <span className="">Variant: </span>
                <span className="font-bold">
                  {" "}
                  {item.variant.name.substring(0, 20)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </th>
      <td className="px-6 py-4 text-xl">
        RWF
        {item.variant.discount
          ? discountPrice(item.variant.price, item.variant.discount)
          : item.variant.price}
      </td>
      <td className="px-6 py-4">
        <WishListQuantity item={item} />
      </td>
      <td className="px-6 py-4 text-xl">
        RWF
        {(
          discountPrice(item.variant.price, item.variant.discount) * item.qty
        ).toFixed(2)}
      </td>
    </tr>
  );
}
 
 



  