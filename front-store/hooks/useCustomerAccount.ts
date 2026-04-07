"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/epoc-api";
import { upsertCustomerFromUser } from "@/lib/customer-auth";

export type CustomerAccount = {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  preferredLanguage?: string | null;
  isArchived?: boolean;
  archivedAt?: string | null;
  archivedReason?: string | null;
};

export type CustomerReservationProduct = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

export type CustomerReservationItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: CustomerReservationProduct | null;
};

export type CustomerReservationVendor = {
  id: string;
  displayName?: string | null;
};

export type CustomerReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Rejected"
  | string;

export type CustomerReservation = {
  id: string;
  reservationNumber: string;
  pickupCode: string;
  status: CustomerReservationStatus;
  totalAmount: number;
  customerNotes?: string | null;
  vendorNotes?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  vendor?: CustomerReservationVendor | null;
  customer?: CustomerAccount | null;
  items: CustomerReservationItem[];
};

export const isActiveReservation = (
  reservation: Pick<CustomerReservation, "status">
) => reservation.status === "Pending" || reservation.status === "Confirmed";

export const getReservationItemCount = (reservation: CustomerReservation) =>
  reservation.items.reduce((total, item) => total + item.quantity, 0);

export const formatReservationDate = (
  value?: string | null,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
};

export function useCustomerAccount() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userSyncKey = user
    ? [
        user.id,
        user.fullName ?? "",
        user.firstName ?? "",
        user.lastName ?? "",
        user.primaryEmailAddress?.emailAddress ?? "",
        user.primaryPhoneNumber?.phoneNumber ?? "",
      ].join("|")
    : "";

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      setCustomer(null);
      setReservations([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCustomerAccount = async () => {
      setLoading(true);
      setError(null);

      try {
        const syncedCustomer = (await upsertCustomerFromUser(
          user
        )) as CustomerAccount | null;

        if (!syncedCustomer?.id) {
          throw new Error("Customer profile sync failed.");
        }

        const response = await apiClient.get<CustomerReservation[]>(
          `/api/reservations/customer/${syncedCustomer.id}`
        );

        if (cancelled) {
          return;
        }

        setCustomer(syncedCustomer);
        setReservations(Array.isArray(response.data) ? response.data : []);
      } catch (accountError) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load customer account", accountError);
        setCustomer(null);
        setReservations([]);
        setError(
          "We could not load your customer profile and reservation history."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCustomerAccount();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user, userSyncKey]);

  return {
    customer,
    reservations,
    loading,
    error,
    isLoaded,
    isSignedIn,
    user,
  };
}
