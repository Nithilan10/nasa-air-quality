"use client";

import { Layers } from 'lucide-react';

interface MapType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface MapTypeSelectorProps {
  mapTypes: MapType[];
  selectedMapType: string;
  onMapTypeChange: (type: string) => void;
}

export default function MapTypeSelector({ mapTypes, selectedMapType, onMapTypeChange }: MapTypeSelectorProps) {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6 flex items-center text-white">
        <Layers className="w-8 h-8 mr-3 text-cyan-400" />
        Map Visualization Types
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mapTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => onMapTypeChange(type.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedMapType === type.id
                  ? 'border-cyan-400 bg-cyan-400/20 text-white'
                  : 'border-white/20 bg-slate-800/50 hover:bg-slate-800/60 text-white/80'
              }`}
            >
              <Icon className={`w-12 h-12 mx-auto mb-4 ${
                selectedMapType === type.id ? 'text-cyan-400' : 'text-white/70'
              }`} />
              <h4 className="text-lg font-semibold mb-2">{type.name}</h4>
              <p className="text-sm text-gray-300">{type.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}