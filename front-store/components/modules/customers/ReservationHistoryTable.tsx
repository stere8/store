"use client";

import Link from "next/link";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CustomerReservation,
  formatReservationDate,
  getReservationItemCount,
} from "@/hooks/useCustomerAccount";
import ReservationStatusBadge from "./ReservationStatusBadge";

type ReservationHistoryTableProps = {
  reservations: CustomerReservation[];
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
};

const getProductSummary = (reservation: CustomerReservation) => {
  const productNames = reservation.items
    .map((item) => item.product?.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (productNames.length === 0) {
    const itemCount = getReservationItemCount(reservation);
    return `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  }

  if (productNames.length === 1) {
    return productNames[0];
  }

  return `${productNames[0]} +${productNames.length - 1} more`;
};

export default function ReservationHistoryTable({
  reservations,
  limit,
  emptyTitle = "No reservations yet",
  emptyDescription = "Once you reserve products for pickup, they will appear here.",
}: ReservationHistoryTableProps) {
  const visibleReservations =
    typeof limit === "number" ? reservations.slice(0, limit) : reservations;

  if (!visibleReservations.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p className="text-base font-semibold text-slate-900">{emptyTitle}</p>
        <p className="mt-2 max-w-2xl leading-6">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-gray-100 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reserved on</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleReservations.map((reservation) => {
              const itemCount = getReservationItemCount(reservation);

              return (
                <TableRow key={reservation.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">
                        {reservation.reservationNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        Pickup code {reservation.pickupCode}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-slate-600">
                    {reservation.vendor?.displayName || "Assigned vendor"}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{getProductSummary(reservation)}</p>
                      <p className="text-xs text-slate-500">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <ReservationStatusBadge status={reservation.status} />
                  </TableCell>
                  <TableCell className="align-top text-slate-600">
                    {formatReservationDate(reservation.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="align-top">
                    <CurrencyFormat value={reservation.totalAmount} />
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Link
                      href={`/reservation/${reservation.id}`}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline"
                    >
                      View details
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {visibleReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">
                  {reservation.reservationNumber}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pickup code {reservation.pickupCode}
                </p>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Vendor: {reservation.vendor?.displayName || "Assigned vendor"}</p>
              <p>{getProductSummary(reservation)}</p>
              <p>
                Reserved on{" "}
                {formatReservationDate(reservation.createdAt, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <CurrencyFormat value={reservation.totalAmount} />
              <Link
                href={`/reservation/${reservation.id}`}
                className="text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
