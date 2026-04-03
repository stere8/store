"use client";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { People } from "@/types";
import React from "react";

export function PeopleJoined({data}: { data: People[]}) {
  return (
    <div className="flex flex-row items-end justify-center mb-10 w-full h-full">
      <AnimatedTooltip items={data} />
    </div>
  );
}
