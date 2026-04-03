"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";
import Container from "@/components/custom/Container";
import Heading from "@/components/custom/Heading";
import { useRouter } from "next/navigation";
import { TypeCategoryModel, TypeSlideModel } from "@/types/models";
import Image from "next/image";
import Link from "next/link";

export default function Categories({
  categories,
  campaigns,
  campaignsTwo,
}: {
  categories: TypeCategoryModel[];
  campaigns: TypeSlideModel[];
  campaignsTwo: TypeSlideModel[];
}) {
  const router = useRouter();
  const hasPrimaryCampaign = Boolean(campaigns[0]?.slideItem?.length);
  const hasSecondaryCampaign = Boolean(campaignsTwo[0]?.slideItem?.length);
  const fallbackCards = categories.slice(0, 2);

  return (
    <section className="my-10 relative">
      <Container>
        <div className="flex flex-col gap-10">
          <Heading name={`home.main.shop-with-categorys`} />
          <Swiper
            breakpoints={{
              360: {
                slidesPerView: 1,
                spaceBetween: 40,
              },
              575: {
                slidesPerView: 1,
                spaceBetween: 40,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 40,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1320: {
                slidesPerView: 6,
                spaceBetween: 16,
              },
            }}
            autoplay={{
              delay: 10500,
              disableOnInteraction: false,
            }}
            spaceBetween={16}
            slidesPerView={1}
            navigation={true}
            pagination={false}
            modules={[Autoplay, Navigation, Pagination]}
            className={cn("categorySwiper")}
          >
            {categories.map((item: TypeCategoryModel, idx: number) => (
              <SwiperSlide
                key={idx}
                onClick={() => router.push(`/categories/${item.slug}/products`)}
                className="flex flex-col items-center gap-4 border border-gray-100 px-3 py-6 cursor-pointer hover:border-primary-200"
              >
                <Image
                  src={item.image}
                  alt="category"
                  width="100"
                  height="100"
                  className="object-scale-down w-auto"
                />
                <span className="text-body-md-500 capitalize">
                  {item.name}
                </span>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasPrimaryCampaign ? (
              <Link
                href={`/products/${campaigns[0].slideItem[0].product.slug}`}
                className="flex gap-[40px] items-center bg-gray-50 p-[44px] cursor-pointer"
                style={{
                  backgroundImage: `url(${campaigns[0].slideItem[0].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top",
                  height: "350px",
                  width: "100%",
                }}
              />
            ) : fallbackCards[0] ? (
              <Link
                href={`/categories/${fallbackCards[0].slug}/products`}
                className="flex flex-col justify-end gap-3 bg-gray-50 p-[44px] cursor-pointer border border-gray-100"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.15), rgba(17,24,39,0.72)), url(${fallbackCards[0].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "350px",
                  width: "100%",
                }}
              >
                <span className="text-sm uppercase tracking-[0.2em] text-white/80">
                  Featured category
                </span>
                <h3 className="text-white">{fallbackCards[0].name}</h3>
                <p className="text-sm text-white/80">
                  Browse the latest picks available in the local .NET catalog.
                </p>
              </Link>
            ) : (
              <div className="border border-dashed border-gray-200 p-10 text-sm text-gray-500">
                No featured category available yet.
              </div>
            )}

            {hasSecondaryCampaign ? (
              <Link
                href={`/products/${campaignsTwo[0].slideItem[0].product.slug}`}
                className="flex gap-[40px] items-center bg-black p-[44px] relative cursor-pointer"
                style={{
                  backgroundImage: `url(${campaignsTwo[0].slideItem[0].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top",
                }}
              />
            ) : fallbackCards[1] ? (
              <Link
                href={`/categories/${fallbackCards[1].slug}/products`}
                className="flex flex-col justify-end gap-3 bg-black p-[44px] relative cursor-pointer border border-gray-800"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.1), rgba(15,23,42,0.82)), url(${fallbackCards[1].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="text-sm uppercase tracking-[0.2em] text-white/80">
                  Shop by category
                </span>
                <h3 className="max-w-60 text-white">{fallbackCards[1].name}</h3>
                <p className="text-sm text-white/80">
                  Explore the products currently available from the backend.
                </p>
              </Link>
            ) : (
              <div className="border border-dashed border-gray-200 p-10 text-sm text-gray-500">
                More category highlights will appear here as the API grows.
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
