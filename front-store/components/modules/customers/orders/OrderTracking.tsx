"use client";
import React, { useState } from "react";
import axios from "axios";
import useSWR, { Fetcher } from "swr";
import Loading from "@/components/custom/Loading";
import { useAuth } from "@clerk/nextjs";
import LeftSidebar from "../LeftSidebar";
import Container from "@/components/custom/Container";
import { TypeTrackOrderModel } from "@/types/models";
import { Card } from "@/components/ui/card";
import { cn, discountPrice, getDate } from "@/lib/utils";
import OrderItem from "./OrderItem";
import { addDays } from "date-fns";
import {
  Book,
  Check,
  Handshake,
  Loader2Icon,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { RectangleButton } from "@/components/custom/RectangleButton";
// import getStripe from "@/lib/get-stripejs";

export default function OrderTracking({ _id }: { _id: string }) {
  // fecthing client
  const { getToken } = useAuth();
  const fetcher: Fetcher<TypeTrackOrderModel, string> = async (url: string) => {
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

  const { data, isLoading } = useSWR<TypeTrackOrderModel>(
    process.env.NEXT_PUBLIC_API_URL + "/api/user/trackorders",
    fetcher
  );

  const earning =
    data && data.orderitem.cartItem.variant.discount
      ? discountPrice(
          data.orderitem.cartItem.variant.price,
          data.orderitem.cartItem.variant.discount
        ) *
          data?.orderitem.cartItem.qty +
        data.orderitem.shippingAmount
      : data?.orderitem &&
        data.orderitem.cartItem.variant.price * data.orderitem.cartItem.qty +
          data.orderitem.shippingAmount;

  const [loading, setLoading] = useState(false);
  const handleConfirmOrder = async (values: TypeTrackOrderModel) => {

    
    //TOD0: check if order is paid ? then : redirect to checkout
    // if(values.orderitem.paidAmount === 0){
    //     toast({
    //         variant: "default",
    //         title: "Info!",
    //         description: "You need to pay first!",
    //       });
  
    //       const stripe = await getStripe();
    //       await stripe!.redirectToCheckout({
    //         // Make the id field from the Checkout Session creation API response
    //         // available to this file, so you can provide it as parameter here
    //         // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
    //         sessionId: data.id,
    //       });
    //     return;
    // }


    const token = await getToken();
    setLoading(true);
    const data = {
      delivered: true,
      status: "completed",
      earning: earning,
    };

    await axios
      .put(process.env.NEXT_PUBLIC_API_URL + "/api/user/orderitems", data, {
        params: { _id: values.orderitem._id },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        const data = response.data;
        toast({
          variant: "default",
          title: "Well done!",
          description: data.message,
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section className="py-10">
      {isLoading && <Loading loading={true} />}
      <Container>
        {data && data.orderitem && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-8">
            <LeftSidebar />
            <div className="col-span-3">
              <Card className="flex  flex-col gap-4 rounded-none p-4">
                <div className="flex flex-wrap lg:flex-nowrap justify-between bg-warning-50 items-center px-[24px] py-2">
                  <div className="flex flex-col py-8 px-2 w-full">
                    <span className="text-body-xl-400">#{data._id}</span>
                    <p className="text-gray-700 text-body-sm-400">
                      1 products - Order placed in {getDate(data.createdAt)}
                    </p>
                  </div>

                  <RectangleButton
                    disabled={loading || data.orderitem.delivered}
                    variant="danger"
                    icon="none"
                    onClick={() => handleConfirmOrder(data)}
                  >
                    <Loader2Icon
                      className={cn(
                        "hidden mr-2 h-6 w-6 animate-spin ",
                        loading && "block"
                      )}
                    />
                    Confirm delivery
                  </RectangleButton>
                  {/* <CurrencyFormat
                    className="!text-secondary-500 bg-transparent text-heading2"
                    value={data.orderitem && data.orderitem.total}
                  /> */}
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
                        </th>{" "}
                        <th scope="col" className="px-6 py-3">
                          Subtotal
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <OrderItem
                        item={data.orderitem}
                        key={data.orderitem._id}
                      />
                      <tr></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="flex flex-col space-y-4">
                    <span className="text-body-l-500">Shipping Address</span>
                    <span className="text-body-sm-500">
                      {data.orderitem.address.firstName +
                        " " +
                        data.orderitem.address.lastName}
                    </span>
                    <p className="text-body-sm-400 text-gray-600">
                      {data.orderitem.address.address}
                    </p>
                    <p className="text-body-sm-400 text-black">
                      <strong>Phone number: </strong>
                      <span>{data.orderitem.address.phone}</span>
                    </p>

                    <p className="text-body-sm-400 text-black">
                      <strong>Email: </strong>
                      <span>{data.orderitem.address.email}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-body-l-500">Shipping date</span>
                    <p className="text-body-sm-400">
                      Order expected arrival on &nbsp;
                      {data.orderitem.createdAt && (
                        <span className="text-primary-500 underline">
                          {addDays(
                            new Date(data.orderitem.createdAt),
                            data.orderitem.shipping.delay
                          ).toString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <hr />
                <div className="flex my-10">
                  <div className="rounded-none">
                    <h3 className="">Seller info</h3>
                    <div className="flex flex-col gap-4 py-4 h-full">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={data.orderitem.store.logo}
                            alt="logo name"
                          />
                        </Avatar>

                        <div className="flex flex-col gap-1">
                          <span className="text-body-md-400">
                            {data.orderitem.store.name}
                          </span>
                          <span className="text-body-sm-400 text-gray-600">
                            {data.orderitem.store.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-body-sm-400">
                        <div className="inline-flex gap-2">
                          <strong>Created At: </strong>{" "}
                          <span className="text-gray-600">
                            {getDate(data.orderitem.store.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <div>
                  <h3 className="mb-8  mt-4">Delivery process</h3>
                  <ol className="flex items-center w-full ms-4">
                    <li className="flex w-full items-center text-white-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-primary-500 after:border-4 after:inline-block ">
                      <Button
                        variant="primary-outline"
                        size="rounded"
                        className={cn(
                          "h-[50px] w-[60px]",
                          data.status === "opened" &&
                            "open" &&
                            "bg-primary-500 [&>svg]:text-white"
                        )}
                      >
                        <Check />
                      </Button>
                    </li>
                    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block">
                      <Button
                        variant="primary-outline"
                        size="rounded"
                        className={cn(
                          "h-[50px] w-[60px]",
                          data.status === "packaging" &&
                            "open" &&
                            "bg-primary-500 [&>svg]:text-white"
                        )}
                      >
                        <Package />
                      </Button>
                    </li>
                    <li className="flex w-full h-10 items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block">
                      <Button
                        variant="primary-outline"
                        size="rounded"
                        className={cn(
                          "h-[50px] w-[60px]",
                          data.status === "onroad" &&
                            "open" &&
                            "bg-primary-500 [&>svg]:text-white"
                        )}
                      >
                        <Truck />
                      </Button>
                    </li>
                    <li className="flex items-center w-full">
                      <Button
                        variant="primary-outline"
                        size="rounded"
                        className={cn(
                          "h-[50px] w-[50px]",
                          data.status === "delivered" &&
                            "open" &&
                            "bg-primary-500 [&>svg]:text-white"
                        )}
                      >
                        <Handshake />
                      </Button>
                    </li>
                  </ol>

                  <ul className="mt-8  hidden lg:flex flex-row gap-[160px]">
                    <li>
                      <div className="flex flex-col gap-1 items-center">
                        <Book
                          className={cn(
                            "text-primary-500",
                            data.status == "opened" && "text-success-500"
                          )}
                        />
                        <span className="text-body-sm-500">Order placed</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex flex-col gap-1 items-center">
                        <Package
                          className={cn(
                            "text-primary-500",
                            data.status == "packaging" && "text-success-500"
                          )}
                        />
                        <span className="text-body-sm-500">Packaging</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex flex-col gap-1 items-center">
                        <Truck
                          className={cn(
                            "text-primary-500",
                            data.status == "onroad" && "text-success-500"
                          )}
                        />
                        <span className="text-body-sm-500">On the road</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex flex-col gap-1 items-center">
                        <Handshake
                          className={cn(
                            "text-primary-500",
                            data.status == "delivered" && "text-success-500"
                          )}
                        />
                        <span className="text-body-sm-500">Delivered</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <hr />
                <div className="flex flex-col gap-4 my-4">
                  <h3>Tracking activity</h3>
                  <div className="flex flex-col gap-4">
                    {data.trackactivity &&
                      data.trackactivity.map(() => (
                        <div
                          key="1"
                          className="flex items-center gap-4 bg-secondary-50 p-4"
                        >
                          <span className="h-12 w-12 bg-white grid place-content-center">
                            <Check size={30} className="text-secondary-500" />
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-body-xl-600">
                              Your order has been delivered. Thank you for
                              shopping at Clicon!
                            </span>
                            <span className="text-body-sm-400 text-gray-700">
                              23 Jan, 2021 at 7:32 PM
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
