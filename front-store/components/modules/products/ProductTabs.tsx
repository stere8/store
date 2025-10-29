"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypeProductModel } from "@/types/models";
import React from "react";
import Review from "../reviews";
import parse from "html-react-parser";
import { FormattedMessage } from "react-intl";

export function ProductTabs({
  className,
  product,
}: {
  className?: string;
  product: TypeProductModel;
}) {
  return (
    <section className="my-20">
      <Tabs defaultValue="descriptions" className={className}>
        <TabsList className="flex w-full overflow-auto lg:overflow-hidden bg-transparent">
          <TabsTrigger
            className="w-fit lg:w-60 data-[state=active]:border-b-4 data-[state=active]:border-primary-500"
            value="descriptions"
          >
            <FormattedMessage id="tabs.description" defaultMessage="Description" />
          </TabsTrigger>
          <TabsTrigger
            className="w-full lg:w-60 data-[state=active]:border-b-4 data-[state=active]:border-primary-500"
            value="additionals"
          >
            <FormattedMessage id="tabs.additional" defaultMessage="Additional Information" />
          </TabsTrigger>
          <TabsTrigger
            className="w-full lg:w-60 data-[state=active]:border-b-4 data-[state=active]:border-primary-500"
            value="specifications"
          >
            <FormattedMessage id="tabs.specification" defaultMessage="Specification" />
          </TabsTrigger>
          <TabsTrigger
            className="w-fit lg:w-60 data-[state=active]:border-b-4 data-[state=active]:border-primary-500"
            value="reviews"
          >
            <FormattedMessage id="tabs.review" defaultMessage="Review" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="descriptions" className="mt-0">
          <Card className="rounded-none">
            <CardContent className="p-8 text-pretty leading-10">
              {parse(product.description)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="additionals" className="mt-0">
          <Card className="rounded-none">
            <CardContent className="p-8 text-pretty leading-10">
              {parse(product.additionnal)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications" className="mt-0">
          <Card className="rounded-none">
            <CardContent className="p-8 text-pretty leading-10">
              {parse(product.specification)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          <Card className="rounded-none">
            <CardContent className="p-8">
              <Review product={product} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}