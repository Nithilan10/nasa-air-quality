'use client';

import { AlertTriangle, Cloud, Droplets, Wind, MapPin, Bell, TrendingUp, Heart, Thermometer, Eye, Zap, Activity, Shield, Phone, Info, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const AQIMap = dynamic(() => import('./components/AQIMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-white/50" />
        <p className="text-white/70">Loading map...</p>
      </div>
    </div>
  ),
});

const forecastData = [
  { time: '00:00', aqi: 45, temp: 22, humidity: 60 },
  { time: '06:00', aqi: 52, temp: 20, humidity: 65 },
  { time: '12:00', aqi: 38, temp: 28, humidity: 45 },
  { time: '18:00', aqi: 65, temp: 25, humidity: 55 },
  { time: '24:00', aqi: 58, temp: 23, humidity: 62 },
];

const notifications = [
  { id: 1, message: 'Air quality deteriorating in your area - consider staying indoors', type: 'warning' },
  { id: 2, message: 'High pollen count expected tomorrow - asthma patients take note', type: 'info' },
  { id: 3, message: 'Good air quality window: 10 AM - 2 PM', type: 'success' },
];

const healthSuggestions = [
  'For asthma patients: Current AQI is moderate. Use inhaler if needed and avoid outdoor activities during peak pollution hours.',
  'Breathing exercises: Practice diaphragmatic breathing to improve lung capacity.',
  'Stay hydrated: Drink plenty of water to help your respiratory system.',
  'Monitor symptoms: Keep track of coughing, wheezing, or shortness of breath.',
];

const historicalAQIData = [
  { date: '2025-09-25', aqi: 35 },
  { date: '2025-09-26', aqi: 42 },
  { date: '2025-09-27', aqi: 38 },
  { date: '2025-09-28', aqi: 55 },
  { date: '2025-09-29', aqi: 48 },
  { date: '2025-09-30', aqi: 52 },
  { date: '2025-10-01', aqi: 42 },
];

const emergencyContacts = [
  { name: 'Air Quality Hotline', number: '1-800-AIR-HELP', description: '24/7 air quality emergency support' },
  { name: 'Local Health Department', number: '911', description: 'For immediate health emergencies' },
  { name: 'Poison Control', number: '1-800-222-1222', description: 'For chemical exposure concerns' },
];

const aqiScale = [
  { range: '0-50', level: 'Good', color: '#00e400', description: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
  { range: '51-100', level: 'Moderate', color: '#ffff00', description: 'Air quality is acceptable. However, there may be a risk for some people.' },
  { range: '101-150', level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Members of sensitive groups may experience health effects.' },
  { range: '151-200', level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects.' },
  { range: '201-300', level: 'Very Unhealthy', color: '#8f3f97', description: 'Health alert: everyone may experience more serious health effects.' },
  { range: '301+', level: 'Hazardous', color: '#7e0023', description: 'Health warning of emergency conditions. The entire population is more likely to be affected.' },
];

export default function Home() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [dummyAQIData, setDummyAQIData] = useState<Array<{ lat: number; lng: number; aqi: number }>>([]);
  const [userCity, setUserCity] = useState<string>('Detecting location...');

  // Carbon Footprint Calculator State
  const [commuteDistance, setCommuteDistance] = useState<number>(20); // km per day
  const [transportMode, setTransportMode] = useState<string>('car'); // car, bus, train, bike, walk
  const [meatConsumption, setMeatConsumption] = useState<number>(7); // servings per week
  const [electricityUsage, setElectricityUsage] = useState<number>(300); // kWh per month
  const [wasteGeneration, setWasteGeneration] = useState<number>(5); // kg per week
  const [airTravel, setAirTravel] = useState<number>(2); // flights per year
  const [carbonGoal, setCarbonGoal] = useState<number>(300); // monthly goal in kg CO2

  // Notification System State
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeNotifications, setActiveNotifications] = useState(notifications);

  // Refs + positioning for portal dropdown
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateDropdownPosition = () => {
    const bell = bellRef.current;
    const dd = dropdownRef.current;
    if (!bell || !dd) return;

    const rect = bell.getBoundingClientRect();
    // Position dropdown directly below the bell, centered horizontally to match original look
    const top = rect.bottom + window.scrollY + 8; // small gap
    const left = rect.left + window.scrollX - (320 - rect.width) + rect.width; // keep right-aligned similar to original
    setDropdownPos({ top, left });
  };

  useEffect(() => {
    if (!showNotifications) return;
    updateDropdownPosition();

    const onResize = () => updateDropdownPosition();
    const onScroll = () => updateDropdownPosition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  // close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!showNotifications) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && bellRef.current && !bellRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showNotifications]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          // Generate dummy AQI data points around user location
          const points = [];
          for (let i = 0; i < 20; i++) {
            const latOffset = (Math.random() - 0.5) * 0.1; // ~5-10km radius
            const lngOffset = (Math.random() - 0.5) * 0.1;
            const aqi = Math.floor(Math.random() * 100) + 20; // 20-120 AQI
            points.push({
              lat: latitude + latOffset,
              lng: longitude + lngOffset,
              aqi,
            });
          }
          setDummyAQIData(points);

          // Get city name from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
              const state = data.address.state || data.address.region;
              const country = data.address.country;
              
              if (city && state) {
                setUserCity(`${city}, ${state}`);
              } else if (city) {
                setUserCity(city);
              } else if (state) {
                setUserCity(state);
              } else {
                setUserCity(country || 'Unknown Location');
              }
            } else {
              setUserCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            }
          } catch (error) {
            console.error('Error fetching location name:', error);
            setUserCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Los Angeles if geolocation fails
          setUserLocation([34.0522, -118.2437]);
          setUserCity('Los Angeles, CA');
          const points = [];
          for (let i = 0; i < 20; i++) {
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;
            const aqi = Math.floor(Math.random() * 100) + 20;
            points.push({
              lat: 34.0522 + latOffset,
              lng: -118.2437 + lngOffset,
              aqi,
            });
          }
          setDummyAQIData(points);
        }
      );
    }
  }, []);

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

  // Carbon Footprint Calculator
  const calculateCarbonFootprint = () => {
    // Emission factors (kg CO2 per unit)
    const transportFactors = {
      car: 0.12, // kg CO2 per km
      bus: 0.04,
      train: 0.03,
      bike: 0,
      walk: 0
    };

    const meatFactor = 7.0; // kg CO2 per serving per week
    const electricityFactor = 0.4; // kg CO2 per kWh
    const wasteFactor = 0.5; // kg CO2 per kg waste per week
    const airTravelFactor = 200; // kg CO2 per flight per year

    // Daily calculations
    const dailyTransport = commuteDistance * transportFactors[transportMode as keyof typeof transportFactors];
    const dailyMeat = (meatConsumption / 7) * meatFactor;
    const dailyElectricity = (electricityUsage / 30) * electricityFactor;
    const dailyWaste = (wasteGeneration / 7) * wasteFactor;
    const dailyAirTravel = airTravel / 365;

    const dailyTotal = dailyTransport + dailyMeat + dailyElectricity + dailyWaste + dailyAirTravel;

    return {
      daily: Math.round(dailyTotal * 10) / 10,
      weekly: Math.round(dailyTotal * 7 * 10) / 10,
      monthly: Math.round(dailyTotal * 30 * 10) / 10,
      goal: carbonGoal
    };
  };

  const currentCarbonFootprint = calculateCarbonFootprint();

  // Notification functions
  const dismissNotification = (id: number) => {
    setActiveNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <Shield className="w-5 h-5 text-green-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  // Auto-generate notifications based on air quality
  useEffect(() => {
    const currentAQI = 42; // This would come from actual AQI data
    const newNotifications: Array<{id: number, message: string, type: string}> = [];

    if (currentAQI > 100) {
      newNotifications.push({
        id: Date.now() + 1,
        message: `⚠️ High air pollution alert! AQI is ${currentAQI} (${getAQIDescription(currentAQI)}). Stay indoors and wear a mask.`,
        type: 'warning'
      });
    } else if (currentAQI > 50) {
      newNotifications.push({
        id: Date.now() + 2,
        message: `📍 Moderate air quality. AQI: ${currentAQI}. Sensitive individuals should take precautions.`,
        type: 'info'
      });
    } else {
      newNotifications.push({
        id: Date.now() + 3,
        message: `✅ Good air quality today! AQI: ${currentAQI}. Perfect for outdoor activities.`,
        type: 'success'
      });
    }

    // Add time-based notifications
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 9) {
      newNotifications.push({
        id: Date.now() + 4,
        message: '🌅 Morning air quality check: Monitor pollen levels if you have allergies.',
        type: 'info'
      });
    }

    // Only add new notifications if they don't already exist
    setActiveNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...uniqueNew];
    });
  }, []); // Run once on mount, could be modified to run periodically

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="p-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TEMPO Air Quality Monitor
          </h1>
          <div className="flex items-center space-x-4">
            <MapPin className="w-6 h-6" />
            <span className="text-sm">{userCity}</span>
            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={(el) => { bellRef.current = el; return undefined; }}
                onClick={() => {
                  if (!showNotifications) updateDropdownPosition();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown rendered in portal to escape stacking contexts */}
                {showNotifications && bellRef.current && createPortal(
                <div
                  ref={(el) => { dropdownRef.current = el; }}
                  style={{
                    position: 'absolute',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: 320,
                    zIndex: 99999,
                  }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Air Quality Alerts</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {activeNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      activeNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 last:border-b-0 ${getNotificationStyle(notification.type)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {activeNotifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={() => setActiveNotifications([])}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>,
                // render into body
                document.body
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Revolutionizing Air Quality Monitoring
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harnessing NASA's TEMPO mission data to provide real-time air quality forecasts,
            integrating ground measurements and weather data for better public health decisions.
            Special focus on respiratory health and carbon footprint awareness.
          </p>
        </section>

        {/* Current Air Quality */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Cloud className="w-8 h-8 mr-3 text-blue-400" />
            Current Air Quality & Weather
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">42</div>
              <div className="text-sm opacity-80">AQI Index</div>
              <div className="text-xs mt-2">Good</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">24°C</div>
              <div className="text-sm opacity-80">Temperature</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">65%</div>
              <div className="text-sm opacity-80">Humidity</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-center">
              <Wind className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">12 mph</div>
              <div className="text-sm opacity-80">Wind Speed</div>
            </div>
          </div>
        </section>

        {/* Forecast Chart */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-green-400" />
            24-Hour Forecast
          </h3>
          <div className="space-y-4">
            {forecastData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold w-16">{data.time}</span>
                  <div className="flex space-x-6 text-sm">
                    <span>AQI: <span className={`font-bold ${data.aqi > 50 ? 'text-red-400' : 'text-green-400'}`}>{data.aqi}</span></span>
                    <span>Temp: {data.temp}°C</span>
                    <span>Humidity: {data.humidity}%</span>
                  </div>
                </div>
                <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${data.aqi > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(data.aqi / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Air Quality Map */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Air Quality Map</h3>
          <AQIMap
            userLocation={userLocation}
            dummyAQIData={dummyAQIData}
            getAQIColor={getAQIColor}
            getAQIDescription={getAQIDescription}
          />
          <p className="text-sm text-gray-400 mt-4 text-center">
            Real-time AQI levels across your area (dummy data based on TEMPO mission)
          </p>
        </section>

        {/* Air Quality Trends */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-400" />
            7-Day Air Quality Trends
          </h3>
          <div className="space-y-4">
            {historicalAQIData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="font-medium">{new Date(data.date).toLocaleDateString()}</span>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${data.aqi > 50 ? 'text-red-400' : 'text-green-400'}`}>
                    AQI: {data.aqi}
                  </span>
                  <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data.aqi > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${(data.aqi / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              📈 Trend: Air quality has been stable this week with occasional moderate spikes.
              Average AQI: 46 (Good)
            </p>
          </div>
        </section>

        {/* Health Risk Assessment */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-red-400" />
            Health Risk Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Current Risk Level</h4>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-semibold">Low Risk</span>
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-sm mt-2 text-gray-300">
                  Current AQI (42) poses minimal health risks for most people.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Vulnerable Groups</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-yellow-500/20 rounded">
                  <span className="text-sm">Children</span>
                  <span className="text-yellow-400 text-sm">Monitor</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-500/20 rounded">
                  <span className="text-sm">Elderly</span>
                  <span className="text-orange-400 text-sm">Caution</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-500/20 rounded">
                  <span className="text-sm">Asthma/Respiratory</span>
                  <span className="text-red-400 text-sm">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Health Suggestions for Breathing Conditions */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-red-400" />
            Health Suggestions for Breathing Conditions
          </h3>
          <div className="space-y-4">
            {healthSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start">
                  <Eye className="w-5 h-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Carbon Footprint Tracker */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-400" />
            Carbon Footprint Calculator
          </h3>

          {/* Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* Daily Commute */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Daily Commute Distance</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={commuteDistance || ''}
                  onChange={(e) => setCommuteDistance(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="1"
                  placeholder="0"
                />
                <span className="text-sm text-gray-300">km</span>
              </div>
            </div>

            {/* Transportation Mode */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Transportation Mode</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <option value="car" style={{ color: 'black', backgroundColor: 'white' }}>🚗 Car</option>
                <option value="bus" style={{ color: 'black', backgroundColor: 'white' }}>🚌 Bus</option>
                <option value="train" style={{ color: 'black', backgroundColor: 'white' }}>🚆 Train</option>
                <option value="bike" style={{ color: 'black', backgroundColor: 'white' }}>🚴‍♂️ Bike</option>
                <option value="walk" style={{ color: 'black', backgroundColor: 'white' }}>🚶‍♂️ Walk</option>
              </select>
            </div>

            {/* Meat Consumption */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Meat Servings/Week</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={meatConsumption || ''}
                  onChange={(e) => setMeatConsumption(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="1"
                  placeholder="0"
                />
                <span className="text-sm text-gray-300">servings</span>
              </div>
            </div>

            {/* Electricity Usage */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Electricity Usage</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={electricityUsage || ''}
                  onChange={(e) => setElectricityUsage(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="10"
                  placeholder="0"
                />
                <span className="text-sm text-gray-300">kWh/month</span>
              </div>
            </div>

            {/* Waste Generation */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Waste Generation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={wasteGeneration || ''}
                  onChange={(e) => setWasteGeneration(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
                <span className="text-sm text-gray-300">kg/week</span>
              </div>
            </div>

            {/* Air Travel */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Air Travel</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={airTravel || ''}
                  onChange={(e) => setAirTravel(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="1"
                  placeholder="0"
                />
                <span className="text-sm text-gray-300">flights/year</span>
              </div>
            </div>

            {/* Carbon Goal */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Monthly Carbon Goal</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={carbonGoal || ''}
                  onChange={(e) => setCarbonGoal(Number(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50"
                  min="0"
                  step="10"
                  placeholder="300"
                />
                <span className="text-sm text-gray-300">kg CO₂</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.daily}kg</div>
              <div className="text-sm opacity-80">Daily CO₂</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.weekly}kg</div>
              <div className="text-sm opacity-80">Weekly CO₂</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.monthly}kg</div>
              <div className="text-sm opacity-80">Monthly CO₂</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.goal}kg</div>
              <div className="text-sm opacity-80">Monthly Goal</div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Goal</span>
              <span>{Math.round((currentCarbonFootprint.monthly / currentCarbonFootprint.goal) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentCarbonFootprint.monthly <= currentCarbonFootprint.goal
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((currentCarbonFootprint.monthly / currentCarbonFootprint.goal) * 100, 100)}%`
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Adjust your lifestyle choices above to see real-time changes in your carbon footprint.
              Lower emissions mean cleaner air for everyone, especially those with respiratory conditions.
            </p>
          </div>
        </section>

        {/* AQI Scale Information */}
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

        {/* Emergency Contacts */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Phone className="w-8 h-8 mr-3 text-red-400" />
            Emergency Contacts
          </h3>
          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-400">{contact.name}</h4>
                    <p className="text-sm text-gray-300">{contact.description}</p>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Powered by NASA's TEMPO Mission • Earth Science Division • Focus on Respiratory Health
          </p>
        </div>
      </footer>
    </div>
  );
}
