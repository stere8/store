"use client";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "@/store/WishListSlice";
import { IRootState } from "@/store";
import { Button } from "@/components/ui/button";
import { WishListItem } from "@/types";
import React from "react";
interface Props {
  product: WishListItem;
}

export default function AddToWishListButton({ product }: Props) {
  const dispatch = useDispatch();
  const wishList = useSelector((state: IRootState) => state.WishList.items);
  const isInWishList = wishList.some(
    (item) => item.variant._id === product.variant._id
  );

  const toggleWishList = () => {
    if (isInWishList) {
      dispatch(removeFromWishList(product.variant._id));
    } else {
      dispatch(addToWishList(product));
    }
  };

  return (
    <Button variant="icon" onClick={toggleWishList}>
      <Heart
        size={24}
        className={isInWishList ? "fill-red-500 text-red-500" : ""}
      />
    </Button>
  );
}