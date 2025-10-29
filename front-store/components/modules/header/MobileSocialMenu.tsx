import { cn } from "@/lib/utils";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Globe } from "lucide-react";
import SocialIcons from "./SocialIcons";
import LanguageCurrency from "./LanguageCurrency";

export default function MobileSocialMenu({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      <Sheet>
        <SheetTrigger className="ms-auto">
          <Globe />
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="">
            <SheetTitle className="text-center">Socials/Languages/Currencies</SheetTitle>
            <SheetDescription className="">
              <LanguageCurrency className="w-[180px] mr-4 my-8" />
              <SocialIcons />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
