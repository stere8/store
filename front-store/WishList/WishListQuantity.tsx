"use client";
import { updateToWishList } from "@/store/WishListSlice";
import { WishListItem } from "@/types";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { IRootState } from "@/store";
import { memoize } from "proxy-memoize";
import { Button } from "@/components/ui/button";

export default function WishListQuantity({ item }: { item: WishListItem }) {
  const { WishList } = useSelector(memoize((state: IRootState) => ({ ...state })));

  const dispatch = useDispatch();
  const [qty, setQty] = useState<number>(1);

  const updateQty = (value: string) => {
    if (value === "dec") {
      if (qty === 1) {
        return;
      }
    }
    if (value === "inc") {
      if (qty === 9) {
        return;
      }
    }

    // WishList operation
    if (value === "dec") {
      setQty(qty === 1 ? qty : qty - 1);
    }
    if (value === "inc") {
      setQty(qty === 9 ? qty : qty + 1);
    }

    // Update WishList
    const newWishList = WishList.items.map((p: WishListItem) => {
      if (p.variant._id === item.variant._id) {
        return {
          ...p,
          qty: value === "dec" ? qty - 1 : qty + 1,
        };
      }
      return p;
    });
    dispatch(updateToWishList(newWishList));
  };
// Uncomment the following lines if you want to use infinite quantity
// const dispatch = useDispatch();
// const [qty, setQty] = useState<number>(1);

// const updateQty = (value: string) => {
//   if (value === "dec") {
//     if (qty === 1) {
//       return;
//     }
//     setQty(qty - 1);
//   }
//   if (value === "inc") {
//     setQty(qty + 1);
//   }

//   // Update WishList
//   const newWishList = wishlist.WishListItems.map((p: WishListItem) => {
//     if (p.variant._id === item.variant._id) {
//       return {
//         ...p,
//         qty: value === "dec" ? qty - 1 : qty + 1,
//       };
//     }
//     return p;
//   });
//   dispatch(updateToWishList(newWishList));
// };
  useEffect(() => {
    setQty(item.qty);
  }, [item]);

  return (
    <div className="inline-flex justify-center items-center gap-2 border border-border px-4 py-2 rounded-none">
      <Button
        onClick={() => updateQty("dec")}
        className="border-none rounded-none"
        variant="outline"
      >
        <MinusIcon className="h-4 w-4  group-hover:text-primary-500" />
      </Button>
      <strong className="text-center text-xl">{qty}</strong>
      <Button
        onClick={() => updateQty("inc")}
        className="border-none rounded-none"
        variant="outline"
      >
        <PlusIcon className="h-4 w-4 group-hover:text-primary-500" />
      </Button>
    </div>
  );
}
