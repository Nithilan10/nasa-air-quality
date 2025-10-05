'use client';

import { useState } from 'react';
import { Zap, TrendingDown, Target, Leaf, Car, Home, Utensils, Plane, Cloud, Thermometer, Droplets, Wind } from 'lucide-react';

const carbonReductionTips = [
  {
    category: 'Transportation',
    icon: Car,
    tips: [
      'Use public transportation or carpooling',
      'Switch to electric or hybrid vehicles',
      'Combine errands into one trip',
      'Walk or bike for short distances',
      'Maintain proper tire pressure for better fuel efficiency'
    ]
  },
  {
    category: 'Home Energy',
    icon: Home,
    tips: [
      'Switch to LED lighting',
      'Unplug electronics when not in use',
      'Use energy-efficient appliances',
      'Improve home insulation',
      'Install a programmable thermostat'
    ]
  },
  {
    category: 'Diet',
    icon: Utensils,
    tips: [
      'Reduce meat consumption, especially red meat',
      'Choose locally sourced foods',
      'Minimize food waste',
      'Eat more plant-based meals',
      'Buy in bulk to reduce packaging'
    ]
  },
  {
    category: 'Travel',
    icon: Plane,
    tips: [
      'Take direct flights when possible',
      'Choose train over plane for shorter distances',
      'Offset carbon emissions from travel',
      'Use video conferencing instead of business travel',
      'Plan trips during off-peak seasons'
    ]
  }
];

const carbonProjects = [
  {
    name: 'Reforestation Initiative',
    description: 'Planting trees to absorb CO2 and restore ecosystems',
    impact: '1 tree absorbs ~48 lbs CO2 per year',
    cost: '$10/tree'
  },
  {
    name: 'Solar Farm Development',
    description: 'Investing in renewable energy infrastructure',
    impact: '1 MWh solar power offsets ~2,200 lbs CO2',
    cost: '$0.10/kWh offset'
  },
  {
    name: 'Ocean Cleanup',
    description: 'Removing plastic pollution from waterways',
    impact: 'Prevents marine ecosystem damage',
    cost: '$5/lb plastic removed'
  },
  {
    name: 'Methane Capture',
    description: 'Capturing methane from landfills and farms',
    impact: 'Methane is 25x more potent than CO2',
    cost: '$2-5/ton captured'
  }
];

export default function CarbonPage() {
  // Carbon Footprint Calculator State
  const [commuteDistance, setCommuteDistance] = useState<number>(20); // km per day
  const [transportMode, setTransportMode] = useState<string>('car'); // car, bus, train, bike, walk
  const [meatConsumption, setMeatConsumption] = useState<number>(7); // servings per week
  const [electricityUsage, setElectricityUsage] = useState<number>(300); // kWh per month
  const [wasteGeneration, setWasteGeneration] = useState<number>(5); // kg per week
  const [airTravel, setAirTravel] = useState<number>(2); // flights per year
  const [carbonGoal, setCarbonGoal] = useState<number>(300); // monthly goal in kg CO2

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4 text-blue-100">
            Carbon Footprint Tracker
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Monitor your carbon emissions and discover ways to reduce your environmental impact.
            Every action counts in the fight against climate change.
          </p>
        </section>

  {/* Current Air Quality Summary */}
  {/* <section className="bg-gradient-to-br from-slate-900/65 to-slate-800/50 border border-white/6 rounded-2xl p-6 shadow-lg">
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
        </section> */}

        {/* Carbon Footprint Calculator */}
  <section className="bg-gradient-to-br from-slate-900/75 to-slate-800/65 border border-white/6 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-400" />
            Carbon Footprint Calculator
          </h3>

          {/* Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* Daily Commute */}
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-slate-800/60 rounded-lg p-4">
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
            <div className="bg-orange-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.daily}kg</div>
              <div className="text-sm opacity-80">Daily CO₂</div>
            </div>
            <div className="bg-red-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.weekly}kg</div>
              <div className="text-sm opacity-80">Weekly CO₂</div>
            </div>
            <div className="bg-pink-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{currentCarbonFootprint.monthly}kg</div>
              <div className="text-sm opacity-80">Monthly CO₂</div>
            </div>
            <div className="bg-purple-800 rounded-xl p-6 text-center">
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

        {/* Carbon Reduction Tips */}
  <section className="bg-gradient-to-br from-slate-900/75 to-slate-800/65 border border-white/6 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Leaf className="w-8 h-8 mr-3 text-green-400" />
            Carbon Reduction Strategies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carbonReductionTips.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-slate-800/60 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="w-6 h-6 mr-3 text-green-400" />
                    <h4 className="text-lg font-semibold">{category.category}</h4>
                  </div>
                  <ul className="space-y-2">
                    {category.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Carbon Offset Projects */}
  <section className="bg-gradient-to-br from-slate-900/75 to-slate-800/65 border border-white/6 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Target className="w-8 h-8 mr-3 text-blue-400" />
            Carbon Offset Projects
          </h3>
          <p className="text-gray-300 mb-6">
            Support verified carbon offset projects to neutralize your remaining emissions.
            These projects provide additional environmental and social benefits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carbonProjects.map((project, index) => (
              <div key={index} className="bg-slate-800/60 rounded-lg p-6 border border-white/10">
                <h4 className="text-lg font-semibold mb-2">{project.name}</h4>
                <p className="text-sm text-gray-300 mb-3">{project.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-green-400">{project.impact}</div>
                    <div className="text-sm text-gray-400">{project.cost}</div>
                  </div>
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingDown className="w-8 h-8 mr-3 text-cyan-400" />
            Your Environmental Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {Math.round(currentCarbonFootprint.monthly * 12 / 1000)} tons
              </div>
              <div className="text-sm text-gray-300">Annual CO₂ Emissions</div>
              <div className="text-xs text-gray-400 mt-1">Equivalent to driving {Math.round(currentCarbonFootprint.monthly * 12 / 0.12 / 1000)} km in a car</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {Math.round(currentCarbonFootprint.monthly * 12 / 200)} trees
              </div>
              <div className="text-sm text-gray-300">Trees needed to offset</div>
              <div className="text-xs text-gray-400 mt-1">One tree absorbs ~48 lbs CO₂ per year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {Math.round((currentCarbonFootprint.monthly / currentCarbonFootprint.goal - 1) * 100)}%
              </div>
              <div className="text-sm text-gray-300">Goal Achievement</div>
              <div className="text-xs text-gray-400 mt-1">
                {currentCarbonFootprint.monthly <= currentCarbonFootprint.goal ? 'On track!' : 'Room for improvement'}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Powered by NASA's TEMPO Mission • Earth Science Division • Carbon Footprint Awareness
          </p>
        </div>
      </footer>
    </div>
  );
}