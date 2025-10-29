'use client';
import React from "react";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Container from "@/components/custom/Container";
import { FormattedMessage } from "react-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

//export const revalidate=3600; // 1 hour cache this page will not be revalidated until app is rebuilt currently not working 
export default function Page() {
  return (
    <>
      <Breadcrumbs page="need help" />
      <section className="py-10">
        <Container>
          <div className="flex flex-col gap-4">
            <h1>
              <FormattedMessage id="need-help.frequently-asked-question-title" />
            </h1>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.What-is-multi-vendor-in-ecommerce-?" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.What-is-multi-vendor-in-ecommerce-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.How-can-I-sell-on-the-Marketplace?" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.How-can-I-sell-on-the-Marketplace-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.Is-there-any-fees-for-sellers-title" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.Is-there-any-fees-for-sellers-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.How-about-shipping-title" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.How-about-shipping-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.How-about-earning-title" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.How-about-earning-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.How-about-withdrawal-title" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.How-about-withdrawal-desc" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>
                  <FormattedMessage id="need-help.Join-customer-support-title" />
                </AccordionTrigger>
                <AccordionContent>
                  <FormattedMessage id="need-help.Join-customer-support-desc" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </section>
    </>
  );
}