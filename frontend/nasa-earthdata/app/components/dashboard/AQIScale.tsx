"use client";

import { Info } from 'lucide-react';
import { aqiScale } from '../../data/aqiScale';

export default function AQIScale() {
  return (
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
  );
}