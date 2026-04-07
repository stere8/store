"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/custom/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildAuthRedirectUrl } from "@/lib/customer-auth";
import {
  formatReservationDate,
  isActiveReservation,
  useCustomerAccount,
} from "@/hooks/useCustomerAccount";
import LeftSidebar from "../LeftSidebar";
import AccountState from "../AccountState";
import ReservationHistoryTable from "../ReservationHistoryTable";

export default function Orders() {
  const pathname = usePathname();
  const { customer, reservations, loading, error, isLoaded, isSignedIn, user } =
    useCustomerAccount();

  const activeReservations = reservations.filter(isActiveReservation);
  const completedReservations = reservations.filter(
    (reservation) => reservation.status === "Completed"
  );
  const totalReservedValue = reservations.reduce(
    (total, reservation) => total + reservation.totalAmount,
    0
  );
  const lastReservation = reservations[0]?.createdAt
    ? formatReservationDate(reservations[0].createdAt, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No reservations yet";

  return (
    <section className="py-10">
      <Container>
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-4 lg:gap-8">
          <LeftSidebar />
          <div className="col-span-3 space-y-6">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-500">
                Reservation history
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                View past reservations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Track active pickups, revisit previous reservations, and open
                the full pickup details for anything reserved with your customer
                account.
              </p>
            </div>

            {!isLoaded || loading ? (
              <AccountState
                title="Loading your reservations"
                description="We are syncing your customer profile and pulling your latest reservation history."
              />
            ) : !isSignedIn || !user ? (
              <AccountState
                title="Sign in to see your reservations"
                description="Your reservation history is attached to your customer profile and only appears once you sign in."
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
            ) : error || !customer ? (
              <AccountState
                title="Your reservation history could not be loaded"
                description={
                  error ||
                  "We could not load your reservations right now. Please try again in a moment."
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
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-gray-100 bg-slate-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Total reservations
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                      {reservations.length}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-amber-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Active pickups
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                      {activeReservations.length}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-emerald-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Completed pickups
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                      {completedReservations.length}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-primary-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                      Last reservation
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">
                      {lastReservation}
                    </p>
                  </div>
                </div>

                {activeReservations.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    You currently have {activeReservations.length} active pickup
                    {activeReservations.length === 1 ? "" : "s"}. Open a
                    reservation to review the pickup code before collection.
                  </div>
                )}

                <Card className="border-gray-100 shadow-sm">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        All reservations
                      </CardTitle>
                      <CardDescription>
                        Reservations linked to {customer.fullName}.
                      </CardDescription>
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      RWF {totalReservedValue.toLocaleString("en-US")} reserved
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ReservationHistoryTable
                      reservations={reservations}
                      emptyTitle="No reservations found"
                      emptyDescription="Reserve a cart and your pickup history will start building here."
                    />
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="rounded-full border border-primary-500 px-6 py-3 text-sm font-medium text-primary-500 transition hover:bg-primary-50"
                  >
                    Browse products
                  </Link>
                  <Link
                    href="/cart"
                    className="rounded-full bg-primary-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-600"
                  >
                    Open cart
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
