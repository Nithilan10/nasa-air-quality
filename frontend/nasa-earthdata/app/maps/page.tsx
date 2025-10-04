'use client';

import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Download, Layers, Thermometer, Eye, Zap, Cloud, Droplets, Wind } from 'lucide-react';
import TopSpots from '../components/TopSpots';
import { LocationContext } from '../contexts/LocationContext';

// Dynamically import the map component to avoid SSR issues
const AQIMap = dynamic(() => import('../components/AQIMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-700 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
        <p className="text-white/70">Loading map...</p>
      </div>
    </div>
  ),
});

const mapTypes = [
  { id: 'aqi', name: 'Air Quality Index', icon: Eye, description: 'Standard AQI visualization with colored circles' },
  { id: 'heatmap', name: 'Heat Map', icon: Thermometer, description: 'Smooth gradient visualization showing pollution intensity' },
  { id: 'pollutants', name: 'Pollutant Sources', icon: Zap, description: 'Major pollution source markers and hotspots' },
];

export default function MapsPage() {
  const { userLocation, dummyAQIData } = useContext(LocationContext);
  const [selectedMapType, setSelectedMapType] = useState('aqi');

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400'; // Good - green
    if (aqi <= 100) return '#ffff00'; // Moderate - yellow
    if (aqi <= 150) return '#ff7e00'; // Unhealthy for sensitive groups - orange
    if (aqi <= 200) return '#ff0000'; // Unhealthy - red
    if (aqi <= 300) return '#8f3f97'; // Very unhealthy - purple
    return '#7e0023'; // Hazardous - maroon
  };

  const getAQIDescription = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // CSV export of dummy AQI data
  const downloadCSV = () => {
    if (!dummyAQIData || dummyAQIData.length === 0) return;
    const header = ['lat,lng,aqi'];
    const rows = dummyAQIData.map(d => `${d.lat},${d.lng},${d.aqi}`);
    const csv = header.concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dummy_aqi_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Very small demo 'prediction' based on simple moving average of nearby dummy points
  const predictAQIInHours = (hours: number) => {
    if (!dummyAQIData || dummyAQIData.length === 0) return null;
    // simple forecast: take median and add a small diurnal pattern
    const vals = dummyAQIData.map(d => d.aqi);
    const median = vals.sort((a,b) => a-b)[Math.floor(vals.length/2)];
    const diurnal = Math.round(10 * Math.sin((hours / 24) * Math.PI * 2));
    return Math.max(0, median + diurnal + Math.round((Math.random() - 0.5) * 8));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4 text-blue-100">
            Air Quality Maps
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive maps showing real-time air quality data from NASA's TEMPO mission.
            Explore different visualization types and download data for analysis.
          </p>
        </section>

        {/* Current Air Quality Summary */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Cloud className="w-8 h-8 mr-3 text-blue-400" />
            Current Air Quality & Weather
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-800 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">42</div>
              <div className="text-sm opacity-80">AQI Index</div>
              <div className="text-xs mt-2">Good</div>
            </div>
            <div className="bg-slate-700 rounded-xl p-6 text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">24°C</div>
              <div className="text-sm opacity-80">Temperature</div>
            </div>
            <div className="bg-blue-700 rounded-xl p-6 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">65%</div>
              <div className="text-sm opacity-80">Humidity</div>
            </div>
            <div className="bg-slate-600 rounded-xl p-6 text-center">
              <Wind className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">12 mph</div>
              <div className="text-sm opacity-80">Wind Speed</div>
            </div>
          </div>
        </section>

        {/* Map Type Selector */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Layers className="w-8 h-8 mr-3 text-blue-400" />
            Map Visualization Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedMapType(type.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedMapType === type.id
                      ? 'border-cyan-400 bg-cyan-400/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
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

        {/* Air Quality Map */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Interactive Air Quality Map</h3>
          <AQIMap
            userLocation={userLocation}
            dummyAQIData={dummyAQIData}
            getAQIColor={getAQIColor}
            getAQIDescription={getAQIDescription}
            mapType={selectedMapType}
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <button onClick={downloadCSV} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download AQI Data (CSV)
              </button>
            </div>
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[1,3,6].map(h => (
                <div key={h} className="p-3 bg-white/5 rounded flex items-center justify-between">
                  <div>
                    <div className="text-sm">In {h}h</div>
                    <div className="font-semibold text-lg">{predictAQIInHours(h) ?? '—'}</div>
                    <div className="text-xs text-gray-300">{getAQIDescription(predictAQIInHours(h) ?? 0)}</div>
                  </div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getAQIColor(predictAQIInHours(h) ?? 0) }} />
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center">
            {selectedMapType === 'aqi' && 'Real-time AQI levels across your region (dummy data based on TEMPO mission). Circles show air quality zones covering ~80km radius.'}
            {selectedMapType === 'heatmap' && 'Heat map visualization showing pollution intensity across the region. Brighter and larger areas indicate higher pollution levels.'}
            {selectedMapType === 'pollutants' && 'Pollution source markers highlighting major emission points. Only high-pollution areas (AQI > 100) are shown with industrial (IND), traffic (TRF), and other (OTH) sources.'}
          </p>
        </section>

        {/* Top Polluted Spots */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <TopSpots dummyAQIData={dummyAQIData} getAQIColor={getAQIColor} />
        </section>

        {/* Map Legend */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Map Legend & Information</h3>
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
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• NASA's TEMPO Mission satellite data</li>
                <li>• Ground-based air quality monitors</li>
                <li>• Weather station integrations</li>
                <li>• Real-time pollutant measurements</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Powered by NASA's TEMPO Mission • Earth Science Division • Real-time Air Quality Monitoring
          </p>
        </div>
      </footer>
    </div>
  );
}