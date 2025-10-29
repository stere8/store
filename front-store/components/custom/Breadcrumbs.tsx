"use client";
import { TypeProductModel, TypeSubCategoryModel } from "@/types/models";
import React, { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import Container from "./Container";
import { FormattedMessage } from "react-intl";
//import { Client } from "@clerk/nextjs/server";
export default function Breadcrumbs({
  product,
  page,
}: {
  product?: TypeProductModel;
  page?: string;
}) {
  return (


<section className="bg-gray-50  h-[60px] lg:h-[72px] ">
  <Container>
    <Breadcrumb className="h-full">
      <BreadcrumbList className="capitalize text-body-sm-400 h-full flex items-center flex-wrap text-gray-500">
        <Link href="/" className="hover:text-primary-500">
          <FormattedMessage id="breadcrumb.home" defaultMessage="Home" />
        </Link>
        <BreadcrumbSeparator />

        {product && (
          <>
            <BreadcrumbItem>
              <Link href="/products" className="hover:text-primary-500">
                <FormattedMessage id="breadcrumb.store" defaultMessage="Store" />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <Link
              className="hover:text-primary-500 text-body-sm-400"
              href={`/categories/${product.category?.slug}/products`}
            >
              {product.category?.name}
            </Link>
            <BreadcrumbSeparator className="hidden xl:block" />

            <span className="hidden xl:block">
              {product.subCategories.map(
                (item: TypeSubCategoryModel, idx: number) => (
                  <Fragment key={idx}>
                    <ul>
                      <li>
                        <Link className="hover:text-primary-500" href="#">
                          {item.name.substring(0, 100)}
                        </Link>
                      </li>
                    </ul>
                  </Fragment>
                )
              )}
            </span>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="hidden lg:block text-xs text-secondary-700">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {page && (
          <>
            <BreadcrumbItem>
              <Link href="#">
                <FormattedMessage id="breadcrumb.pages" defaultMessage="Pages" />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href="#" className="text-secondary-500 font-bold">
                {page}
              </Link>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  </Container>
</section>

  );
}
