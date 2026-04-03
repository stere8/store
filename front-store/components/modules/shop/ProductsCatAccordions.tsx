import React, { useEffect, useState } from "react";
import { TypeCategoryModel } from "@/types/models";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loading from "@/components/custom/Loading";
import { apiClient } from "@/lib/epoc-api";
import { toFrontCategory } from "@/lib/epoc-mappers";

export default function ProductsCatAccordions({
  setCategory,
}: {
  setCategory: (value: string) => void;
}) {
  //GET API
  const [categories, setCategories] = useState<TypeCategoryModel[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/api/categories");
        const items = Array.isArray(response.data) ? response.data : [];
        setCategories(items.map(toFrontCategory));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getCategories();
  }, []);

  return (
    <>
      {loading && <Loading loading={true} />}
      <div className="w-full flex flex-col gap-[16px]">
        <RadioGroup defaultValue="comfortable" className="flex flex-col gap-4">
          {categories &&
            categories
              .slice(0, 20)
              .map((item: TypeCategoryModel, idx: number) => (
                <div
                  onClick={() => setCategory(item.slug)}
                  className="flex items-center gap-[20px]"
                  key={idx}
                >
                  <RadioGroupItem
                    data-state="checked"
                    className="h-[24px] w-[24px] border-slate-200 "
                    value={item.name}
                    id={item._id}
                  />
                  <Label
                    className="capitalize text-gray-700"
                    htmlFor={item._id}
                  >
                    {item.name}
                  </Label>
                </div>
              ))}
        </RadioGroup>
      </div>
    </>
  );
}
