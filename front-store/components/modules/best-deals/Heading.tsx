import BrowserLink from "@/components/custom/BrowserLink";
import Countdown from "@/components/custom/Countdown";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function Heading() {
  return (
    <div className="flex flex-wrap gap-4 w-full justify-between mb-6">
      <div className="inline-flex flex-wrap gap-[24px] items-center">
        <h3><FormattedMessage id={`home.main.best-deals`} /></h3>
        <div className="flex gap-6 items-center">
          <span className="text-body-sm-400">
          <FormattedMessage id={`home.main.deals-end-in`} /></span>
          <Countdown
            className="py-[6px] px-[12px] bg-warning-300 text-black text-body-md-400"
            endDate="Dec 31, 2025 23:59:00"
          />
        </div>
      </div>
      <BrowserLink
        link="/products"
        name="browser-all-products"
        className="text-secondary-500 "
      />
    </div>
  );
}
