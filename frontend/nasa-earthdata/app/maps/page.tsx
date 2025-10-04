'use client';

import { useContext, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Download, Layers, Thermometer, Eye, Zap, Cloud, Droplets, Wind, Search } from 'lucide-react';
import TopSpots from '../components/TopSpots';
import { LocationContext } from '../contexts/LocationContext';
import SearchBar from '../components/maps/SearchBar';
import MapTypeSelector from '../components/maps/MapTypeSelector';
import SearchedCitiesComparison from '../components/maps/SearchedCitiesComparison';
import MapLegend from '../components/maps/MapLegend';
import ForecastItem from '../components/maps/ForecastItem';
import { getAQIColor, getAQIDescription } from '../utils/aqiUtils';

interface CityAQIData {
  location: string;
  aqi: number;
  category: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  pm25: number;
  o3: number;
  latitude: number;
  longitude: number;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedCities, setSearchedCities] = useState<CityAQIData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionTimeout, setSuggestionTimeout] = useState<NodeJS.Timeout | null>(null);

  const searchCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      // Since we don't have the backend, use dummy data
      // In real implementation, this would be:
      // const response = await fetch('/api/v1/air-quality/location', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ location: cityName, ...weatherData })
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dummy data based on city name
      const dummyData: CityAQIData = {
        location: cityName,
        aqi: Math.floor(Math.random() * 150) + 20, // Random AQI 20-170
        category: 'Good', // Will be set below
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        pressure: 1013 + Math.floor(Math.random() * 20) - 10, // 1003-1023
        wind_speed: Math.floor(Math.random() * 20) + 5, // 5-25 mph
        pm25: Math.floor(Math.random() * 50) + 5, // 5-55
        o3: Math.floor(Math.random() * 50) + 10, // 10-60
        latitude: 40 + Math.random() * 20 - 10, // Random lat around US
        longitude: -120 + Math.random() * 40 - 20, // Random lng around US
      };

      // Set category based on AQI
      if (dummyData.aqi <= 50) dummyData.category = 'Good';
      else if (dummyData.aqi <= 100) dummyData.category = 'Moderate';
      else if (dummyData.aqi <= 150) dummyData.category = 'Unhealthy for Sensitive Groups';
      else dummyData.category = 'Unhealthy';

      // Check if city already exists
      const existingIndex = searchedCities.findIndex(city => city.location.toLowerCase() === cityName.toLowerCase());
      if (existingIndex >= 0) {
        // Update existing
        const updatedCities = [...searchedCities];
        updatedCities[existingIndex] = dummyData;
        setSearchedCities(updatedCities);
      } else {
        // Add new
        setSearchedCities(prev => [...prev, dummyData]);
      }
      setSearchQuery('');
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to fetch air quality data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const removeCity = (location: string) => {
    setSearchedCities(prev => prev.filter(city => city.location !== location));
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      console.log('Fetching suggestions for:', query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=US&addressdetails=1&dedupe=1`
      );
      const data = await response.json();
      console.log('Suggestions received:', data);
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    console.log('Suggestion selected:', suggestion);
    const cityName = suggestion.display_name.split(',')[0]; // Get the main city name
    setSearchQuery(cityName);
    setShowSuggestions(false);
    searchCity(cityName);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSearchError(null);

    // Clear existing timeout
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce

    setSuggestionTimeout(timeout);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Test function to verify API is working
  const testAPI = async () => {
    try {
      console.log('Testing Nominatim API...');
      const testQuery = 'New York';
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testQuery)}&limit=3&countrycodes=US`;
      console.log('API URL:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Test Result:', data);
      console.log('Number of results:', data.length);

      // Also test with the actual fetchSuggestions function
      console.log('Testing fetchSuggestions with "New York"...');
      await fetchSuggestions('New York');

      return data;
    } catch (error) {
      console.error('API Test Failed:', error);
      return null;
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      searchCity(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
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
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Interactive maps showing real-time air quality data from NASA's TEMPO mission.
            Explore different visualization types and download data for analysis.
          </p>
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={handleInputChange}
            onSearchSubmit={searchCity}
            isSearching={isSearching}
            searchError={searchError}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            onSuggestionSelect={handleSuggestionSelect}
            isLoadingSuggestions={isLoadingSuggestions}
          />
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

        {/* Searched Cities Comparison */}
        {searchedCities.length > 0 && (
          <SearchedCitiesComparison
            searchedCities={searchedCities}
            onRemoveCity={removeCity}
          />
        )}

        {/* Map Type Selector */}
        <MapTypeSelector
          mapTypes={mapTypes}
          selectedMapType={selectedMapType}
          onMapTypeChange={setSelectedMapType}
        />

        {/* Air Quality Map */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Interactive Air Quality Map</h3>
          <AQIMap
            userLocation={userLocation}
            dummyAQIData={dummyAQIData}
            getAQIColor={getAQIColor}
            getAQIDescription={getAQIDescription}
            mapType={selectedMapType}
            onCitySelect={(cityName, lat, lng) => {
              // Automatically search for the selected city
              searchCity(cityName);
            }}
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <button onClick={downloadCSV} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download AQI Data (CSV)
              </button>
            </div>
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[1,3,6].map(h => {
                const predictedAQI = predictAQIInHours(h);
                return (
                  <ForecastItem
                    key={h}
                    hours={h}
                    aqi={predictedAQI}
                    description={getAQIDescription(predictedAQI ?? 0)}
                    color={getAQIColor(predictedAQI ?? 0)}
                  />
                );
              })}
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
        <MapLegend />
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