'use client';

import { AlertTriangle, Cloud, Droplets, Wind, MapPin, TrendingUp, Heart, Thermometer, Eye, Zap, Activity, Shield, Phone, Info, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useRef, useContext } from 'react';
import dynamic from 'next/dynamic';
import TopSpots from './components/TopSpots';
import { LocationContext } from './contexts/LocationContext';

// Dynamically import the map component to avoid SSR issues
const AQIMap = dynamic(() => import('./components/AQIMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
        <p className="text-white/70">Loading map...</p>
      </div>
    </div>
  ),
});

const forecastData = [
  { time: '00:00', aqi: 45, temp: 22, humidity: 60 },
  { time: '06:00', aqi: 52, temp: 20, humidity: 65 },
  { time: '12:00', aqi: 38, temp: 28, humidity: 45 },
  { time: '18:00', aqi: 65, temp: 25, humidity: 55 },
  { time: '24:00', aqi: 58, temp: 23, humidity: 62 },
];

const notifications = [
  { id: 1, message: 'Air quality deteriorating in your area - consider staying indoors', type: 'warning' },
  { id: 2, message: 'High pollen count expected tomorrow - asthma patients take note', type: 'info' },
  { id: 3, message: 'Good air quality window: 10 AM - 2 PM', type: 'success' },
];

const healthSuggestions = [
  'For asthma patients: Current AQI is moderate. Use inhaler if needed and avoid outdoor activities during peak pollution hours.',
  'Breathing exercises: Practice diaphragmatic breathing to improve lung capacity.',
  'Stay hydrated: Drink plenty of water to help your respiratory system.',
  'Monitor symptoms: Keep track of coughing, wheezing, or shortness of breath.',
];

const historicalAQIData = [
  { date: '2025-09-25', aqi: 35 },
  { date: '2025-09-26', aqi: 42 },
  { date: '2025-09-27', aqi: 38 },
  { date: '2025-09-28', aqi: 55 },
  { date: '2025-09-29', aqi: 48 },
  { date: '2025-09-30', aqi: 52 },
  { date: '2025-10-01', aqi: 42 },
];

const emergencyContacts = [
  { name: 'Air Quality Hotline', number: '1-800-AIR-HELP', description: '24/7 air quality emergency support' },
  { name: 'Local Health Department', number: '911', description: 'For immediate health emergencies' },
  { name: 'Poison Control', number: '1-800-222-1222', description: 'For chemical exposure concerns' },
];

const aqiScale = [
  { range: '0-50', level: 'Good', color: '#00e400', description: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
  { range: '51-100', level: 'Moderate', color: '#ffff00', description: 'Air quality is acceptable. However, there may be a risk for some people.' },
  { range: '101-150', level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Members of sensitive groups may experience health effects.' },
  { range: '151-200', level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects.' },
  { range: '201-300', level: 'Very Unhealthy', color: '#8f3f97', description: 'Health alert: everyone may experience more serious health effects.' },
  { range: '301+', level: 'Hazardous', color: '#7e0023', description: 'Health warning of emergency conditions. The entire population is more likely to be affected.' },
];

export default function Home() {
  const { userLocation, dummyAQIData } = useContext(LocationContext);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400'; // Good - green
    if (aqi <= 100) return '#ffff00'; // Moderate - yellow
    if (aqi <= 150) return '#ff7e00'; // Unhealthy for sensitive groups - orange
    if (aqi <= 200) return '#ff0000'; // Unhealthy - red
    if (aqi <= 300) return '#8f3f97'; // Very unhealthy - purple
    return '#7e0023'; // Hazardous - maroon
  };

  const getAQIDescription = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Air Quality Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time air quality monitoring powered by NASA's TEMPO mission data.
            Stay informed about air pollution levels and protect your health.
          </p>
        </section>

        {/* Current Air Quality */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Cloud className="w-8 h-8 mr-3 text-blue-400" />
            Current Air Quality & Weather
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">42</div>
              <div className="text-sm opacity-80">AQI Index</div>
              <div className="text-xs mt-2">Good</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">24°C</div>
              <div className="text-sm opacity-80">Temperature</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">65%</div>
              <div className="text-sm opacity-80">Humidity</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-center">
              <Wind className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">12 mph</div>
              <div className="text-sm opacity-80">Wind Speed</div>
            </div>
          </div>
        </section>

        {/* Forecast Chart */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-green-400" />
            24-Hour Forecast
          </h3>
          <div className="space-y-4">
            {forecastData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold w-16">{data.time}</span>
                  <div className="flex space-x-6 text-sm">
                    <span>AQI: <span className={`font-bold ${data.aqi > 50 ? 'text-red-400' : 'text-green-400'}`}>{data.aqi}</span></span>
                    <span>Temp: {data.temp}°C</span>
                    <span>Humidity: {data.humidity}%</span>
                  </div>
                </div>
                <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${data.aqi > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(data.aqi / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Air Quality Trends */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-400" />
            7-Day Air Quality Trends
          </h3>
          <div className="space-y-4">
            {historicalAQIData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="font-medium">{new Date(data.date).toLocaleDateString()}</span>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${data.aqi > 50 ? 'text-red-400' : 'text-green-400'}`}>
                    AQI: {data.aqi}
                  </span>
                  <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data.aqi > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${(data.aqi / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              📈 Trend: Air quality has been stable this week with occasional moderate spikes.
              Average AQI: 46 (Good)
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/maps" className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-center hover:from-blue-600 hover:to-cyan-600 transition-all">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">View Maps</h4>
              <p className="text-sm opacity-80">Explore air quality maps and data</p>
            </a>
            <a href="/health" className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-center hover:from-red-600 hover:to-pink-600 transition-all">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Health Tips</h4>
              <p className="text-sm opacity-80">Health recommendations and alerts</p>
            </a>
            <a href="/carbon" className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-center hover:from-green-600 hover:to-emerald-600 transition-all">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Carbon Tracker</h4>
              <p className="text-sm opacity-80">Monitor your carbon footprint</p>
            </a>
          </div>
        </section>

        {/* AQI Scale Information */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Info className="w-8 h-8 mr-3 text-purple-400" />
            Air Quality Index Scale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aqiScale.map((level, index) => (
              <div key={index} className="p-4 border rounded-lg" style={{ borderColor: level.color + '40', backgroundColor: level.color + '10' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold" style={{ color: level.color }}>{level.range}</span>
                  <span className="text-sm font-semibold">{level.level}</span>
                </div>
                <p className="text-xs text-gray-300">{level.description}</p>
              </div>
            ))}
          </div>
        </section>
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
