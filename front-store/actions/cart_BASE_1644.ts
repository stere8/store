"use server";
import apiClient from '@/lib/api-client';

export const ensureCart = async (customerId: string) => {
  try {
    const response = await apiClient.post('/api/carts/ensure', {
      customerId
    });
    return response.data;
  } catch (error) {
    console.error('Error ensuring cart:', error);
    throw error;
  }
};

export const addToCart = async (cartId: string, productId: string, quantity: number) => {
  try {
    const response = await apiClient.post(`/api/carts/${cartId}/items`, {
      productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCart = async (cartId: string) => {
  try {
    const response = await apiClient.get(`/api/carts/${cartId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
};

export const removeFromCart = async (cartId: string, productId: string) => {
  try {
    await apiClient.delete(`/api/carts/${cartId}/items/${productId}`);
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};