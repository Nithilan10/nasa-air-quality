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
  mapType?: string;
}

export default function AQIMap({ userLocation, dummyAQIData, getAQIColor, getAQIDescription, mapType = 'aqi' }: AQIMapProps) {
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
      <div className="h-64 bg-slate-700 rounded-xl flex items-center justify-center">
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
      <div className="h-64 bg-slate-700 rounded-xl flex items-center justify-center">
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
        <div className="font-semibold mb-2">
          {mapType === 'aqi' && 'AQI Legend'}
          {mapType === 'heatmap' && 'Heat Map'}
          {mapType === 'pollutants' && 'Pollution Sources'}
        </div>
        {mapType === 'aqi' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span>Good</span><span style={{ color: '#00e400' }}>0-50</span></div>
            <div className="flex items-center justify-between"><span>Moderate</span><span style={{ color: '#ffff00' }}>51-100</span></div>
            <div className="flex items-center justify-between"><span>Unhealthy SG</span><span style={{ color: '#ff7e00' }}>101-150</span></div>
            <div className="flex items-center justify-between"><span>Unhealthy</span><span style={{ color: '#ff0000' }}>151-200</span></div>
          </div>
        )}
        {mapType === 'heatmap' && (
          <div className="space-y-2">
            <div className="text-xs text-gray-300">Heat intensity scale:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs">Low</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00e400', opacity: 0.6 }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffff00', opacity: 0.6 }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff7e00', opacity: 0.6 }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff0000', opacity: 0.6 }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8f3f97', opacity: 0.6 }}></div>
                </div>
                <span className="text-xs">High</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Click points for details</div>
          </div>
        )}
        {mapType === 'pollutants' && (
          <div className="space-y-1">
            <div className="text-xs text-gray-300">Pollution source types:</div>
            <div className="text-xs text-gray-300">• IND: Industrial areas</div>
            <div className="text-xs text-gray-300">• TRF: Traffic congestion</div>
            <div className="text-xs text-gray-300">• OTH: Other sources</div>
          </div>
        )}
      </div>

      <MapContainer center={userLocation} zoom={10} style={{ height: '400px', width: '100%' }}>
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

      {/* Render data based on map type */}
      {mapType === 'aqi' && dummyAQIData.map((point, index) => (
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

      {mapType === 'heatmap' && dummyAQIData.map((point, index) => {
        const intensity = Math.min(point.aqi / 200, 1); // Normalize to 0-1, cap at 1
        const baseRadius = 200;
        const maxRadius = 1000;

        return (
          <div key={`heatmap-${index}`}>
            {/* Outer glow circle for smooth blending */}
            <Circle
              center={[point.lat, point.lng]}
              radius={baseRadius + (intensity * (maxRadius - baseRadius)) * 1.5}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 0.1 * intensity,
                weight: 0,
                stroke: false,
              }}
            />
            {/* Main heat circle */}
            <Circle
              center={[point.lat, point.lng]}
              radius={baseRadius + (intensity * (maxRadius - baseRadius))}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 0.4 * intensity,
                weight: 0,
                stroke: false,
              }}
            />
            {/* Medium intensity circle */}
            <Circle
              center={[point.lat, point.lng]}
              radius={(baseRadius + (intensity * (maxRadius - baseRadius))) * 0.6}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 0.7 * intensity,
                weight: 0,
                stroke: false,
              }}
            />
            {/* High intensity center */}
            <Circle
              center={[point.lat, point.lng]}
              radius={(baseRadius + (intensity * (maxRadius - baseRadius))) * 0.3}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 0.9 * intensity,
                weight: 0,
                stroke: false,
              }}
            />
            {/* Bright center point */}
            <Circle
              center={[point.lat, point.lng]}
              radius={30}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 1,
                weight: 2,
                stroke: true,
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>Heat Intensity: {point.aqi}</strong>
                  <br />
                  {getAQIDescription(point.aqi)}
                  <br />
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(point.aqi / 200) * 100}%`,
                        backgroundColor: getAQIColor(point.aqi)
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click to explore area
                  </div>
                </div>
              </Popup>
            </Circle>
          </div>
        );
      })}

      {mapType === 'pollutants' && dummyAQIData
        .filter(point => point.aqi > 100) // Only show high pollution areas
        .map((point, index) => {
          const pollutionType = point.aqi > 150 ? 'IND' : point.aqi > 120 ? 'TRF' : 'OTH';
          const pollutionColor = point.aqi > 150 ? '#ff4444' : point.aqi > 120 ? '#ff8800' : '#ffaa00';
          return (
            <Marker
              key={index}
              position={[point.lat, point.lng]}
              icon={new (window as any).L.Icon({
                iconUrl: `data:image/svg+xml;base64,${btoa(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="${getAQIColor(point.aqi)}" stroke="white" stroke-width="2"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial">${pollutionType}</text>
                  </svg>
                `)}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })}
            >
              <Popup>
                <div className="text-center">
                  <strong>Pollution Source</strong>
                  <br />
                  AQI: {point.aqi} ({getAQIDescription(point.aqi)})
                  <br />
                  <span className="text-sm">
                    {point.aqi > 150 ? 'Industrial Area' : point.aqi > 120 ? 'Traffic Congestion' : 'Other Source'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })
      }
    </MapContainer>
    </div>
  );
}