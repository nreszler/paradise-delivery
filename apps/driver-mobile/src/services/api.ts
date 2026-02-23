import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Driver, Vehicle, Document, Earnings, DeliveryJob, ActiveDelivery, DeliveryHistory, LocationUpdate } from '@/types';
import { useAuthStore } from '@/store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.paradisedelivery.com/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(phone: string, otp: string): Promise<{ driver: Driver; token: string }> {
    const response = await this.client.post('/auth/login', { phone, otp });
    return response.data;
  }

  async requestOTP(phone: string): Promise<void> {
    await this.client.post('/auth/otp', { phone });
  }

  async verifyToken(): Promise<Driver> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Driver Profile
  async getDriverProfile(): Promise<Driver> {
    const response = await this.client.get('/driver/profile');
    return response.data;
  }

  async updateDriverProfile(updates: Partial<Driver>): Promise<Driver> {
    const response = await this.client.patch('/driver/profile', updates);
    return response.data;
  }

  // Vehicle
  async getVehicle(): Promise<Vehicle | null> {
    const response = await this.client.get('/driver/vehicle');
    return response.data;
  }

  async updateVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.client.patch('/driver/vehicle', vehicle);
    return response.data;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    const response = await this.client.get('/driver/documents');
    return response.data;
  }

  async uploadDocument(type: Document['type'], fileUri: string, metadata?: any): Promise<Document> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'document.jpg';
    
    formData.append('document', {
      uri: fileUri,
      name: filename,
      type: 'image/jpeg',
    } as any);
    formData.append('type', type);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.client.post('/driver/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Earnings
  async getEarnings(): Promise<Earnings> {
    const response = await this.client.get('/driver/earnings');
    return response.data;
  }

  async getEarningsHistory(period: 'day' | 'week' | 'month'): Promise<any[]> {
    const response = await this.client.get('/driver/earnings/history', {
      params: { period }
    });
    return response.data;
  }

  // Jobs
  async getAvailableJobs(lat: number, lng: number): Promise<DeliveryJob[]> {
    const response = await this.client.get('/jobs/available', {
      params: { lat, lng }
    });
    return response.data;
  }

  async acceptJob(jobId: string): Promise<ActiveDelivery> {
    const response = await this.client.post(`/jobs/${jobId}/accept`);
    return response.data;
  }

  async declineJob(jobId: string, reason?: string): Promise<void> {
    await this.client.post(`/jobs/${jobId}/decline`, { reason });
  }

  // Delivery Flow
  async updateDeliveryStatus(
    deliveryId: string, 
    status: string, 
    data?: { photoUri?: string; location?: LocationUpdate }
  ): Promise<ActiveDelivery> {
    const formData = new FormData();
    formData.append('status', status);
    
    if (data?.photoUri) {
      const filename = data.photoUri.split('/').pop() || 'photo.jpg';
      formData.append('photo', {
        uri: data.photoUri,
        name: filename,
        type: 'image/jpeg',
      } as any);
    }
    
    if (data?.location) {
      formData.append('location', JSON.stringify(data.location));
    }

    const response = await this.client.patch(`/deliveries/${deliveryId}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async rateCustomer(deliveryId: string, rating: number, feedback?: string): Promise<void> {
    await this.client.post(`/deliveries/${deliveryId}/rate`, { rating, feedback });
  }

  async getActiveDelivery(): Promise<ActiveDelivery | null> {
    try {
      const response = await this.client.get('/deliveries/active');
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getDeliveryHistory(limit = 50, offset = 0): Promise<DeliveryHistory[]> {
    const response = await this.client.get('/deliveries/history', {
      params: { limit, offset }
    });
    return response.data;
  }

  // Location
  async updateLocation(location: LocationUpdate): Promise<void> {
    await this.client.post('/driver/location', location);
  }

  async setOnlineStatus(online: boolean, location?: { lat: number; lng: number }): Promise<void> {
    await this.client.post('/driver/status', { online, location });
  }

  // Support
  async createSupportTicket(subject: string, message: string, category: string): Promise<void> {
    await this.client.post('/support/tickets', { subject, message, category });
  }
}

export const api = new ApiService();
