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
import useSWR, { Fetcher } from "swr";
import { TypeCategoryModel, TypeSlideModel } from "@/types/models";
import Image from "next/image";
import { Badge } from "@/components/custom/Badge";
import { RectangleButton } from "@/components/custom/RectangleButton";
import Link from "next/link";
import { LocaleLink } from "@/components/custom/LocaleLink";

export default function Categories({
  campaigns,
  campaignsTwo,
}: {
  campaigns: TypeSlideModel[];
  campaignsTwo: TypeSlideModel[];
}) {
  const router = useRouter();

  // Client-side data fetching with SWR
  const fetcher: Fetcher<TypeCategoryModel[], string> = (args) =>
    fetch(args)
      .then((res) => res.json())
      .then((res) => res.data);
  const { data, error, isLoading } = useSWR<TypeCategoryModel[]>(
    process.env.NEXT_PUBLIC_API_URL + "/api/public/categories",
    fetcher
  );
  if (error) return <div>Failed to load Api</div>;

  return (
    <section className="my-10 relative">
      <Container>
        <div className="flex flex-col gap-10">
          <Heading name={`home.main.shop-with-categorys`} />
          <Swiper
            breakpoints={{
              // when window width is >= 340
              360: {
                slidesPerView: 1,
                spaceBetween: 40,
              },
              // when window width is >= 768
              575: {
                slidesPerView: 1,
                spaceBetween: 40,
              },

              768: {
                slidesPerView: 2,
                spaceBetween: 40,
              },
              // when window width is >= 1024
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
            {data &&
              data.map((item: TypeCategoryModel, idx: number) => (
                <SwiperSlide
                  key={idx}
                  onClick={() =>
                    router.push(`/categories/${item.slug}/products`)
                  }
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
            <>
              {!isLoading &&  campaigns[0] && campaigns[0].slideItem.length > 0 ? (
                <Link
                  href={
                    campaigns &&
                    `/products/${campaigns[0].slideItem[0].product.slug}`
                  }
                  className="flex gap-[40px]  items-center bg-gray-50 p-[44px] cursor-pointer"
                  style={{
                    backgroundImage: `url(${
                      campaigns && campaigns[0].slideItem[0].image
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    height: "350px",
                    width: "100%",
                  }}
                >
                  {!campaigns && (
                    <>
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3 max-w-80">
                          <div className="flex flex-col gap-2">
                            <Badge variant="secondary" className="text-white">
                              INTRODUCTION
                            </Badge>
                            <h1>New Apple Homepod Mini</h1>
                          </div>
                          <p className="text-body-md-400 text-gray-700">
                            Jam-packed with innovation, HomePod mini delivers
                            unexpectedly.
                          </p>
                        </div>
                        <RectangleButton
                          size="sm"
                          icon="after"
                          variant="primary"
                        >
                          SHOP NOW
                        </RectangleButton>
                      </div>
                      <div className="hidden lg:block">
                        <Image
                          src="https://res.cloudinary.com/didbxg1f9/image/upload/v1728992125/images/jupirpqme4xslodsfhfx.png"
                          alt="image"
                          width="300"
                          height="300"
                        />
                      </div>
                    </>
                  )}
                </Link>
              ) : (
                <div>
                  create campaign
                  <strong className="text-red-500 mx-4">
                    homepage-cta-small-first-zone
                  </strong>
                  slide from seller dashboard
                  <LocaleLink target="_blank"
                    href={process.env.NEXT_PUBLIC_API_URL + "/stores"}
                    className="mx-4 text-red-500 "
                  >
                    Here
                  </LocaleLink>
                </div>
              )}

              {campaignsTwo[0] && campaignsTwo[0].slideItem.length > 0 ? (
                <Link
                  href={
                    campaignsTwo &&
                    `/products/${campaignsTwo[0].slideItem[0].product.slug}`
                  }
                  className="flex gap-[40px] items-center bg-black p-[44px] relative cursor-pointer"
                  style={{
                    backgroundImage: `url(${
                      campaignsTwo && campaignsTwo[0].slideItem[0].image
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                  }}
                >
                  {!campaignsTwo && (
                    <>
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3 max-w-80">
                          <div className="flex flex-col gap-2">
                            <Badge variant="warning" className="text-black">
                              INTRODUCING NEW
                            </Badge>
                            <h1 className="text-white  max-w-60">
                              Xiaomi Mi 11 Ultra 12GB+256GB
                            </h1>
                          </div>
                          <p className="text-body-md-400 text-gray-300">
                            Jam-packed with innovation, HomePod mini delivers
                            unexpectedly.
                          </p>
                        </div>

                        <RectangleButton
                          size="sm"
                          icon="after"
                          variant="primary"
                        >
                          SHOP NOW
                        </RectangleButton>
                      </div>
                      <div className="h-full absolute -bottom-10 right-0 hidden lg:block">
                        <Image
                          src="https://res.cloudinary.com/didbxg1f9/image/upload/v1728993784/images/dpd0h3hz9o23k3dwx69h.png"
                          alt="image"
                          width="300"
                          height="300"
                        />
                        <div className="flex justify-center absolute px-[18px] py-[30px] bg-secondary-500 rounded-full top-1 right-5 text-white">
                          $590
                        </div>
                      </div>
                    </>
                  )}
                </Link>
              ) : (
                <div>
                  create campaign
                  <strong className="text-red-500 mx-4">
                    homepage-cta-small-second-zone
                  </strong>
                  slide from seller dashboard
                  <LocaleLink target="_blank"
                              href={process.env.NEXT_PUBLIC_API_URL + "/stores"}
                              className="mx-4 text-red-500 "
                            >
                              Here
                            </LocaleLink>
                </div>
              )}
            </>
          </div>
        </div>
      </Container>
    </section>
  );
}
