'use client';

import { useState } from 'react';
import { Power, MapPin } from 'lucide-react';

interface OnlineToggleProps {
  onToggle?: (isOnline: boolean) => void;
}

export default function OnlineToggle({ onToggle }: OnlineToggleProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleToggle = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    onToggle?.(newState);
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isOnline ? 'bg-teal-500/20' : 'bg-gray-700'}`}>
            <Power size={24} className={isOnline ? 'text-teal-400' : 'text-gray-400'} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {isOnline ? 'You\'re Online' : 'You\'re Offline'}
            </h3>
            <p className="text-sm text-gray-400">
              {isOnline ? 'Accepting delivery requests' : 'Tap to start earning'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          className={`relative w-16 h-9 rounded-full transition-colors duration-300 tap-target ${
            isOnline ? 'bg-teal-500' : 'bg-gray-600'
          }`}
          aria-label={isOnline ? 'Go offline' : 'Go online'}
        >
          <div
            className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 ${
              isOnline ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isOnline && (
        <div className="flex items-center gap-2 text-sm text-teal-400 bg-teal-500/10 rounded-lg p-3">
          <MapPin size={16} />
          <span>GPS Active - Location sharing enabled</span>
        </div>
      )}

      {!locationEnabled && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
          <MapPin size={16} />
          <span>Location required to go online</span>
        </div>
      )}
    </div>
  );
}
