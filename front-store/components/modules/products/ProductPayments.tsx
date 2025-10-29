import Image from "next/image";
import React from "react";

export default function ProductPayments() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-body-sm-400">100% Guarantee Safe Checkout</p>
      <div className="flex gap-4">
        <Image
          alt="pay image"
          src="https://cdn-icons-png.flaticon.com/128/15398/15398152.png"
          height={10}
          width={40}
          className=""
        />
        <Image
          alt="pay image"
          src="https://cdn-icons-png.flaticon.com/128/16174/16174534.png"
          height={10}
          width={40}
          className=""
        />
      </div>
    </div>
  );
}
