import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { LocaleLink } from "@/components/custom/LocaleLink";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function BrowserLink({
  name,
  className,
  link,
}: {
  name: string;
  className?: string;
  link: string;
}) {
  return (
    <LocaleLink
      href={link}
      className={cn(
        "inline-flex items-center capitalize gap-2 justify-between cursor-pointer",
        className
      )}
    >
      <span className="text-body-sm-600">
      <FormattedMessage id={`home.main.${name}`} />

      </span>
      <ArrowRight size={20} />
    </LocaleLink>
  );
}
