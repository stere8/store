"use client";

import React, { useEffect, useState } from "react";
import Row from "@/components/custom/Row";
import Loading from "@/components/custom/Loading";
import { Button } from "@/components/ui/button";
import { subscriptionPlan } from "@/constants";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import getStripe from "@/lib/get-stripejs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { Check } from "lucide-react";

import { CheckoutFormData } from "@/types/forms";
import { TypeSubscriptionModel } from "@/types/models";
import { TypeSubscriptionPlan } from "@/types";

export default function Pricing() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<TypeSubscriptionModel>();

  useEffect(() => {
    const getData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/subscriptions?user_id=${userId}`
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
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + url,
        arg
      );

      toast({
        variant: "default",
        title: "OK...✔️",
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

  const onSubmit = async (plan: TypeSubscriptionPlan) => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (subscription?.type === plan.type && subscription.status === "active") {
      toast({
        variant: "default",
        title: "Already subscribed",
        description: "You have an active subscription",
      });
      return;
    }

    const data: CheckoutFormData = {
      user_id: userId,
      amount: plan.price,
    };

    await create(data);
  };

  return (
    <div className="w-full flex flex-col gap-4 justify-center items-center py-10">
      {isLoading && <Loading loading={true} />}

      <h3>Pricing plans</h3>
      <h6 className="text-center max-w-xl">
        From Basic to Enterprise — each plan includes everything before it, plus
        more. Simple pricing, no hidden fees.
      </h6>

      <Row className="flex-wrap lg:flex-nowrap lg:gap-x-4">
        {subscriptionPlan.map((item: TypeSubscriptionPlan, idx: number) => {
          const isCurrent = subscription?.type === item.type;
          const isSpecial = item.type.toLowerCase() === "enterprise"; // Highlight the enterprise plan

          return (
            <div className="flex flex-wrap gap-4 mt-20" key={idx}>
              <div
                className={cn(
                  "flex flex-col gap-8 border p-8 rounded-lg min-w-[360px]",
                  isSpecial
                    ? "bg-[#d4af37e8] text-black dark:bg-gradient-to-br dark:from-gray-300 dark:to-gray-600 dark:text-white"
                    : "border-border"
                )}
              >
                <div className="flex flex-col gap-8 mb-10">
                  <h5 className="capitalize">{item.type}</h5>
                  <p className="text-xl text-heading">{item.description}</p>
                </div>
                <div className="flex items-center gap-8">
                  <h2>RWF{item.price}</h2>
                  <strong>/{item.period}</strong>
                </div>
                <div className="flex flex-col gap-8 mt-8">
                  {item.roles.map((role, idx) => (
                    <div className="flex gap-12" key={idx}>
                      <Check
                        className={cn(
                          "",
                          role.active
                            ? "text-black dark:text-white"
                            : "text-gray-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xl",
                          !role.active && "line-through text-heading"
                        )}
                      >
                        {role.title}
                      </span>
                    </div>
                  ))}
                  <div className="mt-auto">
                    <Button
                      type="button"
                      variant="default"
                      className={cn(
                        "capitalize w-full",
                        isCurrent &&
                          "bg-white text-black border border-border hover:text-white"
                      )}
                      disabled={isCreating || isLoading || isCurrent}
                      onClick={() => onSubmit(item)}
                    >
                      {isCurrent ? "Current plan" : "Buy now"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Row>
    </div>
  );
}
