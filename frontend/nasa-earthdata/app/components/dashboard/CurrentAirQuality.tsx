"use client";

import { Cloud, Thermometer, Droplets, Wind } from 'lucide-react';

export default function CurrentAirQuality() {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold flex items-center">
          <Cloud className="w-7 h-7 mr-3 text-cyan-300" />
          Current Air Quality & Weather
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="rounded-xl p-5 text-center bg-gradient-to-br from-blue-800/70 to-slate-800/30 border border-white/6 shadow-sm">
          <div className="text-3xl font-bold text-white">42</div>
          <div className="text-sm text-slate-300 mt-1">AQI Index</div>
          <div className="text-xs mt-2 text-amber-400">Good</div>
        </div>
  <div className="rounded-xl p-5 text-center bg-gradient-to-br from-slate-700/65 to-slate-800/30 border border-white/6 shadow-sm">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-slate-200" />
          <div className="text-2xl font-bold text-white">24°C</div>
          <div className="text-sm text-slate-300">Temperature</div>
        </div>
  <div className="rounded-xl p-5 text-center bg-gradient-to-br from-blue-700/65 to-slate-800/30 border border-white/6 shadow-sm">
          <Droplets className="w-6 h-6 mx-auto mb-2 text-slate-200" />
          <div className="text-2xl font-bold text-white">65%</div>
          <div className="text-sm text-slate-300">Humidity</div>
        </div>
  <div className="rounded-xl p-5 text-center bg-gradient-to-br from-slate-600/65 to-slate-800/30 border border-white/6 shadow-sm">
          <Wind className="w-6 h-6 mx-auto mb-2 text-slate-200" />
          <div className="text-2xl font-bold text-white">12 mph</div>
          <div className="text-sm text-slate-300">Wind Speed</div>
        </div>
      </div>
    </section>
  );
}