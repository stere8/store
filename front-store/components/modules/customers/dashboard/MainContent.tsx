"use client";

import Link from "next/link";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatReservationDate,
  isActiveReservation,
  useCustomerAccount,
} from "@/hooks/useCustomerAccount";
import { buildAuthRedirectUrl } from "@/lib/customer-auth";
import AccountState from "../AccountState";
import ReservationHistoryTable from "../ReservationHistoryTable";

export default function MainContent() {
  const pathname = usePathname();
  const { customer, reservations, loading, error, isLoaded, isSignedIn, user } =
    useCustomerAccount();

  const activeReservations = reservations.filter(isActiveReservation);
  const completedReservations = reservations.filter(
    (reservation) => reservation.status === "Completed"
  );
  const closedReservations = reservations.filter((reservation) =>
    ["Cancelled", "Rejected"].includes(reservation.status)
  );
  const totalReservedValue = reservations.reduce(
    (total, reservation) => total + reservation.totalAmount,
    0
  );
  const lastReservationLabel = reservations[0]?.createdAt
    ? formatReservationDate(reservations[0].createdAt, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No reservations yet";

  if (!isLoaded || loading) {
    return (
      <div className="col-span-3">
        <AccountState
          title="Loading your account"
          description="We are syncing your customer profile and pulling your latest reservation history."
        />
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="col-span-3">
        <AccountState
          title="Sign in to view your profile"
          description="Your customer details, active pickups, and reservation history appear here once you sign in."
          primaryAction={{
            href: buildAuthRedirectUrl("/sign-in", pathname),
            label: "Sign in",
          }}
          secondaryAction={{
            href: "/products",
            label: "Browse products",
            variant: "secondary",
          }}
        />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="col-span-3">
        <AccountState
          title="Your account could not be loaded"
          description={
            error ||
            "We could not load your customer profile right now. Please try again in a moment."
          }
          primaryAction={{
            href: "/cart",
            label: "Open cart",
          }}
          secondaryAction={{
            href: "/products",
            label: "Browse products",
            variant: "secondary",
          }}
        />
      </div>
    );
  }

  const profileFields = [
    {
      label: "Full name",
      value: customer.fullName || user.fullName || "Not provided",
    },
    {
      label: "Email",
      value:
        customer.email || user.primaryEmailAddress?.emailAddress || "Not provided",
    },
    {
      label: "Phone",
      value: customer.phoneNumber || "Not provided",
    },
    {
      label: "Preferred language",
      value: customer.preferredLanguage?.toUpperCase() || "EN",
    },
  ];

  const stats = [
    {
      label: "Total reservations",
      value: reservations.length,
      tone: "bg-slate-50 text-slate-900",
    },
    {
      label: "Active pickups",
      value: activeReservations.length,
      tone: "bg-amber-50 text-amber-900",
    },
    {
      label: "Completed pickups",
      value: completedReservations.length,
      tone: "bg-emerald-50 text-emerald-900",
    },
    {
      label: "Closed requests",
      value: closedReservations.length,
      tone: "bg-rose-50 text-rose-900",
    },
  ];

  return (
    <div className="col-span-3 space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-500">
            Customer profile
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Hello, {customer.fullName || user.fullName || "there"}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Review your account details, keep track of active pickups, and open
            any reservation you have made from this account.
          </p>
        </div>
        <UserButton />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Profile details</CardTitle>
            <CardDescription>
              These details are synced to the customer record used during
              reservation checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {field.label}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {field.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Account summary</CardTitle>
            <CardDescription>
              Quick access to the reservation activity tied to this profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                Last reservation
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {lastReservationLabel}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Active pickups
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {activeReservations.length}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Reserved value
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                RWF {totalReservedValue.toLocaleString("en-US")}
              </p>
            </div>

            <Link
              href="/customer/orders"
              className="inline-flex text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline"
            >
              View full reservation history
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-gray-100 p-5 shadow-sm ${stat.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Recent reservations</CardTitle>
            <CardDescription>
              Your latest reservation requests and pickup details.
            </CardDescription>
          </div>
          <Link
            href="/customer/orders"
            className="text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline"
          >
            See all
          </Link>
        </CardHeader>
        <CardContent>
          <ReservationHistoryTable
            reservations={reservations}
            limit={4}
            emptyTitle="No reservation history yet"
            emptyDescription="Reserve a cart to keep pickup codes and past reservation activity under your profile."
          />
        </CardContent>
      </Card>
    </div>
  );
}
