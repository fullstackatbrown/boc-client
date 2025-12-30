"use client";

import React from 'react';
import { 
  Footprints, Tent, Backpack, Bicycle, Mountains, 
  PersonSimpleSki, Waves, CalendarBlank, PersonSimpleRun, 
  Binoculars, MapPin, Sparkle 
} from "@phosphor-icons/react";

const iconMap = {
  Hiking: Footprints,
  Camping: Tent,
  Backpacking: Backpack,
  Biking: Bicycle,
  Climbing: Mountains,
  Skiing: PersonSimpleSki,
  Water: Waves,
  Event: CalendarBlank,
  Running: PersonSimpleRun,
  Exploration: Binoculars,
  Local: MapPin,
  Special: Sparkle,
};

type TripIconProps = {
  type: string; // Changed to string to allow for normalized lookup
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
};

export default function TripIcon({ 
  type, 
  size = 32, 
  weight = "duotone", 
  className = "" 
}: TripIconProps) {
  
  // Normalize "hiking" or "HIKING" to "Hiking" to match our iconMap keys
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  
  const IconComponent = iconMap[normalizedType as keyof typeof iconMap] || Sparkle;

  return (
    <IconComponent 
      size={size} 
      weight={weight} 
      className={`transition-all duration-300 ease-in-out ${className}`} 
    />
  );
}