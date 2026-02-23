import React from 'react';
import { Globe, Clock, Star, MapPin } from 'lucide-react';

export default function ParadiseDeliveryApp() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-5 text-center">
        <h1 className="text-3xl font-bold">Paradise Delivery</h1>
        <p className="text-teal-100">Local delivery, fair prices</p>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-10 text-center">
        <h2 className="text-4xl font-bold mb-3">Food Delivery That Makes Sense</h2>
        <p className="text-xl text-teal-100">Support local restaurants, save on every order</p>
      </div>

      <div className="max-w-3xl mx-auto p-5">
        {/* Restaurant Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 text-center">
            <h3 className="text-3xl font-bold mb-1">Maria's Kitchen</h3>
            <p className="text-orange-100">Mexican • Paradise, CA • ⭐ 4.8</p>
            <p className="mt-2">25-35 min • $2.49 delivery</p>
          </div>

          <div className="p-5">
            {/* Menu Item 1 */}
            <div className="border rounded-lg p-4 mb-4">
              <h4 className="font-bold text-lg mb-1">Maria's Special Burrito</h4>
              <p className="text-gray-500 text-sm mb-2">Flour tortilla, rice, beans, cheese, salsa, guac</p>
              <span className="text-2xl font-bold text-teal-600">$10.79</span>
            </div>

            {/* Menu Item 2 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-1">Street Tacos (3)</h4>
              <p className="text-gray-500 text-sm mb-2">Corn tortillas, choice of meat, onions, cilantro</p>
              <span className="text-2xl font-bold text-teal-600">$8.99</span>
            </div>
          </div>
        </div>

        {/* Comparison Card */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <h3 className="text-xl font-bold mb-4">Sample Order: 2 Burritos + 1 Tacos</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Paradise */}
            <div className="bg-teal-50 border-2 border-teal-500 rounded-xl p-4">
              <h4 className="font-bold text-teal-600 mb-3">Paradise Delivery</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>2x Burritos</span><span>$21.58</span></div>
                <div className="flex justify-between"><span>1x Tacos</span><span>$8.99</span></div>
                <div className="flex justify-between"><span>Service Fee (15%)</span><span>$4.59</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>$2.49</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>$2.45</span></div>
                <div className="flex justify-between"><span>Tip (15%)</span><span>$4.59</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-teal-600">
                  <span>Your Total</span><span>$44.69</span>
                </div>
              </div>
            </div>

            {/* Other Apps */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 opacity-80">
              <h4 className="font-bold text-gray-600 mb-3">Other Apps</h4>
              <div className="text-sm space-y-2 text-gray-600">
                <div className="flex justify-between"><span>2x Burritos</span><span>$25.98</span></div>
                <div className="flex justify-between"><span>1x Tacos</span><span>$10.99</span></div>
                <div className="flex justify-between"><span>Service Fee (15%)</span><span>$5.55</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>$2.99</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>$2.92</span></div>
                <div className="flex justify-between"><span>Tip (15%)</span><span>$5.55</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Their Total</span><span>$53.98</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl text-center mt-5">
            <p className="text-lg mb-2">You Save</p>
            <p className="text-5xl font-bold mb-2">$9.29</p>
            <p>17% less than other delivery apps</p>
          </div>
        </div>
      </div>

      {/* Restaurant Section */}
      <div className="bg-gray-800 text-white p-10 text-center mt-8">
        <h3 className="text-3xl font-bold mb-2">Restaurant Owners</h3>
        <p className="text-gray-400 mb-6">Keep more of your hard-earned money</p>
        
        <div className="flex justify-center gap-5 max-w-md mx-auto">
          <div className="bg-gray-700 p-6 rounded-xl flex-1">
            <p className="font-bold mb-2">Other Apps</p>
            <p className="text-4xl font-bold my-3">30%</p>
            <p className="text-sm text-gray-400">Commission</p>
          </div>
          <div className="bg-teal-600 p-6 rounded-xl flex-1 border-2 border-teal-400">
            <p className="font-bold mb-2">Paradise</p>
            <p className="text-4xl font-bold my-3">18%</p>
            <p className="text-sm text-teal-200">Commission</p>
          </div>
        </div>

        <div className="bg-teal-600 p-5 rounded-xl max-w-sm mx-auto mt-6 text-xl font-bold">
          Keep $12 more per $100 order
        </div>
      </div>
    </div>
  );
}
