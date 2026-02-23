import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Driver, Vehicle, Document, Earnings, ActiveDelivery, DeliveryHistory, Notification } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  driver: Driver | null;
  token: string | null;
  setAuthenticated: (driver: Driver, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateDriver: (updates: Partial<Driver>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      driver: null,
      token: null,
      setAuthenticated: (driver, token) => set({ isAuthenticated: true, driver, token, isLoading: false }),
      logout: () => set({ isAuthenticated: false, driver: null, token: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      updateDriver: (updates) => set((state) => ({
        driver: state.driver ? { ...state.driver, ...updates } : null
      })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface DriverDataState {
  vehicle: Vehicle | null;
  documents: Document[];
  earnings: Earnings | null;
  setVehicle: (vehicle: Vehicle) => void;
  setDocuments: (documents: Document[]) => void;
  updateDocument: (document: Document) => void;
  setEarnings: (earnings: Earnings) => void;
  updateEarnings: (updates: Partial<Earnings>) => void;
}

export const useDriverDataStore = create<DriverDataState>()(
  persist(
    (set) => ({
      vehicle: null,
      documents: [],
      earnings: null,
      setVehicle: (vehicle) => set({ vehicle }),
      setDocuments: (documents) => set({ documents }),
      updateDocument: (document) => set((state) => ({
        documents: state.documents.map((d) => 
          d.id === document.id ? document : d
        )
      })),
      setEarnings: (earnings) => set({ earnings }),
      updateEarnings: (updates) => set((state) => ({
        earnings: state.earnings ? { ...state.earnings, ...updates } : null
      })),
    }),
    {
      name: 'driver-data-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface DeliveryState {
  activeDelivery: ActiveDelivery | null;
  deliveryHistory: DeliveryHistory[];
  availableJobs: any[];
  isOnline: boolean;
  setActiveDelivery: (delivery: ActiveDelivery | null) => void;
  updateDeliveryStatus: (status: ActiveDelivery['status'], updates?: Partial<ActiveDelivery>) => void;
  setDeliveryHistory: (history: DeliveryHistory[]) => void;
  addToHistory: (delivery: DeliveryHistory) => void;
  setAvailableJobs: (jobs: any[]) => void;
  removeAvailableJob: (jobId: string) => void;
  setIsOnline: (online: boolean) => void;
  addPickupPhoto: (uri: string) => void;
  addDeliveryPhoto: (uri: string) => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      activeDelivery: null,
      deliveryHistory: [],
      availableJobs: [],
      isOnline: false,
      setActiveDelivery: (delivery) => set({ activeDelivery: delivery }),
      updateDeliveryStatus: (status, updates) => set((state) => ({
        activeDelivery: state.activeDelivery 
          ? { ...state.activeDelivery, status, ...updates }
          : null
      })),
      setDeliveryHistory: (history) => set({ deliveryHistory: history }),
      addToHistory: (delivery) => set((state) => ({
        deliveryHistory: [delivery, ...state.deliveryHistory]
      })),
      setAvailableJobs: (jobs) => set({ availableJobs: jobs }),
      removeAvailableJob: (jobId) => set((state) => ({
        availableJobs: state.availableJobs.filter((j) => j.id !== jobId)
      })),
      setIsOnline: (online) => set({ isOnline: online }),
      addPickupPhoto: (uri) => set((state) => ({
        activeDelivery: state.activeDelivery
          ? { ...state.activeDelivery, pickupPhoto: uri }
          : null
      })),
      addDeliveryPhoto: (uri) => set((state) => ({
        activeDelivery: state.activeDelivery
          ? { ...state.activeDelivery, deliveryPhoto: uri }
          : null
      })),
    }),
    {
      name: 'delivery-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface UIState {
  notifications: Notification[];
  unreadCount: number;
  isOffline: boolean;
  pendingSync: string[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setIsOffline: (offline: boolean) => void;
  addPendingSync: (id: string) => void;
  removePendingSync: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isOffline: false,
      pendingSync: [],
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      setIsOffline: (offline) => set({ isOffline: offline }),
      addPendingSync: (id) => set((state) => ({
        pendingSync: [...state.pendingSync, id]
      })),
      removePendingSync: (id) => set((state) => ({
        pendingSync: state.pendingSync.filter((s) => s !== id)
      })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
