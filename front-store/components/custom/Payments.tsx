"use client";
import { CreditCard, Headphones, Package, Trophy } from "lucide-react";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";
import Container from "@/components/custom/Container";
import { FormattedMessage } from "react-intl";

export default function Payments() {
  return (
    <section className="">
      <Container>
        <Swiper
          breakpoints={{
            // when window width is >= 340
            340: {
              slidesPerView: 1,
              spaceBetween: 28,
            },
            // when window width is >= 768
            575: {
              slidesPerView: 2,
              spaceBetween: 28,
            },

            768: {
              slidesPerView: 2,
              spaceBetween: 28,
            },
            // when window width is >= 1024
            1024: {
              slidesPerView: 3,
              spaceBetween: 28,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 28,
            },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          spaceBetween={28}
          slidesPerView={4}
          navigation={false}
          pagination={true}
          history={{
            key: "slide",
          }}
          modules={[Autoplay, Navigation, Pagination]}
          className={cn(
            "w-full flex items-center justify-between  border border-gray-100 p-[16px]"
          )}
        >
          <SwiperSlide className="relative py-10">
            <div className="flex items-center gap-4  lg:after:h-10  lg:after:w-[2px] after:translate-x-14 after:bg-neutral-200 ">
              <Package className="text-gray-900 h-10 w-10" />
              <div className="flex-col gap-4">
                <h6 className="uppercase text-label3 text-black">
                <FormattedMessage id={`home.main.fasted-delivery`} />
                </h6>
                <span className="text-body-sm-400 text-gray-600">
                <FormattedMessage id={`home.main.delivery-in-24`} />
                </span>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="py-10">
            <div className="flex items-center gap-4 lg:after:h-10  after:w-[2px] after:translate-x-14 after:bg-neutral-200 ">
              <Trophy className="text-gray-900 h-10 w-10" />
              <div className="flex-col gap-4">
                <h6 className="uppercase text-label3 text-black">
                <FormattedMessage id={`home.main.24-hours-return`} />
                </h6>
                <span className="text-body-sm-400 text-gray-600">
                <FormattedMessage id={`home.main.100-money-back`} />
                </span>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="py-10">
            <div className="flex items-center gap-4 lg:after:h-10  after:w-[2px] after:translate-x-14 after:bg-neutral-200 ">
              <CreditCard className="text-gray-900 h-10 w-10" />
              <div className="flex-col gap-4">
                <h6 className="uppercase text-label3 text-black">
                <FormattedMessage id={`home.main.secure-payment`} />
                </h6>
                <span className="text-body-sm-400 text-gray-600">
                <FormattedMessage id={`home.main.your-money-is-safe`} />
                </span>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="py-10">
            <div className="flex items-center gap-4 ">
              <Headphones className="text-gray-900 h-10 w-10" />
              <div className="flex-col gap-4">
                <h6 className="uppercase text-label3 text-black">
                <FormattedMessage id={`home.main.support-24`} />
                </h6>
                <span className="text-body-sm-400 text-gray-600">
                <FormattedMessage id={`home.main.live-contact`} />
                </span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </Container>
    </section>
  );
}
