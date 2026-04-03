"use client";
import Container from "@/components/custom/Container";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";
import { m } from "framer-motion";
import { TypeProductModel, TypeSlideItemModel } from "@/types/models";
import { cn } from "@/lib/utils";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

type SlideViewModel = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  href: string;
  buttonLabel: string;
  textColor: string;
};

const toCampaignSlide = (item: TypeSlideItemModel): SlideViewModel => ({
  id: item._id,
  image: item.image,
  title: item.title || item.product?.name || "Featured product",
  subtitle: item.subtitle || item.description || "",
  href: `/products/${item.product?.slug || item.slug}`,
  buttonLabel: item.btn || "Shop now",
  textColor: item.textColor || "#111827",
});

const toProductSlide = (product: TypeProductModel, index: number): SlideViewModel => ({
  id: product._id || `${product.slug}-${index}`,
  image: product.images?.[0]?.url || "/assets/products/image.png",
  title: product.name,
  subtitle: product.description,
  href: `/products/${product.slug}`,
  buttonLabel: "Shop now",
  textColor: "#111827",
});

export default function HomeSlide({
  firstZone,
  secondZone,
  thirdZone,
  fallbackProducts = [],
}: {
  firstZone: TypeSlideItemModel[];
  secondZone: TypeSlideItemModel[];
  thirdZone: TypeSlideItemModel[];
  fallbackProducts?: TypeProductModel[];
}) {
  const animation = {
    hide: { x: 82, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
    },
  };

  const router = useLocalizedRouter();
  const mainSlides =
    firstZone.length > 0
      ? firstZone.slice(0, 4).map(toCampaignSlide)
      : fallbackProducts.slice(0, 4).map(toProductSlide);

  const rightTiles =
    secondZone.length > 0 || thirdZone.length > 0
      ? [
          secondZone[0] ? toCampaignSlide(secondZone[0]) : undefined,
          thirdZone[0] ? toCampaignSlide(thirdZone[0]) : undefined,
        ].filter(Boolean) as SlideViewModel[]
      : fallbackProducts.slice(1, 3).map(toProductSlide);

  return (
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
            {mainSlides.length > 0 ? (
              mainSlides.map((item) => (
                <SwiperSlide
                  onClick={() => router.push(item.href)}
                  key={item.id}
                  className="cursor-pointer relative [&>button:block] hover:animate-heart-beating"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    height: "520px",
                    width: "872px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className={cn(
                      "absolute drop-shadow-2xl grid grid-cols-1 justify-items-start gap-8 m-auto top-100 lg:top-30 left-20 w-fit"
                    )}
                  >
                    <m.h1
                      initial={animation.hide}
                      whileInView={animation.show}
                      transition={{ delay: 0.4 }}
                      className="max-w-50 text-left text-3xl lg:text-4xl lg:max-w-[300px] capitalize"
                      style={{
                        color: item.textColor,
                      }}
                    >
                      {item.title.substring(0, 65)}
                    </m.h1>
                    <m.h4
                      initial={animation.hide}
                      whileInView={animation.show}
                      transition={{ delay: 0.6 }}
                      className={cn(
                        "text-balance text-sm text-left font-[200] max-w-[300px]"
                      )}
                      style={{
                        color: item.textColor,
                      }}
                    >
                      {item.subtitle.substring(0, 140)}
                    </m.h4>

                    <m.a
                      initial={animation.hide}
                      whileInView={animation.show}
                      transition={{
                        delay: 0.8,
                        ease: "linear",
                        duration: 0.4,
                      }}
                      className="rounded-sm capitalize py-2 bg-white hover:bg-black hover:text-white px-[40px]"
                      href={item.href}
                    >
                      {item.buttonLabel}
                    </m.a>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <div className="flex h-[520px] items-center justify-center border border-dashed border-gray-200 text-sm text-gray-500">
                No products are available yet.
              </div>
            )}
          </Swiper>

          <div className="hidden xl:grid grid-cols-1 grid-rows-2 gap-[24px]">
            {rightTiles.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(item.href)}
                className="cursor-pointer border border-gray-100"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.1), rgba(17,24,39,0.55)), url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
