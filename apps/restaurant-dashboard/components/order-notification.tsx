"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Volume2, VolumeX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  customer: string
  items: { name: string; quantity: number }[]
  total: number
  time: string
}

interface OrderNotificationProps {
  onOrderAction?: (orderId: string, action: "accept" | "reject") => void
}

export function OrderNotification({ onOrderAction }: OrderNotificationProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Play notification sound
  const playSound = useCallback(() => {
    if (soundEnabled) {
      // Create a simple beep using AudioContext
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = "sine"
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }, [soundEnabled])

  // Simulate incoming order
  useEffect(() => {
    // For demo: Show an order after 3 seconds
    const timer = setTimeout(() => {
      const mockOrder: Order = {
        id: "ORD-2025-001",
        customer: "Sarah M.",
        items: [
          { name: "Tropical Chicken Bowl", quantity: 2 },
          { name: "Mango Smoothie", quantity: 1 },
        ],
        total: 42.97,
        time: new Date().toLocaleTimeString(),
      }
      setCurrentOrder(mockOrder)
      setShowDialog(true)
      playSound()
    }, 3000)

    return () => clearTimeout(timer)
  }, [playSound])

  const handleAccept = () => {
    if (currentOrder) {
      onOrderAction?.(currentOrder.id, "accept")
      setShowDialog(false)
      setCurrentOrder(null)
    }
  }

  const handleReject = () => {
    if (currentOrder) {
      onOrderAction?.(currentOrder.id, "reject")
      setShowDialog(false)
      setCurrentOrder(null)
    }
  }

  return (
    <>
      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        title={soundEnabled ? "Mute notifications" : "Enable notifications"}
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </button>

      {/* Order Notification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <Bell className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">New Order!</DialogTitle>
                <DialogDescription>
                  Order #{currentOrder?.id} • {currentOrder?.time}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{currentOrder?.customer}</p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Order Items</p>
              {currentOrder?.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="secondary">×{item.quantity}</Badge>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-teal-600">
                ${currentOrder?.total.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" onClick={handleReject} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleAccept} className="w-full bg-teal-600 hover:bg-teal-700">
                <Bell className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
