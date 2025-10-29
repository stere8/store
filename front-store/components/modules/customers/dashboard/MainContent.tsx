"use client";
import { PiReceiptFill } from "react-icons/pi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { MdOutlineRocket } from "react-icons/md";
import { useAuth, UserButton, useUser } from "@clerk/nextjs";
import axios from "axios";
import useSWR, { Fetcher } from "swr";
import { TypeOrderModel } from "@/types/models";
import Loading from "@/components/custom/Loading";
import { FormattedMessage } from "react-intl";
export default function MainContent() {
  const { user } = useUser();
  // fecthing client
  const { getToken, userId } = useAuth();
  const fetcher: Fetcher<TypeOrderModel[], string> = async (url: string) => {
    const token = await getToken();
    return await axios
      .get(url, {
        params: { user_id: userId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const { data, isLoading } = useSWR<TypeOrderModel[]>(
    process.env.NEXT_PUBLIC_API_URL + "/api/user/orders",
    fetcher
  );

  return (
    <div className="col-span-3 space-y-4">
      {isLoading && <Loading loading={true} />}
      <div className="flex flex-col gap-4">
        <div className="flex gap-8">
          <UserButton />
          <p className="text-body-xl-600">
           <FormattedMessage
               id="dashboard.greeting"
               defaultMessage="Hello, {name}"
               values={{ name: user?.lastName + " " + user?.firstName }}
           />
          </p>
        </div>
        <p className="text-body-sm-500 max-w-lg text-gray-700">
         <FormattedMessage
            id="dashboard.description"
            defaultMessage="From your account dashboard, you can easily check & view your recent orders, manage your shipping and billing addresses, and edit your password and account details."
          />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-none col-span-2">
          <CardHeader className="border border-gray-100 py-2 text-label3">
            <FormattedMessage id="dashboard.addressInfo" defaultMessage="ADDRESS INFO" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-body-md-400">{user?.fullName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-body-sm-400">
              <div className="inline-flex gap-2">
                <strong>Email: </strong>
                <span className="text-gray-600">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-between gap-1">
          <div className="flex items-center gap-4 bg-secondary-50 p-4">
            <span className="h-12 w-12 bg-white grid place-content-center">
              <MdOutlineRocket size={30} className="text-secondary-500" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-body-xl-600">{data?.length}</span>
              <span className="text-body-sm-400 text-gray-700">
                 <FormattedMessage id="dashboard.totalOrders" defaultMessage="Total orders" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-primary-50 p-4">
            <span className="h-12 w-12 bg-white grid place-content-center">
              <PiReceiptFill size={30} className="text-primary-500" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-body-xl-600">
                {data &&
                  data.filter((item) => item.status === "pending").length}
              </span>
              <span className="text-body-sm-400 text-gray-700">
                <FormattedMessage id="dashboard.pendingOrders" defaultMessage="Pending orders" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-success-50 p-4">
            <span className="h-12 w-12 bg-white grid place-content-center">
              <MdOutlineRocket size={30} className="text-success-500" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-body-xl-600">
                {data?.filter((item) => item.status === "completed").length}
              </span>
              <span className="text-body-sm-400 text-gray-700">
                <FormattedMessage id="dashboard.completedOrders" defaultMessage="Completed orders" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
