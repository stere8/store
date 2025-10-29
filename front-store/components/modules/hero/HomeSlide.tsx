"use client";
import Container from "@/components/custom/Container";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";
import { m } from "framer-motion";
import { TypeSlideItemModel } from "@/types/models";
import Loading from "@/components/custom/Loading";
import { cn } from "@/lib/utils";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import axios from "axios";
import { LocaleLink } from "@/components/custom/LocaleLink";

export default function HomeSlide({
  firstZone,
  secondZone,
  thirdZone,
}: {
  firstZone: TypeSlideItemModel[];
  secondZone: TypeSlideItemModel[];
  thirdZone: TypeSlideItemModel[];
}) {
  const animation = {
    hide: { x: 82, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
    },
  };
  const router = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const handleCampaign = async (item: TypeSlideItemModel) => {
    setLoading(true);
    await axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          "/api/public/campaigns?campaignId=" +
          item._id
      )
      .then(() => {})
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        router.push(`/products/${item.product.slug}?campaignId=${item._id}`);
        setLoading(false);
      });
  };

  return (
    <>
      {loading && <Loading loading={true} />}
      <section className="my-6">
        <Container>
          <div className="grid grid-cols-3 gap-[24px]">
            <Swiper
              className="col-span-3 xl:col-span-2"
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              spaceBetween={50}
              slidesPerView={1}
              navigation={true}
              pagination={true}
              history={{
                key: "slide",
              }}
              modules={[Autoplay, Navigation, Pagination]}
            >
              {firstZone && firstZone.length > 0 ? (
                firstZone.slice(0, 4).map((item: TypeSlideItemModel) => (
                  <SwiperSlide
                    onClick={() => handleCampaign(item)}
                    key={item._id}
                    className="cursor-pointer relative [&>button:block] hover:animate-heart-beating"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      height: "520px",
                      width: "872px",
                      backgroundSize: "cover",
                      backgroundPosition: "left",
                    }}
                  >
                    <div
                      className={cn(
                        "absolute drop-shadow-2xl grid grid-cols-1 justify-items-start gap-8 m-auto top-100 lg:top-30 left-20 w-fit",
                        !item.title && "hidden"
                      )}
                    >
                      <m.h1
                        initial={animation.hide}
                        whileInView={animation.show}
                        transition={{ delay: 0.4 }}
                        className="max-w-50 text-left text-3xl lg:text-4xl lg:max-w-[300px] capitalize"
                        style={{
                          color: `${item.textColor}`,
                        }}
                      >
                        {item.title?.substring(0, 65)}
                      </m.h1>
                      <m.h4
                        initial={animation.hide}
                        whileInView={animation.show}
                        transition={{ delay: 0.6 }}
                        className={cn(
                          "text-balance text-sm text-left font-[200] max-w-[300px]"
                        )}
                        style={{
                          color: `${item.textColor}`,
                        }}
                      >
                        {item.subtitle}
                      </m.h4>

                      <m.a
                        initial={animation.hide}
                        whileInView={animation.show}
                        transition={{
                          delay: 0.8,
                          ease: "linear",
                          duration: 0.4,
                        }}
                        className="rounded-sm capitalize py-2 bg-white 
                        hover:bg-black hover:text-white px-[40px]"
                        href={`/products/${item.slug}`}
                      >
                        {item.btn}
                      </m.a>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <div>
                  create campaign
                  <strong className="text-red-500 mx-4">
                    homepage-slideshow-first-zone
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
            </Swiper>

            <div className="hidden xl:grid grid-cols-1 grid-rows-2 gap-[24px] ">
              {secondZone && secondZone.length > 0 ? (
                <div
                  onClick={() =>
                    router.push(
                      `/products/${secondZone && secondZone[0].product.slug}`
                    )
                  }
                  className="cursor-pointer"
                  style={{
                    backgroundImage: `url(${
                      secondZone && secondZone[0].image
                    })`,
                    backgroundSize: "contain",
                    backgroundPosition: "top",
                  }}
                ></div>
              ) : (
                <div>
                  create campaign
                  <strong className="text-red-500 mx-4">
                    homepage-slideshow-second-zone
                  </strong>
                  slide from seller dashboard
                  <LocaleLink
                    target="_blank"
                    href={process.env.NEXT_PUBLIC_API_URL + "/stores"}
                    className="mx-4 text-red-500 "
                  >
                    Here
                  </LocaleLink>
                </div>
              )}

              {thirdZone && thirdZone.length > 0 ? (
                <div
                  onClick={() =>
                    router.push(
                      `/products/${thirdZone && thirdZone[0].product.slug}`
                    )
                  }
                  className="cursor-pointer"
                  style={{
                    backgroundImage: `url(${thirdZone && thirdZone[0].image})`,
                    backgroundSize: "contain",
                    backgroundPosition: "top",
                  }}
                ></div>
              ) : (
                <div>
                  create campaign
                  <strong className="text-red-500 mx-4">
                    homepage-slideshow-third-zone
                  </strong>
                  slide from seller dashboard
                  <LocaleLink
                    target="_blank"
                    href={process.env.NEXT_PUBLIC_API_URL + "/stores"}
                    className="mx-4 text-red-500 "
                  >
                    Here
                  </LocaleLink>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
