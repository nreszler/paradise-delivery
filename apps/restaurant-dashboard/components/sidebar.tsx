"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Star,
  ShieldAlert,
  Store,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  pendingOrders: number
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingBag, badge: "pendingOrders" },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Refunds", href: "/refunds", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ isCollapsed, onToggle, pendingOrders }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
            <Store className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-teal-700">Paradise</span>
              <span className="text-xs text-gray-500">for Restaurants</span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const showBadge = item.badge === "pendingOrders" && pendingOrders > 0

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {showBadge && (
                    <Badge variant="coral" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {pendingOrders}
                    </Badge>
                  )}
                </>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white">
                  {pendingOrders}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <button className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900",
          isCollapsed && "justify-center px-2"
        )}>
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
