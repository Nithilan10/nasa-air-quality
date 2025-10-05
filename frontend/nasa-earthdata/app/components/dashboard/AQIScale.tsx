"use client";

import { Info } from 'lucide-react';
import { aqiScale } from '../../data/aqiScale';

export default function AQIScale() {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold flex items-center">
          <Info className="w-7 h-7 mr-3 text-violet-300" />
          Air Quality Index Scale
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aqiScale.map((level, index) => (
          <div key={index} className="p-4 rounded-lg border" style={{ borderColor: level.color + '40', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div style={{ width: 18, height: 12, background: level.color, borderRadius: 4 }} />
                <span className="font-bold text-slate-200">{level.range}</span>
              </div>
              <span className="text-sm font-semibold text-slate-300">{level.level}</span>
            </div>
            <p className="text-xs text-slate-400">{level.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}