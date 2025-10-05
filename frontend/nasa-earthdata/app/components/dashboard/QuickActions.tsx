"use client";

import Link from 'next/link';
import { MapPin, Heart, Zap } from 'lucide-react';

export default function QuickActions() {
  return (
  <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Link href="/maps" className="p-5 rounded-xl text-center bg-gradient-to-br from-blue-700/65 to-slate-800/20 border border-white/6 hover:from-blue-600 transition-all">
          <MapPin className="w-10 h-10 mx-auto mb-3" />
          <h4 className="text-lg font-semibold mb-1">View Maps</h4>
          <p className="text-sm text-slate-300">Explore air quality maps and data</p>
        </Link>
  <Link href="/health" className="p-5 rounded-xl text-center bg-gradient-to-br from-red-800/65 to-slate-800/20 border border-white/6 hover:from-red-700 transition-all">
          <Heart className="w-10 h-10 mx-auto mb-3" />
          <h4 className="text-lg font-semibold mb-1">Health Tips</h4>
          <p className="text-sm text-slate-300">Health recommendations and alerts</p>
        </Link>
  <Link href="/carbon" className="p-5 rounded-xl text-center bg-gradient-to-br from-green-800/65 to-slate-800/20 border border-white/6 hover:from-green-700 transition-all">
          <Zap className="w-10 h-10 mx-auto mb-3" />
          <h4 className="text-lg font-semibold mb-1">Carbon Tracker</h4>
          <p className="text-sm text-slate-300">Monitor your carbon footprint</p>
        </Link>
      </div>
    </section>
  );
}