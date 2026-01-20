"use server";
import apiClient from '@/lib/api-client';

export const createReservation = async (reservationData: {
  customerId: string;
  vendorId: string;
  items: { productId: string; quantity: number }[];
  customerNotes?: string;
}) => {
  try {
    const response = await apiClient.post('/api/reservations', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const getReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.get(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }
};

export const getCustomerReservations = async (customerId: string) => {
  try {
    const response = await apiClient.get(`/api/reservations/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer reservations:', error);
    return [];
  }
};

export const confirmReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(`/api/reservations/${reservationId}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error confirming reservation:', error);
    throw error;
  }
};

export const completeReservation = async (reservationId: string) => {
  try {
    const response = await apiClient.patch(`/api/reservations/${reservationId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing reservation:', error);
    throw error;
  }
};