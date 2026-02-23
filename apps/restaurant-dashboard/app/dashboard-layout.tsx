"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { OrderNotification } from "@/components/order-notification"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(3)

  const handleOrderAction = (orderId: string, action: "accept" | "reject") => {
    if (action === "accept") {
      setPendingOrders((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        pendingOrders={pendingOrders}
      />
      
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, Island Grill
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <OrderNotification onOrderAction={handleOrderAction} />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <span className="text-sm font-medium text-teal-700">IG</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
