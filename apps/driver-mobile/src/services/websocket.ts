import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import type { DeliveryJob, Notification } from '@/types';
import { useAuthStore, useDeliveryStore, useUIStore } from '@/store';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.paradisedelivery.com/ws';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${WS_URL}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopPing();
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect(token);
    }
  }

  disconnect() {
    this.stopPing();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect(token);
    }, delay);
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message;

    switch (type) {
      case 'new_job':
        this.handleNewJob(data);
        break;
      case 'job_cancelled':
        this.handleJobCancelled(data);
        break;
      case 'order_update':
        this.handleOrderUpdate(data);
        break;
      case 'notification':
        this.handleNotification(data);
        break;
      case 'earnings_update':
        this.handleEarningsUpdate(data);
        break;
      case 'pong':
        // Ping response, ignore
        break;
    }

    // Call registered handlers
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach((handler) => handler(data));
  }

  private handleNewJob(job: DeliveryJob) {
    useDeliveryStore.getState().setAvailableJobs([
      job,
      ...useDeliveryStore.getState().availableJobs,
    ]);

    // Add notification
    const notification: Notification = {
      id: `job_${job.id}`,
      type: 'new_job',
      title: 'New Delivery Available!',
      message: `${job.restaurant.name} → ${job.customer.address} ($${job.estimatedEarnings.toFixed(2)})`,
      data: { jobId: job.id },
      read: false,
      createdAt: new Date().toISOString(),
    };
    useUIStore.getState().addNotification(notification);
  }

  private handleJobCancelled(data: { jobId: string; reason?: string }) {
    useDeliveryStore.getState().removeAvailableJob(data.jobId);
    
    const notification: Notification = {
      id: `cancelled_${data.jobId}`,
      type: 'order_update',
      title: 'Delivery Cancelled',
      message: data.reason || 'A delivery has been cancelled',
      data: { jobId: data.jobId },
      read: false,
      createdAt: new Date().toISOString(),
    };
    useUIStore.getState().addNotification(notification);
  }

  private handleOrderUpdate(data: { jobId: string; status: string; message?: string }) {
    const notification: Notification = {
      id: `update_${data.jobId}_${Date.now()}`,
      type: 'order_update',
      title: 'Order Update',
      message: data.message || `Order status updated to ${data.status}`,
      data: { jobId: data.jobId, status: data.status },
      read: false,
      createdAt: new Date().toISOString(),
    };
    useUIStore.getState().addNotification(notification);
  }

  private handleNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const notification: Notification = {
      ...data,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    useUIStore.getState().addNotification(notification);
  }

  private handleEarningsUpdate(data: { amount: number; type: string }) {
    const notification: Notification = {
      id: `earnings_${Date.now()}`,
      type: 'earnings',
      title: 'Earnings Updated!',
      message: `$${data.amount.toFixed(2)} ${data.type} added to your earnings`,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    useUIStore.getState().addNotification(notification);
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  on(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }

  off(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(type, handlers);
    }
  }
}

export const wsService = new WebSocketService();

// React Hook for WebSocket
export function useWebSocket() {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      wsService.connect(token);
    }

    return () => {
      wsService.disconnect();
    };
  }, [isAuthenticated, token]);
}
