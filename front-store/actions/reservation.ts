"use server";

import { apiClient } from "@/lib/epoc-api";

type ReservationItemInput = {
  productId: string;
  quantity: number;
};

type ReservationInput = {
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerNote?: string | null;
  preferredLanguage?: string | null;
  items: ReservationItemInput[];
};

export const createReservation = async (reservationData: ReservationInput) => {
  try {
    const response = await apiClient.post("/api/reservations", reservationData);
    return response.data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    return { id: "", status: "failed" };
  }
};

export const getReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.get(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return {};
  }
};

export const getCustomerReservations = async (customerId: string) => {
  try {
    const response = await apiClient.get(
      `/api/reservations/customer/${customerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer reservations:", error);
    return [];
  }
};

export const confirmReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(
      `/api/reservations/${reservationId}/status`,
      null,
      {
        params: { status: "Confirmed" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming reservation:", error);
    return { id: reservationId, status: "failed" };
  }
};

export const completeReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(
      `/api/reservations/${reservationId}/status`,
      null,
      {
        params: { status: "Completed" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error completing reservation:", error);
    return { id: reservationId, status: "failed" };
  }
};
