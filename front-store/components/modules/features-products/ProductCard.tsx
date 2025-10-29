import { Badge } from "@/components/custom/Badge";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { Rating } from "@mui/material";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function ProductCard() {
  return (
    <div className="group w-full p-2 border gap-1 border-gray-100 sm:w-[248px] md:w-[248px]  lg:w-[232px] xl:w-[248px]  cursor-pointer flex items-center flex-wrap sm:flex-wrap md:flex-wrap xl:flex-wrap hover:bg-white hover:shadow-lg hover:border-gray-200">
      <div className="relative ">
        <Image
          src="https://res.cloudinary.com/didbxg1f9/image/upload/v1728919679/images/tpf1vskbj3q6kxqa23tm.png"
          width={400}
          height={188}
          alt=""
          className="object-contain hover:bg-gray-400 group-hover:opacity-25"
        />
        <div className="flex gap-2 flex-col absolute top-4 left-0">
          <Badge variant="warning" className="text-black">
            32% OFF
          </Badge>
          <Badge variant="danger" className="text-white">
            HOT
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
            name="hover-feedback"
            value={5}
            precision={0.5}
          />
          <span className="text-gray-500 text-body-tiny-400">(583)</span>
        </div>
        <div>
          <p className="text-body-sm-400 text-balance ">
            Bose Sport Earbuds - Wireless Earphones - Bluetooth In Ear...
          </p>
        </div>
        <div className="inline-flex items-center gap-[4px]">
          <CurrencyFormat
            value={865.99}
            className="w-20 !text-gray-300 text-body-l-400 line-through"
          />
          <CurrencyFormat
            value={442.12}
            className="w-20 !text-secondary-500 text-body-l-600  text-left"
          />
        </div>
      </div>
    </div>
  );
}
