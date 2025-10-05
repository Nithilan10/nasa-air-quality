"use client";

import React from 'react';

interface TopSpotsProps {
  dummyAQIData: Array<{ lat: number; lng: number; aqi: number }>;
  getAQIColor: (aqi: number) => string;
}

// Small inline sparkline generator for a list of numbers
function Sparkline({ values }: { values: number[] }) {
  const width = 80;
  const height = 20;
  if (!values || values.length === 0) return <svg width={width} height={height} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke="#06b6d4" strokeWidth={1.8} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopSpots({ dummyAQIData, getAQIColor }: TopSpotsProps) {
  const spots = [...dummyAQIData]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 5)
    .map((p, i) => ({ ...p, id: i + 1 }));

  return (
  <div className="p-4 bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-lg shadow-sm">
      <h4 className="text-lg font-semibold mb-3 text-slate-200">Top 5 Polluted Spots (Dummy Data)</h4>
      <div className="space-y-2">
        {spots.map((spot) => (
          <div key={spot.id} className="flex items-center justify-between p-3 bg-white/3 rounded border border-white/6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAQIColor(spot.aqi) }} />
              <div>
                <div className="font-medium text-slate-100">Spot {spot.id}</div>
                <div className="text-xs text-slate-400">{spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-semibold text-slate-200">AQI {spot.aqi}</div>
              <Sparkline values={Array.from({ length: 8 }).map(() => Math.max(10, Math.round(spot.aqi + (Math.random() - 0.5) * 30)))} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">These top spots are generated from the dummy sensor cloud around your location — a judge-friendly demo of hotspot detection.</p>
    </div>
  );
}
