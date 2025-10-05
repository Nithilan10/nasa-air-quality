"use client";

import { Info } from 'lucide-react';

export default function MapLegend() {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6 text-white">Map Legend & Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">AQI Color Scale</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00e400' }}></div>
              <span className="text-sm">0-50: Good</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffff00' }}></div>
              <span className="text-sm">51-100: Moderate</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff7e00' }}></div>
              <span className="text-sm">101-150: Unhealthy for Sensitive Groups</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff0000' }}></div>
              <span className="text-sm">151-200: Unhealthy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8f3f97' }}></div>
              <span className="text-sm">201-300: Very Unhealthy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7e0023' }}></div>
              <span className="text-sm">301+: Hazardous</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Data Sources</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• NASA's TEMPO Mission satellite data</li>
            <li>• Ground-based air quality monitors</li>
            <li>• Weather station integrations</li>
            <li>• Real-time pollutant measurements</li>
          </ul>
        </div>
      </div>
    </section>
  );
}