"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin } from 'lucide-react';

// NOTE: We intentionally avoid importing Leaflet CSS and running the
// L.Icon fixes at module top-level because that can trigger DOM access
// during server-side rendering or before the browser DOM is available.
// Instead we dynamically import them inside a client-only effect and
// render the MapContainer only after mount.

interface AQIMapProps {
  userLocation: [number, number] | null;
  dummyAQIData: Array<{ lat: number; lng: number; aqi: number }>;
  getAQIColor: (aqi: number) => string;
  getAQIDescription: (aqi: number) => string;
}

export default function AQIMap({ userLocation, dummyAQIData, getAQIColor, getAQIDescription }: AQIMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

  // Dynamically load the Leaflet CSS in the client
  // @ts-ignore - importing CSS dynamically; project may not have css module declarations
  import('leaflet/dist/leaflet.css').catch((err) => console.error('Failed loading leaflet css', err));

    // Fix default marker icon paths for Leaflet (client-only)
    import('leaflet')
      .then((L) => {
        try {
          // typescript shim
          const anyL = L as any;
          if (anyL && anyL.Icon && anyL.Icon.Default) {
            try {
              delete anyL.Icon.Default.prototype._getIconUrl;
            } catch (e) {
              // not critical
            }
            anyL.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
          }
        } catch (err) {
          console.error('Error applying leaflet icon defaults', err);
        }
      })
      .catch((err) => console.error('Failed loading leaflet', err));

    // Mark component as mounted so we only create the map in the browser
    setIsMounted(true);
  }, []);

  if (!userLocation) {
    return (
      <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <p className="text-white/70">Loading map and getting your location...</p>
          <p className="text-sm text-white/50">Please allow location access for accurate data</p>
        </div>
      </div>
    );
  }
  // Only render the MapContainer once we're mounted in the browser.
  // This avoids DOM-related errors like "appendChild of undefined" that
  // happen when Leaflet tries to attach to a container that doesn't
  // exist yet (or during SSR).
  if (!isMounted) {
    return (
      <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <p className="text-white/70">Preparing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ borderRadius: 12 }}>
      {/* Floating legend */}
      <div className="absolute z-50 top-4 left-4 bg-black/50 text-white rounded-lg p-3 text-xs backdrop-blur-sm w-44">
        <div className="font-semibold mb-2">AQI Legend</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between"><span>Good</span><span style={{ color: '#00e400' }}>0-50</span></div>
          <div className="flex items-center justify-between"><span>Moderate</span><span style={{ color: '#ffff00' }}>51-100</span></div>
          <div className="flex items-center justify-between"><span>Unhealthy SG</span><span style={{ color: '#ff7e00' }}>101-150</span></div>
          <div className="flex items-center justify-between"><span>Unhealthy</span><span style={{ color: '#ff0000' }}>151-200</span></div>
        </div>
      </div>

      <MapContainer center={userLocation} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>
          <div className="text-center">
            <strong>Your Location</strong>
            <br />
            AQI: 42 (Good)
          </div>
        </Popup>
      </Marker>
      {/* Dummy AQI data markers */}
      {dummyAQIData.map((point, index) => (
        <Circle
          key={index}
          center={[point.lat, point.lng]}
          radius={500}
          pathOptions={{
            color: getAQIColor(point.aqi),
            fillColor: getAQIColor(point.aqi),
            fillOpacity: 0.6,
          }}
        >
          <Popup>
            <div className="text-center">
              <strong>AQI: {point.aqi}</strong>
              <br />
              {getAQIDescription(point.aqi)}
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
      {/* subtle gradient overlay to add 'heatmap' feel (purely visual) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent mix-blend-overlay" />
    </div>
  );
}