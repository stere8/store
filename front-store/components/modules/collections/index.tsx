"use client";
import React from "react";
import Container from "@/components/custom/Container";
import ProductCard from "./ProductCard";
import { FormattedMessage } from "react-intl";
import { TypeProductModel } from "@/types/models";

// Keys must match your translation file exactly
const COLLECTION_CATEGORIES = [
  {
    key: "flash_sale",
    messageId: "home.main.flash-sale-today",
  },
  {
    key: "best_sellers",
    messageId: "home.main.best-sellers",
  },
  {
    key: "top_rated",
    messageId: "home.main.top-rated",
  },
  {
    key: "new_arrival",
    messageId: "home.main.new-arrival",
  },
];

export default function Collections({
  products,
}: {
  products: TypeProductModel[];
}) {
  return (
    <section className="py-10">
      <Container>
        <div className="grid xl:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6">
          {COLLECTION_CATEGORIES.map((category, index) => {
            const slicedProducts = products.slice(index * 3, index * 3 + 3);

            return (
              <div key={category.key} className="flex flex-col gap-4">
                <h6 className="text-body-md-600 capitalize">
                  <FormattedMessage id={category.messageId} />
                </h6>

                <div className="flex flex-col gap-4">
                  {slicedProducts.length > 0 ? (
                    slicedProducts.map((item) => (
                      <ProductCard item={item} key={item._id} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      <FormattedMessage id="home.main.noProductsAvailable" defaultMessage="No products available." />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// before was like this 

{/* 
  "use client";
import Container from "@/components/custom/Container";
import React from "react";
import ProductCard from "./ProductCard";
import { TypeProductModel } from "@/types/models";

export default function Collections({
  products,
}: {
  products: TypeProductModel[];
}) {

  return (
    <section className="py-10">
      <Container>
        <div className="grid xl:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 grid-cols-1  gap-6">
          <div className="flex flex-col gap-4">
            <h6 className="text-body-md-600 capitalize">flash sale today</h6>
            <div className="flex flex-col gap-4">
              {products &&
                products
                  .slice(0, 3)
                  .map((item: TypeProductModel) => (
                    <ProductCard item={item} key={item._id} />
                  ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h6 className="text-body-md-600 capitalize">best sellers</h6>
            <div className="flex flex-col gap-4">
              {products &&
                products
                  .slice(0, 3)
                  .map((item: TypeProductModel) => (
                    <ProductCard item={item} key={item._id} />
                  ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h6 className="text-body-md-600 capitalize">top rated</h6>
            <div className="flex flex-col gap-4">
              {products &&
                products
                  .slice(0, 3)
                  .map((item: TypeProductModel) => (
                    <ProductCard item={item} key={item._id} />
                  ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h6 className="text-body-md-600 capitalize">new arrival</h6>
            <div className="flex flex-col gap-4">
              {products &&
                products
                  .slice(0, 3)
                  .map((item: TypeProductModel) => (
                    <ProductCard item={item} key={item._id} />
                  ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

  */}