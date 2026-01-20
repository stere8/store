"use server";
import apiClient from '@/lib/api-client';

export const getProducts = async () => {
  try {
    const response = await apiClient.get('/api/products');
    return response.data; // .NET returns products array directly
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const searchProducts = async (query: string) => {
  try {
    // The .NET API doesn't have search yet, so we'll filter client-side for now
    const products = await getProducts();
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};