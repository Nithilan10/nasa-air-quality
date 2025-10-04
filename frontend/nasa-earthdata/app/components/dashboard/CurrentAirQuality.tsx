"use client";

import { Cloud, Thermometer, Droplets, Wind } from 'lucide-react';

export default function CurrentAirQuality() {
  return (
    <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6 flex items-center">
        <Cloud className="w-8 h-8 mr-3 text-blue-400" />
        Current Air Quality & Weather
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-800 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold">42</div>
          <div className="text-sm opacity-80">AQI Index</div>
          <div className="text-xs mt-2">Good</div>
        </div>
        <div className="bg-slate-700 rounded-xl p-6 text-center">
          <Thermometer className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">24°C</div>
          <div className="text-sm opacity-80">Temperature</div>
        </div>
        <div className="bg-blue-700 rounded-xl p-6 text-center">
          <Droplets className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">65%</div>
          <div className="text-sm opacity-80">Humidity</div>
        </div>
        <div className="bg-slate-600 rounded-xl p-6 text-center">
          <Wind className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">12 mph</div>
          <div className="text-sm opacity-80">Wind Speed</div>
        </div>
      </div>
    </section>
  );
}