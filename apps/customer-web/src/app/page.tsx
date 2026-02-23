import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Clock, Bike, ChevronRight } from "lucide-react";
import Link from "next/link";
import { mockRestaurants } from "@/lib/mockData";

export default function Home() {
  const featuredRestaurants = mockRestaurants.slice(0, 4);
  const localRestaurants = mockRestaurants.filter(r => r.isLocallyOwned).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500 to-teal-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Paradise Delivery
            </h1>
            <p className="text-xl text-teal-100 mb-2">
              Fresh from Paradise to Paradise
            </p>
            <p className="text-lg text-teal-100">
              Save 15-20% vs DoorDash • Support Local • Fair to Drivers
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-full shadow-lg p-2">
              <MapPin className="w-6 h-6 text-teal-500 ml-4" />
              <Input 
                type="text" 
                placeholder="Enter delivery address..."
                className="border-0 focus-visible:ring-0 text-gray-800 flex-1"
              />
              <Button className="bg-coral-500 hover:bg-coral-600 text-white rounded-full px-8">
                <Search className="w-5 h-5 mr-2" />
                Find Food
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12 text-center">
            <div>
              <p className="text-3xl font-bold">15-20%</p>
              <p className="text-teal-100">Savings vs DoorDash</p>
            </div>
            <div>
              <p className="text-3xl font-bold">18%</p>
              <p className="text-teal-100">Restaurant Commission</p>
            </div>
            <div>
              <p className="text-3xl font-bold">Local</p>
              <p className="text-teal-100">Paradise Owned</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Restaurants</h2>
          <Link href="/restaurants" className="text-teal-600 hover:text-teal-700 flex items-center">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredRestaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  {restaurant.isLocallyOwned && (
                    <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                      Locally Owned
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
                  <p className="text-gray-500 text-sm">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-500 text-sm">{restaurant.priceRange}</span>
                    <span className="text-teal-600 font-medium">${restaurant.deliveryFee} delivery</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Local Favorites */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Local Favorites</h2>
            <p className="text-gray-600">Support Paradise-owned businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {localRestaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-coral-500 text-white text-xs px-2 py-1 rounded-full">
                      Local Gem
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
                    <p className="text-gray-500 text-sm">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {restaurant.deliveryTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">1. Browse</h3>
            <p className="text-gray-600">Find your favorite Paradise restaurants</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">2. Order</h3>
            <p className="text-gray-600">Save 15-20% vs other delivery apps</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">3. Enjoy</h3>
            <p className="text-gray-600">Track your delivery in real-time</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-teal-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Join Paradise Delivery and support local businesses while saving money.
          </p>
          <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white rounded-full px-12">
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Paradise Delivery</h3>
            <p className="text-sm">Fresh from Paradise to Paradise. A City Delivery Company.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li>How it Works</li>
              <li>FAQs</li>
              <li>Support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">For Restaurants</h4>
            <ul className="space-y-2 text-sm">
              <li>Partner with Us</li>
              <li>Pricing</li>
              <li>Dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">For Drivers</h4>
            <ul className="space-y-2 text-sm">
              <li>Drive with Us</li>
              <li>Requirements</li>
              <li>Earnings</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          © 2026 Paradise Delivery. A City Delivery Company. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
