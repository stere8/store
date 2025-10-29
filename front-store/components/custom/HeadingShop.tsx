import React from "react";

export default function HeadingShop({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center w-full">
        <h6 className="uppercase">{name}</h6>
      </div>
    </div>
  );
}
