import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { api } from './api';
import { useDeliveryStore, useUIStore } from '@/store';
import type { LocationUpdate } from '@/types';

const LOCATION_TASK_NAME = 'background-location-task';

interface BackgroundLocationData {
  locations: Location.LocationObject[];
}

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: TaskManager.TaskManagerTaskBody<BackgroundLocationData>) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const activeDelivery = useDeliveryStore.getState().activeDelivery;
    
    for (const location of locations) {
      const update: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
        deliveryId: activeDelivery?.job.id,
      };

      try {
        await api.updateLocation(update);
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }
  }
});

export class LocationService {
  private static instance: LocationService;
  private isTracking: boolean = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted';
  }

  async checkPermissions(): Promise<{ foreground: boolean; background: boolean }> {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();
    
    return {
      foreground: foreground.status === 'granted',
      background: background.status === 'granted',
    };
  }

  async startTracking(): Promise<boolean> {
    const permissions = await this.checkPermissions();
    if (!permissions.background) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 10, // 10 meters
        foregroundService: {
          notificationTitle: 'Paradise Delivery',
          notificationBody: 'Tracking your location for delivery',
          notificationColor: '#14B8A6',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      this.isTracking = false;
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  async startForegroundTracking(callback: (location: Location.LocationObject) => void): Promise<void> {
    const permissions = await this.checkPermissions();
    if (!permissions.foreground) {
      const granted = await this.requestPermissions();
      if (!granted) return;
    }

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      callback
    );
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = LocationService.getInstance();
