import { TypeProductModel } from "@/types/models";
import { Badge } from "@/components/custom/Badge";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { Rating } from "@mui/material";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const getAverageRating = (item: TypeProductModel) => {
  if (!item.reviews?.length) {
    return 4.5;
  }

  const total = item.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / item.reviews.length;
};

export default function ProductCard({ item }: { item: TypeProductModel }) {
  const averageRating = getAverageRating(item);
  const imageUrl = item.images[0]?.url || item.imageUrl || "/assets/products/image.png";
  const originalPrice =
    item.discount > 0 ? item.price + (item.price * item.discount) / 100 : null;

  return (
    <Link
      href={`/products/${item.slug}`}
      className="group w-full p-2 border gap-1 border-gray-100 sm:w-[248px] md:w-[248px] lg:w-[232px] xl:w-[248px] cursor-pointer flex items-center flex-wrap hover:bg-white hover:shadow-lg hover:border-gray-200"
    >
      <div className="relative ">
        <Image
          src={imageUrl}
          width={400}
          height={188}
          alt={item.name}
          className="h-[188px] w-[220px] object-contain hover:bg-gray-400 group-hover:opacity-25"
        />
        <div className="flex gap-2 flex-col absolute top-4 left-0">
          {item.discount > 0 && (
            <Badge variant="warning" className="text-black">
              {item.discount}% OFF
            </Badge>
          )}
          <Badge variant="danger" className="text-white">
            {item.inventory === "instock" ? "In stock" : "Out of stock"}
          </Badge>
        </div>
        <div className="absolute top-20 left-7 group-hover:flex gap-2 hidden">
          <div className="outline outline-1 outline-gray-100 hover:bg-primary-500 hover:text-white bg-white p-3 sahdow  rounded-full flex justify-center items-center">
            <Heart size={24} />
          </div>
          <div className="outline outline-1 outline-gray-100 hover:bg-primary-500 hover:text-white bg-white p-3 sahdow  rounded-full flex justify-center items-center">
            <ShoppingCart size={24} />
          </div>
          <div className="outline outline-1 outline-gray-100 hover:bg-primary-500 hover:text-white bg-white p-3 sahdow  rounded-full flex justify-center items-center">
            <Eye size={24} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 ">
        <div className="flex gap-2 items-center">
          <Rating
            className="text-primary-500 text-sm"
            readOnly
            name={`hover-feedback-${item._id}`}
            value={averageRating}
            precision={0.5}
          />
          <span className="text-gray-500 text-body-tiny-400">
            ({item.reviews?.length || 0})
          </span>
        </div>
        <div>
          <p className="text-body-sm-400 text-balance ">{item.name}</p>
          <p className="text-body-xs-400 text-gray-500">
            {item.category?.name || "Uncategorized"}
          </p>
        </div>
        <div className="inline-flex items-center gap-[4px]">
          {originalPrice ? (
            <CurrencyFormat
              value={originalPrice}
              className="w-20 !text-gray-300 text-body-l-400 line-through"
            />
          ) : null}
          <CurrencyFormat
            value={item.price}
            className="w-20 !text-secondary-500 text-body-l-600  text-left"
          />
        </div>
      </div>
    </Link>
  );
}
