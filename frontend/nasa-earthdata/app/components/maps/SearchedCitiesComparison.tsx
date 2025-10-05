"use client";

import { MapPin } from 'lucide-react';
import { getAQIColor } from '../../utils/aqiUtils';

interface CityAQIData {
  location: string;
  aqi: number;
  category: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  pm25: number;
  o3: number;
  latitude: number;
  longitude: number;
}

interface SearchedCitiesComparisonProps {
  searchedCities: CityAQIData[];
  onRemoveCity: (location: string) => void;
}

export default function SearchedCitiesComparison({ searchedCities, onRemoveCity }: SearchedCitiesComparisonProps) {
  if (searchedCities.length === 0) return null;

  return (
    <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6 flex items-center">
        <MapPin className="w-8 h-8 mr-3 text-blue-400" />
        City Air Quality Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchedCities.map((city) => (
          <div key={`${city.location}-${city.latitude}-${city.longitude}`} className="bg-slate-800 rounded-xl p-6 relative">
            <button
              onClick={() => onRemoveCity(city.location)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove city"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-4">{city.location}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">AQI</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold">{city.aqi}</span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getAQIColor(city.aqi) }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Category: <span className="font-medium">{city.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Temperature: {city.temperature}°C</div>
                <div>Humidity: {city.humidity}%</div>
                <div>Wind: {city.wind_speed} mph</div>
                <div>Pressure: {city.pressure} hPa</div>
              </div>
              <div className="text-xs text-gray-400">
                PM2.5: {city.pm25} | O3: {city.o3}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}