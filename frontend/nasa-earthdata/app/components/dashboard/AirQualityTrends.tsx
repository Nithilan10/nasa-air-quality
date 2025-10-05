"use client";

import { TrendingUp } from 'lucide-react';
import { historicalAQIData } from '../../data/historicalAQIData';

export default function AirQualityTrends() {
  return (
    <section className="bg-gradient-to-br from-slate-900/75 to-slate-800/65 border border-white/6 rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6 flex items-center text-white">
        <TrendingUp className="w-8 h-8 mr-3 text-cyan-400" />
        7-Day Air Quality Trends
      </h3>
      <div className="space-y-4">
        {historicalAQIData.map((data, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-br from-slate-800/40 to-slate-700/30 rounded-lg border border-white/6">
            <span className="font-medium text-white">{new Date(data.date).toLocaleDateString()}</span>
            <div className="flex items-center space-x-3">
              <span className={`font-bold ${data.aqi > 50 ? 'text-red-400' : 'text-green-400'}`}>
                AQI: {data.aqi}
              </span>
              <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.aqi > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((data.aqi / 150) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gradient-to-br from-cyan-800/20 to-blue-800/10 rounded-lg border border-white/6">
        <p className="text-sm text-blue-200">
          📈 Trend: Air quality has been stable this week with occasional moderate spikes.
          Average AQI: 46 (Good)
        </p>
      </div>
    </section>
  );
}