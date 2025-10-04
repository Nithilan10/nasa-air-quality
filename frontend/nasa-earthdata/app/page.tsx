'use client';

import { AlertTriangle, Cloud, Droplets, Wind, MapPin, TrendingUp, Heart, Thermometer, Eye, Zap, Activity, Shield, Phone, Info, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useRef, useContext } from 'react';
import dynamic from 'next/dynamic';
import TopSpots from './components/TopSpots';
import { LocationContext } from './contexts/LocationContext';
import { forecastData } from './data/forecastData';
import { notifications } from './data/notifications';
import { healthSuggestions } from './data/healthSuggestions';
import { historicalAQIData } from './data/historicalAQIData';
import { emergencyContacts } from './data/emergencyContacts';
import { aqiScale } from './data/aqiScale';
import { getAQIColor, getAQIDescription } from './utils/aqiUtils';
import CurrentAirQuality from './components/dashboard/CurrentAirQuality';
import ForecastChart from './components/dashboard/ForecastChart';
import AirQualityTrends from './components/dashboard/AirQualityTrends';
import QuickActions from './components/dashboard/QuickActions';
import AQIScale from './components/dashboard/AQIScale';

const AQIMap = dynamic(() => import('./components/AQIMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-700 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
        <p className="text-white/70">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { userLocation, dummyAQIData } = useContext(LocationContext);

  // Very small demo 'prediction' based on simple moving average of nearby dummy points
  const predictAQIInHours = (hours: number) => {
    if (!dummyAQIData || dummyAQIData.length === 0) return null;
    // simple forecast: take median and add a small diurnal pattern
    const vals = dummyAQIData.map(d => d.aqi);
    const median = vals.sort((a,b) => a-b)[Math.floor(vals.length/2)];
    const diurnal = Math.round(10 * Math.sin((hours / 24) * Math.PI * 2));
    return Math.max(0, median + diurnal + Math.round((Math.random() - 0.5) * 8));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4 text-blue-100">
            Air Quality Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time air quality monitoring powered by NASA's TEMPO mission data.
            Stay informed about air pollution levels and protect your health.
          </p>
        </section>

        {/* Current Air Quality */}
        <CurrentAirQuality />

        {/* Forecast Chart */}
        <ForecastChart />

        {/* Air Quality Trends */}
        <AirQualityTrends />

        {/* Quick Actions */}
        <QuickActions />

        {/* AQI Scale Information */}
        <AQIScale />
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Powered by NASA's TEMPO Mission • Earth Science Division • Focus on Respiratory Health
          </p>
        </div>
      </footer>
    </div>
  );
}
