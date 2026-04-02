"use client";
import React from "react";
import axios from "axios";
import useSWR, { Fetcher } from "swr";
import Loading from "@/components/custom/Loading";
import { useAuth } from "@clerk/nextjs";
import LeftSidebar from "../LeftSidebar";
import Container from "@/components/custom/Container";
import { TypeOrderItemModel, TypeOrderModel } from "@/types/models";
import { Card } from "@/components/ui/card";
import { getDate } from "@/lib/utils";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import OrderItem from "./OrderItem";

export default function Order({ _id }: { _id: string }) {
  // fecthing client
  const { getToken } = useAuth();
  const fetcher: Fetcher<TypeOrderModel, string> = async (url: string) => {
    const token = await getToken();
    return await axios
      .get(url, {
        params: { _id: _id },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const { data, isLoading } = useSWR<TypeOrderModel>(
    process.env.NEXT_PUBLIC_API_URL + "/api/user/orders",
    fetcher
  );

  return (
    <section className="py-10">
      {isLoading && <Loading loading={true} />}
      <Container>
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-8 ">
            <LeftSidebar />
            <div className="col-span-3">
              <Card className="flex  flex-col gap-4 rounded-none p-4">
                <div className="flex justify-between bg-warning-50 items-center px-[24px]">
                  <div className="flex flex-col py-8 px-2 w-full">
                    <span className="text-body-xl-400">#{data._id}</span>
                    <p className="text-gray-700 text-body-sm-400">
                      {data?.orderitems?.length} products - Order placed in{" "}
                      {getDate(data.createdAt)}
                    </p>
                  </div>
                  <CurrencyFormat
                    className="!text-secondary-500 bg-transparent text-heading2"
                    value={data.total}
                  />
                </div>
                <div className="relative overflow-x-auto flex-1 w-full">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 cursor-move">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Product
                        </th>
                        <th
                          scope="col"
                          className="
                         px-6 py-3"
                        >
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Shipping
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Subtotal
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orderitems &&
                        data.orderitems.length > 0 &&
                        data.orderitems.map((item: TypeOrderItemModel) => (
                          <OrderItem item={item} key={item._id} />
                        ))}
                      <tr></tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex">
                  {data.orderitems && data.orderitems.length > 0 && (
                    <div className="flex flex-col space-y-4">
                      <span className="text-body-l-500">Shipping Address</span>
                      <span className="text-body-sm-500">
                        {data.orderitems[0].address.firstName} &nbsp;
                        {data.orderitems[0].address.lastName}
                      </span>
                      <p className="text-body-sm-400 text-gray-600">
                        {data.orderitems[0].address.address}
                      </p>
                      <p className="text-body-sm-400 text-black">
                        <strong>Phone number: </strong>
                        <span>{data.orderitems[0].address.phone}</span>
                      </p>

                      <p className="text-body-sm-400 text-black">
                        <strong>Email: </strong>
                        <span>{data.orderitems[0].address.email}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
