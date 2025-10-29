import React from "react";
import { ShoppingBasket } from "lucide-react";
import { TypeProductModel } from "@/types/models";
import ProductCard from "./ProductCard";
import { FormattedMessage } from "react-intl";
export default function ProductsContent({ products }: { products: TypeProductModel[] }) {
  return (
    <>
      {products.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-20 px-20 w-full">
          <ShoppingBasket className="font-bold" size={100} />
          <h3 className="">
            <FormattedMessage id="product.none-found" defaultMessage="No product found!" />
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 relative">
          {products.map((item: TypeProductModel, idx: number) => {
            return <ProductCard key={idx} item={item} />;
          })}
        </div>
      )}
    </>
  );
}
