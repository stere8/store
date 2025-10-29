"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/custom/Loading";
import Container from "@/components/custom/Container";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { FormattedMessage } from "react-intl";

export default function PaymentCompleted() {
  const router = useSearchParams();
  const routerPath = useRouter();
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const getData = async () => {
      const token = await getToken();
      setLoading(true);
      await axios
        .get(
          process.env.NEXT_PUBLIC_API_URL +
            "/api/user/payments?session_id=" +
            router.get("session_id"),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (router.get("session_id")) getData();
  }, [router, getToken]);

  return (
    <section className="py-20">
      {loading && <Loading loading={true} />}
      <Container>
        <div className="flex flex-col gap-8 items-center">
          <Button
            className="h-[66px] w-[66px] rounded-full border-2 border-success-500 bg-success-100"
            size="sm"
          >
            <Check className="text-success-500" />
          </Button>

          <h3>
            <FormattedMessage
              id="payment.success.title"
              defaultMessage="Your order is successfully paid"
            />
          </h3>

          <p className="text-body-sm-400 text-center max-w-md">
            <FormattedMessage
              id="payment.success.description"
              defaultMessage="Your order has been paid successfully. Go to your dashboard to track orders."
            />
          </p>

          <div className="flex gap-4">
            <RectangleButton
              icon="none"
              variant="primary-outline"
              onClick={() => routerPath.push("/customer/dashboard")}
            >
              <FormattedMessage
                id="payment.success.go-to-dashboard"
                defaultMessage="Go to dashboard"
              />
            </RectangleButton>

            <RectangleButton
              onClick={() => routerPath.push("/customer/orders")}
              variant="primary"
              icon="after"
            >
              <FormattedMessage
                id="payment.success.view-orders"
                defaultMessage="View orders"
              />
            </RectangleButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
