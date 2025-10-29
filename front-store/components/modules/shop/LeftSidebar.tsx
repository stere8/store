import HeadingShop from "@/components/custom/HeadingShop";
import React from "react";
import ProductsCatAccordions from "./ProductsCatAccordions";
import ProductsFilters from "./Filters";
import Loading from "@/components/custom/Loading";
import LeftBanner from "./LeftBanner";
import PopularBrand from "./PopularBrand";

export default function LeftSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  loading,
  setLoading,
  setCategory,
  setBrand,
  className,
}: {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  setCategory: (value: string) => void;
  setBrand: (value: string) => void;
  setTag: (value: string) => void;
  loading: boolean;
  setLoading: (e: boolean) => void;
  className?: string;
}) {
  // GET API
  // const [tags, setTags] = useState<TypeTagModel[]>();
  // useEffect(() => {
  //   const getTags = async () => {
  //     setLoading(true);
  //     await axios
  //       .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/tags")
  //       .then((response) => {
  //         setTags(response.data.data);
  //       })
  //       .catch((error) => {
  //         console.log(error.message);
  //       })
  //       .finally(() => {
  //         setLoading(false);
  //       });
  //   };
  //   getTags();
  // }, []);

  return (
    <div className={`lg:max-w-[300px] h-full ${className}`}>
      {loading && <Loading loading={true} />}
      <div className="flex flex-col gap-8 ">
        {/* product categories  */}
        <div className="flex flex-col gap-4  w-full">
          <HeadingShop name="categories" />
          <ProductsCatAccordions setCategory={setCategory} />
        </div>

        {/* filters prices */}
        <div className="flex flex-col gap-8  w-full">
          <div className="flex flex-col gap-4">
            <HeadingShop name="Price Range" />
            <ProductsFilters
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setCategory={setCategory}
              setBrand={setBrand}
              setLoading={setLoading}
              loading={loading}
            />
          </div>

          {/* <div className="flex flex-col gap-4">
            <HeadingShop name="Popular tag " />
            <div className="flex gap-4 h-full flex-wrap">
              {tags &&
                tags.map((item, idx: number) => (
                  <PopularTag item={item} key={idx} setTag={setTag} />
                ))}
            </div>
          </div> */}

          <div className="flex flex-col gap-4">
            <HeadingShop name="Popular brands" />
            <div className="flex gap-4 h-full flex-wrap">
              <PopularBrand setLoading={setLoading} setBrand={setBrand} />
            </div>
          </div>
        </div>

        <LeftBanner />
      </div>
    </div>
  );
}
