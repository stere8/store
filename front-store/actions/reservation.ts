"use server";
import { apiClient } from "@/lib/epoc-api";

export const createReservation = async (reservationData: {
  customerId: string;
  vendorId: string;
  items: { productId: string; quantity: number }[];
  customerNotes?: string;
}) => {
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
    const response = await apiClient.get(`/api/reservations/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer reservations:", error);
    return [];
  }
};

export const confirmReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(`/api/reservations/${reservationId}/confirm`);
    return response.data;
  } catch (error) {
    console.error("Error confirming reservation:", error);
    return { id: reservationId, status: "failed" };
  }
};

export const completeReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(`/api/reservations/${reservationId}/complete`);
    return response.data;
  } catch (error) {
    console.error("Error completing reservation:", error);
    return { id: reservationId, status: "failed" };
  }
};
