"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Heart, Shuffle, X as TwitterX } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { BsLinkedin, BsWhatsapp } from "react-icons/bs";
import { SiMeta } from "react-icons/si";
import { useDispatch } from "react-redux";
import { addToWishList } from "@/store/WishListSlice";
//import {AddToWishListButton}from "@/WishistButton";
import { WishListItem } from "@/types";

export default function ProductShare({ item }: { item: WishListItem }) {
  const dispatch = useDispatch();

  const handleAddToWishList = () => {
    if (!item?.variant?._id) {
      toast({
        variant: "destructive",
        title: "Oops",
        description: "Please select a valid variant before adding to wishlist.",
      });
      return;
    }

    dispatch(addToWishList(item));
    toast({
      variant: "default",
      title: "Added to Wishlist",
      description: `${item.productName} has been added to your wishlist.`,
    });
  };
return (
  <div className="mt-6 flex items-center gap-4 flex-wrap">
    {/* Buttons */}
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddToWishList}
      className="gap-2"
    >
      <Heart className="w-4 h-4" />
      Add to Wishlist
    </Button>

    <Button
      onClick={() =>
        toast({
          title: "Coming Soon 👀",
          description: "Compare feature will be available in future.",
        })
      }
      variant="outline"
      className="flex gap-[6px] border-none"
    >
      <Shuffle size={24} /> Add to compare
    </Button>

    {/* Social Icons */}
    <div className="flex gap-2 ms-auto">
      <Link
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          usePathname()
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <SiMeta size={24} />
        </Button>
      </Link>
      <Link
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          usePathname()
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <TwitterX size={24} />
        </Button>
      </Link>
      <Link
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          usePathname()
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <BsLinkedin size={24} />
        </Button>
      </Link>
      <Link
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          item.productName + " " + usePathname()
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <BsWhatsapp size={24} />
        </Button>
      </Link>
    </div>
  </div>
);
}