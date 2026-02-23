"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  Check,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  Phone
} from "lucide-react";
import { useState } from "react";

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([
    {
      id: 'ord-001',
      customer: 'John D.',
      items: ['2x Burrito Bowl', '1x Chips & Guac'],
      total: 34.50,
      status: 'new',
      time: '2 min ago',
    },
    {
      id: 'ord-002',
      customer: 'Sarah M.',
      items: ['1x Street Tacos', '2x Horchata'],
      total: 22.75,
      status: 'preparing',
      time: '8 min ago',
    },
    {
      id: 'ord-003',
      customer: 'Mike R.',
      items: ['3x Quesadilla Supreme'],
      total: 41.97,
      status: 'ready',
      time: '15 min ago',
    },
  ]);

  const todayStats = {
    revenue: 487.50,
    orders: 24,
    avgPrepTime: '18 min',
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Maria's Kitchen</h1>
              <p className="text-gray-500">Restaurant Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today's Revenue</p>
                <p className="text-xl font-bold text-teal-600">${todayStats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.orders}</p>
                  <p className="text-sm text-gray-500">Orders Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.avgPrepTime}</p>
                  <p className="text-sm text-gray-500">Avg Prep Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+12%</p>
                  <p className="text-sm text-gray-500">vs Yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Orders ({orders.filter(o => o.status !== 'ready').length})</TabsTrigger>
            <TabsTrigger value="ready">Ready for Pickup ({orders.filter(o => o.status === 'ready').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {orders.filter(o => o.status !== 'ready').map(order => (
              <Card key={order.id} className={order.status === 'new' ? 'border-teal-500 border-2' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                        {order.status === 'new' && (
                          <Badge className="bg-red-500 animate-pulse">NEW</Badge>
                        )}
                      </div>
                      <p className="text-gray-500">{order.customer} • {order.time}</p>
                    </div>
                    <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-gray-700">{item}</p>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'new' && (
                      <>
                        <Button 
                          className="flex-1 bg-teal-500 hover:bg-teal-600"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept & Prepare
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Customer
                        </Button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        className="w-full bg-teal-500 hover:bg-teal-600"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Mark Ready for Pickup
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            {orders.filter(o => o.status === 'ready').map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.id}</h3>
                      <p className="text-gray-500">{order.customer}</p>
                    </div>
                    <Badge className="bg-green-500">Ready</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Waiting for driver pickup...
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed">
            <p className="text-center text-gray-500 py-8">No completed orders yet today.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
