"use client";

import { TrendingUp } from 'lucide-react';
import { historicalAQIData } from '../../data/historicalAQIData';

export default function AirQualityTrends() {
  return (
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
  );
}