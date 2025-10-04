"use client";

import React, { createContext, useState, useEffect } from 'react';

interface Point {
  lat: number;
  lng: number;
  aqi: number;
}

interface LocationContextValue {
  userLocation: [number, number] | null;
  dummyAQIData: Point[];
  userCity: string;
}

export const LocationContext = createContext<LocationContextValue>({
  userLocation: null,
  dummyAQIData: [],
  userCity: 'Detecting location...',
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [dummyAQIData, setDummyAQIData] = useState<Point[]>([]);
  const [userCity, setUserCity] = useState<string>('Detecting location...');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        // Generate dummy AQI data points around user location
        const points: Point[] = [];
        
        // Generate more points with larger radius for better visualization
        for (let i = 0; i < 80; i++) {
          const latOffset = (Math.random() - 0.5) * 0.8; // Increased radius
          const lngOffset = (Math.random() - 0.5) * 0.8;
          
          // Create varied AQI values with some high pollution clusters
          let aqi;
          if (i < 10) {
            // High pollution industrial areas
            aqi = Math.floor(Math.random() * 60) + 140; // 140-200
          } else if (i < 25) {
            // Moderate-high pollution (traffic areas)
            aqi = Math.floor(Math.random() * 40) + 100; // 100-140
          } else if (i < 45) {
            // Moderate pollution
            aqi = Math.floor(Math.random() * 50) + 60; // 60-110
          } else {
            // Good to moderate air quality
            aqi = Math.floor(Math.random() * 40) + 20; // 20-60
          }
          
          points.push({ lat: latitude + latOffset, lng: longitude + lngOffset, aqi });
        }
        
        setDummyAQIData(points);

        // Reverse geocode to a friendly name (best-effort)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
            const state = data.address.state || data.address.region;
            const country = data.address.country;
            if (city && state) setUserCity(`${city}, ${state}`);
            else if (city) setUserCity(city);
            else if (state) setUserCity(state);
            else setUserCity(country || 'Unknown Location');
          } else {
            setUserCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        } catch (err) {
          // best-effort, don't block UI
          setUserCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      (error) => {
        // fallback location (LA)
        setUserLocation([34.0522, -118.2437]);
        setUserCity('Los Angeles, CA');
        const points: Point[] = [];
        
        // Generate more points with larger radius for better visualization
        for (let i = 0; i < 80; i++) {
          const latOffset = (Math.random() - 0.5) * 0.8; // Increased radius
          const lngOffset = (Math.random() - 0.5) * 0.8;
          
          // Create varied AQI values with some high pollution clusters
          let aqi;
          if (i < 10) {
            // High pollution industrial areas
            aqi = Math.floor(Math.random() * 60) + 140; // 140-200
          } else if (i < 25) {
            // Moderate-high pollution (traffic areas)
            aqi = Math.floor(Math.random() * 40) + 100; // 100-140
          } else if (i < 45) {
            // Moderate pollution
            aqi = Math.floor(Math.random() * 50) + 60; // 60-110
          } else {
            // Good to moderate air quality
            aqi = Math.floor(Math.random() * 40) + 20; // 20-60
          }
          
          points.push({ lat: 34.0522 + latOffset, lng: -118.2437 + lngOffset, aqi });
        }
        
        setDummyAQIData(points);
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, dummyAQIData, userCity }}>
      {children}
    </LocationContext.Provider>
  );
}
