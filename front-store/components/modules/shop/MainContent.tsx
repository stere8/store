import Loading from "@/components/custom/Loading";
import usePagination from "@/hooks/usePagination";
import { TypeProductModel } from "@/types/models";
import { Pagination } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import ProductsContent from "./Content";
import { FormattedMessage } from "react-intl";

export default function MainContent({
  slug,
  maxPrice,
  minPrice,
  setMinPrice,
  setMaxPrice,
  className,
  loading,
  setLoading,
  setCategory,
  setBrand,
  setTag,
  brand,
  tag,
  category,
}: {
  slug?: string;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (e: number) => void;
  setMaxPrice: (e: number) => void;
  setLoading: (e: boolean) => void;
  setCategory: (e: string) => void;
  setBrand: (e: string) => void;
  setTag: (e: string) => void;
  loading: boolean;
  className: string;
  brand: string;
  tag: string;
  category: string;
}) {
  const [products, setProducts] = useState<TypeProductModel[]>([]);
  const [perpage, setPerPages] = useState<number>(10);
  const [filter, setFilter] = useState<string>("latest");
  const [page, setPage] = useState(1);
  const count = Math.ceil(products.length / perpage);
  const _DATA = usePagination(products, perpage);

  const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
    setPage(p);
    _DATA.jump(p);
  };

  //get products
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/products", {
          params: {
            filter: filter,
            minPrice: minPrice,
            maxPrice: maxPrice,
            category: category,
            brand: brand,
            tag: tag,
            style: "shop",
          },
        })
        .then((response) => {
          setProducts(response.data.data);
        })
        .catch((error) => {
          console.log(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getProducts();
  }, [
    page,
    category,
    tag,
    brand,
    filter,
    slug,
    minPrice,
    maxPrice,
    setLoading,
  ]);

  return (
    <>
      {loading && products.length === 0 && <Loading loading={true} />}
      <div className={`${className}`}>
        <div className="flex flex-col gap-4">
          <TopBar
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            loading={loading}
            setLoading={setLoading}
            slug={slug}
            perpage={perpage}
            filter={filter}
            setPerPages={setPerPages}
            setFilter={setFilter}
            maxPage={_DATA.maxPage}
            page={_DATA.maxPage}
            products={products}
            brand={brand}
            tag={tag}
            category={category}
            setCategory={setCategory}
            setBrand={setBrand}
            setTag={setTag}
          />
          <ProductsContent products={_DATA.currentData()} />

          {/* pagination */}
          <div className="py-10 flex justify-between mt-auto">
            <Pagination
              count={count}
              page={page}
              color="primary"
              variant="outlined"
              shape="rounded"
              onChange={handleChange}
            />

            <FormattedMessage
              id="results.showing"
              defaultMessage="Showing {current} of {total} results"
              values={{
                current: _DATA.maxPage === page ? products.length : perpage * page,
                total: products.length,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
