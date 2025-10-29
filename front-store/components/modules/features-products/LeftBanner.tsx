import { RectangleButton } from "@/components/custom/RectangleButton";
import Image from "next/image";
import * as React from "react";

export default function LeftBanner() {
  return (
    <div className="w-full flex flex-wrap sm:flex-nowrap lg:flex-wrap lg:h-fit bg-warning-300 h-auto gap-4 lg:w-[400px] xl:h-auto xl:gap-0">
      <div className="w-full flex flex-wrap  items-center gap-4 pt-6  py-6 xl:pb-0 px-4">
        <h3 className="text-body-sm-600 text-danger-600">
          COMPUTER & ACCESSORIES
        </h3>
        <h1 className="text-black">32% Discount</h1>
        <h6 className="text-body-md-600 text-gray-700">
          For all electronics products
        </h6>
        <div className="flex gap-6 items-center">
          <span className="text-body-sm-400">Offers ends in:</span>
          <span className="p-2 bg-white text-body-tiny-400">
            ENDS OF CHRISTMAS
          </span>
        </div>
        <div className="flex justify-center">
          <RectangleButton className="w-full" variant="primary" icon="after">
            SHOP NOW
          </RectangleButton>
        </div>
      </div>
      <div className="mt-auto w-full hidden lg:block">
        <Image
          className="w-full xl:object-contain"
          width="500"
          height="500"
          alt="ope"
          src="https://res.cloudinary.com/didbxg1f9/image/upload/v1728937490/images/jl2klatxoxcjdiollo7e.jpg"
        />
      </div>
    </div>
  );
}
