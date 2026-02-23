import { apiClient } from './client';
import { Restaurant, MenuItem, Order, Address } from '../types/navigation';

export const restaurantsApi = {
  getAll: async (params?: { lat?: number; lng?: number; category?: string }) => {
    const response = await apiClient.get<Restaurant[]>('/restaurants', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },
  getMenu: async (restaurantId: string) => {
    const response = await apiClient.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
    return response.data;
  },
};

export const ordersApi = {
  getAll: async () => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },
  create: async (orderData: {
    restaurantId: string;
    items: any[];
    deliveryAddress: Address;
    paymentMethodId: string;
  }) => {
    const response = await apiClient.post<Order>('/orders', orderData);
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await apiClient.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },
  getAddresses: async () => {
    const response = await apiClient.get<Address[]>('/users/addresses');
    return response.data;
  },
  addAddress: async (address: Omit<Address, 'id'>) => {
    const response = await apiClient.post<Address>('/users/addresses', address);
    return response.data;
  },
  updateAddress: async (id: string, address: Partial<Address>) => {
    const response = await apiClient.patch<Address>(`/users/addresses/${id}`, address);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    await apiClient.delete(`/users/addresses/${id}`);
  },
};

export const authApi = {
  requestOTP: async (phone: string) => {
    const response = await apiClient.post('/auth/otp', { phone });
    return response.data;
  },
  verifyOTP: async (phone: string, code: string) => {
    const response = await apiClient.post('/auth/verify', { phone, code });
    return response.data;
  },
};