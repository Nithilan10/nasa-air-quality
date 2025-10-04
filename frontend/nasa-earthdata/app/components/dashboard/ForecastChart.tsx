"use client";

import { TrendingUp } from 'lucide-react';
import { forecastData } from '../../data/forecastData';

export default function ForecastChart() {
  return (
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
  );
}