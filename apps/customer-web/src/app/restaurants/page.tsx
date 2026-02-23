"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  ChevronLeft,
  Filter,
  Heart
} from "lucide-react";
import Link from "next/link";
import { mockRestaurants } from "@/lib/mockData";
import { useState } from "react";

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const cuisines = ["All", "Italian", "Japanese", "American", "Thai", "Mexican", "Chinese", "Vegetarian"];

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Restaurants</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search restaurants or cuisines..."
            className="pl-12 py-6 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Cuisine Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {cuisines.map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine || (cuisine === "All" && !selectedCuisine) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine(cuisine === "All" ? null : cuisine)}
              className={selectedCuisine === cuisine || (cuisine === "All" && !selectedCuisine) 
                ? "bg-teal-500 hover:bg-teal-600" 
                : ""
              }
            >
              {cuisine}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </p>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="relative h-56">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  {restaurant.isLocallyOwned && (
                    <Badge className="absolute top-3 left-3 bg-teal-500">
                      Locally Owned
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-800">{restaurant.name}</h3>
                    <Badge variant="secondary">{restaurant.priceRange}</Badge>
                  </div>
                  
                  <p className="text-gray-500 mb-3">{restaurant.cuisine}</p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-gray-400 ml-1">({restaurant.reviewCount})</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {restaurant.distance} mi
                    </div>
                    <span className="text-teal-600 font-medium">
                      ${restaurant.deliveryFee} delivery
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No restaurants found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {setSearchQuery(""); setSelectedCuisine(null);}}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
