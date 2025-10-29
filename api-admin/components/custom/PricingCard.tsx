"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { FaCheckCircle } from "react-icons/fa";
import { TypeSubscriptionModel } from "@/types/models";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CheckoutFormData } from "@/types/forms";
import { toast } from "@/hooks/use-toast";
import getStripe from "@/lib/get-stripejs";
import { useAuth } from "@clerk/nextjs";
import useSWRMutation from "swr/mutation";
import Loading from "./Loading";
import { TypeSubscriptionPlan } from "@/types";

type Props = {
  data: TypeSubscriptionPlan;
};

export default function PricingCard({ data }: Props) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<TypeSubscriptionModel>();
  const { userId, getToken } = useAuth();

  useEffect(() => {
    const getData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const token = await getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/subscriptions`,
          {
            params: {
              user_id: userId,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubscription(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [userId]);

  async function postRequest(
    url: string,
    { arg }: { arg: CheckoutFormData }
  ) {
    try {
      const token = await getToken();
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + url,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        variant: "default",
        title: "Success ✔️",
        description: response.data.message,
      });

      const stripe = await getStripe();
      await stripe!.redirectToCheckout({
        sessionId: response.data.id,
      });
    } catch (err: any) {
      console.error(err.message);
    }
  }

  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    "/api/user/subscriptions",
    postRequest
  );

  const handleClick = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (
      subscription?.type === data.type &&
      subscription.status === "active"
    ) {
      toast({
        variant: "default",
        title: "Already subscribed",
        description: "You have an active subscription",
      });
      return;
    }

    const payload: CheckoutFormData = {
      user_id: userId,
      amount: data.price,
    };

    await create(payload);
  };

  return (
    <>
      {isLoading && <Loading loading={true} />}
      <div className="w-full min-w-[360px] bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700 p-4 flex flex-col gap-8">
        <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">
          {data.type}
        </h5>

        <div className="flex items-baseline text-gray-900 dark:text-white">
          <span className="text-3xl font-semibold">RWF</span>
          <span className="text-5xl font-extrabold tracking-tight">
            {data.price}
          </span>
          <span className="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">
            /{data.period}
          </span>
        </div>

        <ul role="list" className="space-y-5 my-7">
          {data.roles.map((item, idx) => (
            <li
              key={idx}
              className={cn(
                "flex items-center",
                item.active ? "" : "line-through decoration-gray-500"
              )}
            >
              <FaCheckCircle
                className={cn(
                  "flex-shrink-0 w-4 h-4",
                  item.active
                    ? "text-blue-700 dark:text-white"
                    : "text-gray-500 dark:text-gray-500"
                )}
              />
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
                {item.title}
              </span>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="default"
          className={cn(
            "capitalize w-full",
            subscription?.type === data.type &&
              "bg-white text-black border border-border hover:text-white"
          )}
          disabled={
            isCreating || isLoading || subscription?.type === data.type
          }
          onClick={handleClick}
        >
          {subscription?.type === data.type ? "Current plan" : "Buy now"}
        </Button>
      </div>
    </>
  );
}
