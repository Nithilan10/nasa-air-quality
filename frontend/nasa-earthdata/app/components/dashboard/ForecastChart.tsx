"use client";

import { TrendingUp } from 'lucide-react';
import { forecastData } from '../../data/forecastData';

export default function ForecastChart() {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold flex items-center">
          <TrendingUp className="w-7 h-7 mr-3 text-emerald-300" />
          24-Hour Forecast
        </h3>
      </div>
      <div className="space-y-3">
        {forecastData.map((data, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/6">
            <div className="flex items-center space-x-4">
              <span className="font-semibold w-20 text-slate-200">{data.time}</span>
              <div className="flex space-x-6 text-sm text-slate-300">
                <span>AQI: <span className={`font-bold ${data.aqi > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{data.aqi}</span></span>
                <span>Temp: {data.temp}°C</span>
                <span>Humidity: {data.humidity}%</span>
              </div>
            </div>
            <div className="w-36 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${data.aqi > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${(data.aqi / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}