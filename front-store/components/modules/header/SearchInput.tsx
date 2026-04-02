"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import Image from "next/image";
import { Badge } from "@/components/custom/Badge";
import { m } from "framer-motion";
import { TypeProductModel } from "@/types/models";
import axios from "axios";
import Loading from "@/components/custom/Loading";
import Link from "next/link";

export default function SearchInput({ className }: { className?: string }) {
  const [openSearchContent, setOpenSearchContent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TypeProductModel[]>();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const search = e.currentTarget.value;
    if (search.length > 1) {
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/products", {
          params: {
            search: search,
          },
        })
        .then((response) => {
          setData(response.data.data);
        })
        .catch(() => {})
        .finally(() => {});
    }

    setLoading(false);
  };
  return (
    <div className={cn("relative z-50", className)}>
      {loading && <Loading loading={true} />}
      <Input
        className="border-none"
        onInput={handleSearch}
        onMouseDown={() => setOpenSearchContent(!openSearchContent)}
      />
      <Button type="submit" variant="icon" className="text-black">
        <Search />
      </Button>
      <m.div
        onMouseLeave={() => setOpenSearchContent(!openSearchContent)}
        initial={{ opacity: 0, y: -15 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "hidden  w-full absolute border top-12 bg-white h-[610px] overflow-auto   backdrop-filter shadow-gray-700 shadow-md",
          openSearchContent && "flex"
        )}
      >
        <div className="flex flex-col">
          <div className="flex flex-col gap-y-6  bg-white">
            {data?.map((item, idx) => (
              <Link
                href={`/products/${item.slug}`}
                className="cursor-pointer h-[170px] flex gap-4 py-4 px-4 border-2 border-white  hover:border-secondary-700 "
                key={idx}
              >
                <Image
                  src={item.images[0].url}
                  alt="image"
                  height={0}
                  width={100}
                  className="h-auto object-contain"
                />
                <div className="flex flex-col gap-1">
                  <h3 className="font-[400]">{item.name}</h3>
                  {item.discount > 0 && (
                    <Badge variant="warning">-{item.discount}%</Badge>
                  )}
                </div>
                <h3 className="">{item.price}RWF</h3>
              </Link>
            ))}
          </div>
        </div>
      </m.div>
    </div>
  );
}
