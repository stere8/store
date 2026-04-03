"use client";
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { CiMenuFries } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TypeCategoryModel, TypeSubCategoryModel } from "@/types/models";
import { apiClient } from "@/lib/epoc-api";
import { toFrontCategory } from "@/lib/epoc-mappers";

type SidebarPage = {
  slug: string;
  name: string;
};

const DEFAULT_PAGES: SidebarPage[] = [
  { slug: "products", name: "Products" },
  { slug: "cart", name: "Cart" },
  { slug: "WishList", name: "Wishlist" },
];

export default function SidebarMenu({ className }: { className?: string }) {
  const [show, setShow] = useState(false);
  const [subCategories, setSubCategories] = useState<TypeSubCategoryModel[]>();
  const [categories, setCategories] = useState<TypeCategoryModel[]>([]);
  const [pages] = useState<SidebarPage[]>(DEFAULT_PAGES);
  const router = useRouter();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiClient.get("/api/categories");
        const items = Array.isArray(response.data) ? response.data : [];
        setCategories(items.map(toFrontCategory));
      } catch (error) {
        console.log(error);
      }
    };

    getCategories();
  }, []);

  return (
    <div className={cn("", className)}>
      <Sheet>
        <SheetTrigger>
          <CiMenuFries size={34} className={cn("text-white")} />
        </SheetTrigger>
        <SheetContent
          className={cn("px-4 w-full md:w-[400px]  [&>#closeBtn]:text-3xl ")}
        >
          <div className="mt-10">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="category" className="text-h6">
                  Categories
                </TabsTrigger>
                <TabsTrigger value="menu" className="text-h6">
                  Pages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="category" className="pt-4">
                <div className="flex flex-col gap-6 h-full">
                  {categories &&
                    categories
                      .slice(0, 20)
                      .map((item: TypeCategoryModel, idx: number) => (
                        <div key={idx} className="group px-4 py-2">
                          <div className="flex items-center gap-4">
                            <span
                              className="text-span capitalize hover:text-primary-500 cursor-pointer"
                              onClick={() =>
                                router.push(`/categories/${item.slug}/products`)
                              }
                            >
                              {item.name}
                            </span>
                            {item?.subCategory &&
                              item.subCategory.length > 0 && (
                                <ChevronRight
                                  onClick={() => {
                                    setShow(!show);
                                    setSubCategories(item?.subCategory);
                                  }}
                                  className="text-icon ms-auto h-5 w-5"
                                  size={14}
                                />
                              )}
                          </div>
                        </div>
                      ))}
                </div>
              </TabsContent>
              <TabsContent value="menu">
                <div>
                  {pages &&
                    pages.slice(0, 20).map((item, idx: number) => (
                        <div
                          onClick={() => router.push(`/${item.slug}`)}
                          key={idx}
                          className="group inline-flex items-center px-4 py-2 gap-4 w-full hover:text-primary-700 capitalize cursor-pointer"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="">{item.name}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={show}>
        <SheetTrigger></SheetTrigger>
        <SheetContent
          className={cn("px-4 w-full md:w-[400px]  [&>#closeBtn]:hidden ")}
          side="left"
        >
          <div
            className={cn(
              "duration-300 ease-in p-8 absolute top-0 h-screen w-[260px] bg-white   left-0"
            )}
          >
            <Button
              onClick={() => setShow(!show)}
              variant="default"
              title="back"
              className={cn(
                "cursor-pointer hover:bg-black hover:text-white",
                subCategories && ""
              )}
            >
              <ChevronLeft />
            </Button>
            <div className="flex flex-col gap-8 justify-center mt-12">
              {subCategories &&
                subCategories.map((item: TypeSubCategoryModel, idx: number) => (
                  <Link
                    className="text-xl capitalize hover:text-primary-500"
                    key={idx}
                    href={`/categories/${item.slug}/products`}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
