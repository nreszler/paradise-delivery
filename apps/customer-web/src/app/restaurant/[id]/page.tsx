"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Clock, 
  MapPin, 
  ChevronLeft,
  Heart,
  Share2,
  Info,
  Plus,
  Minus,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockRestaurants } from "@/lib/mockData";
import { mariasMenu } from "@/lib/competitorPricing";
import { useState } from "react";

export default function RestaurantPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  
  const restaurant = mockRestaurants.find(r => r.id === restaurantId);
  
  // Use exact competitor pricing for Maria's Kitchen
  const menuItems = restaurantId === 'marias-kitchen' 
    ? mariasMenu 
    : []; // Add other restaurants as needed
  
  const [cart, setCart] = useState<{[key: string]: number}>({});

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Restaurant not found</p>
      </div>
    );
  }

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = menuItems.find(i => i.id === itemId);
    return total + (item ? item.price * quantity : 0);
  }, 0);

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-80">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link href="/restaurants">
            <Button variant="secondary" size="icon" className="bg-white/90">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="bg-white/90">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-white/90">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            {restaurant.isLocallyOwned && (
              <Badge className="bg-teal-500 mb-2">Locally Owned</Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg opacity-90">{restaurant.cuisine}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-bold">{restaurant.rating}</span>
            <span className="text-gray-500 ml-1">({restaurant.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-1" />
            {restaurant.deliveryTime}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-1" />
            {restaurant.distance} mi
          </div>
          <Badge variant="secondary">{restaurant.priceRange}</Badge>
        </div>

        <p className="text-gray-600 mb-6">{restaurant.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Info className="w-4 h-4" />
          <span>Hours: {restaurant.hours} • ${restaurant.deliveryFee} delivery fee</span>
        </div>

        {/* Menu */}
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {menuItems
                .filter(item => item.category === category)
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                          
                          {item.dietary && item.dietary.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {item.dietary.map(diet => (
                                <Badge key={diet} variant="outline" className="text-xs">
                                  {diet}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {item.popular && (
                            <Badge className="bg-coral-500 mb-3">Popular</Badge>
                          )}

                          <div className="flex items-center gap-2 mt-4">
                            {cart[item.id] ? (
                              <div className="flex items-center gap-3">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="font-bold w-8 text-center">{cart[item.id]}</span>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => addToCart(item.id)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline"
                                onClick={() => addToCart(item.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                        {item.image && (
                          <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Button 
            size="lg" 
            className="w-full bg-teal-500 hover:bg-teal-600 text-white shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            View Cart ({cartCount} items)
            <span className="ml-auto font-bold">${cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
