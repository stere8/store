"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { FormattedMessage } from "react-intl";

export default function MainContent() {
  const { user } = useUser();

  return (
    <div className="col-span-3 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-8">
          <UserButton />
          <p className="text-body-xl-600">
            <FormattedMessage
              id="dashboard.greeting"
              defaultMessage="Hello, {name}"
              values={{ name: user?.fullName ?? "there" }}
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
            <FormattedMessage
              id="dashboard.addressInfo"
              defaultMessage="ADDRESS INFO"
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-body-md-400">{user?.fullName}</span>
            </div>

            <div className="flex flex-col gap-2 text-body-sm-400">
              <div className="inline-flex gap-2">
                <strong>Email:</strong>
                <span className="text-gray-600">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-between gap-1">
          <div className="bg-secondary-50 p-4">
            <p className="text-body-xl-600">Reservation checkout</p>
            <p className="mt-2 text-body-sm-400 text-gray-700">
              The storefront now uses cart reservations instead of the older
              paid order flow.
            </p>
          </div>
          <div className="bg-primary-50 p-4">
            <p className="text-body-xl-600">History not linked yet</p>
            <p className="mt-2 text-body-sm-400 text-gray-700">
              Reservation history is not connected to Clerk accounts in the
              current API yet.
            </p>
          </div>
          <div className="bg-success-50 p-4">
            <p className="text-body-xl-600">Keep your pickup details</p>
            <p className="mt-2 text-body-sm-400 text-gray-700">
              Save the reservation number and pickup code shown after reserving
              your cart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
