import Container from "@/components/custom/Container";
import Row from "@/components/custom/Row";
import { cn } from "@/lib/utils";
import React from "react";

export default function Ad({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-pink-700 to-secondary-500 h-[31.5px]",
        className
      )}
    >
      <Container>
        <Row className="justify-center">
          <p className="text-white text-base tracking-wider font-normal">
            Introducing <strong className="">E-City
              </strong> - Full Multi-vendor
            online store for selling everything with integrated payments -
            order tracking etc...
          </p>
        </Row>
      </Container>
    </div>
  );
}
