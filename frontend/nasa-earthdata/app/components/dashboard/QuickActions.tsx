"use client";

import Link from 'next/link';
import { MapPin, Heart, Zap } from 'lucide-react';

export default function QuickActions() {
  return (
    <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/maps" className="p-6 bg-blue-700 rounded-xl text-center hover:bg-blue-600 transition-all">
          <MapPin className="w-12 h-12 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">View Maps</h4>
          <p className="text-sm opacity-80">Explore air quality maps and data</p>
        </Link>
        <Link href="/health" className="p-6 bg-red-800 rounded-xl text-center hover:bg-red-700 transition-all">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">Health Tips</h4>
          <p className="text-sm opacity-80">Health recommendations and alerts</p>
        </Link>
        <Link href="/carbon" className="p-6 bg-green-800 rounded-xl text-center hover:bg-green-700 transition-all">
          <Zap className="w-12 h-12 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">Carbon Tracker</h4>
          <p className="text-sm opacity-80">Monitor your carbon footprint</p>
        </Link>
      </div>
    </section>
  );
}