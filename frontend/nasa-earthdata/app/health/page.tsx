'use client';

import { Activity, Heart, Shield, AlertTriangle, Eye, Phone, Info } from 'lucide-react';

const healthSuggestions = [
  'For asthma patients: Current AQI is moderate. Use inhaler if needed and avoid outdoor activities during peak pollution hours.',
  'Breathing exercises: Practice diaphragmatic breathing to improve lung capacity.',
  'Stay hydrated: Drink plenty of water to help your respiratory system.',
  'Monitor symptoms: Keep track of coughing, wheezing, or shortness of breath.',
  'Wear masks: Use N95 masks during high pollution days.',
  'Indoor air quality: Use air purifiers and keep windows closed during poor air quality.',
  'Exercise timing: Schedule outdoor activities for times with better air quality.',
  'Dietary support: Include anti-inflammatory foods like fruits and vegetables in your diet.',
];

const emergencyContacts = [
  { name: 'Air Quality Hotline', number: '1-800-AIR-HELP', description: '24/7 air quality emergency support' },
  { name: 'Local Health Department', number: '911', description: 'For immediate health emergencies' },
  { name: 'Poison Control', number: '1-800-222-1222', description: 'For chemical exposure concerns' },
  { name: 'Asthma & Allergy Foundation', number: '1-800-7-ASTHMA', description: 'Asthma and allergy support' },
];

const healthRiskLevels = [
  {
    level: 'Low Risk',
    color: 'green',
    aqiRange: '0-50',
    description: 'Air quality is good. Minimal health risks for everyone.',
    recommendations: [
      'Normal outdoor activities are safe',
      'No special precautions needed',
      'Good time for outdoor exercise'
    ]
  },
  {
    level: 'Moderate Risk',
    color: 'yellow',
    aqiRange: '51-100',
    description: 'Air quality is acceptable but may affect sensitive individuals.',
    recommendations: [
      'Sensitive groups should limit prolonged outdoor exertion',
      'Consider rescheduling outdoor activities if you have symptoms',
      'Monitor air quality forecasts'
    ]
  },
  {
    level: 'High Risk',
    color: 'orange',
    aqiRange: '101-150',
    description: 'Members of sensitive groups may experience health effects.',
    recommendations: [
      'Reduce outdoor activities',
      'Wear masks if going outside',
      'Keep windows closed and use air conditioning'
    ]
  },
  {
    level: 'Very High Risk',
    color: 'red',
    aqiRange: '151-200',
    description: 'Everyone may begin to experience health effects.',
    recommendations: [
      'Avoid outdoor activities',
      'Stay indoors with windows closed',
      'Use air purifiers indoors',
      'Follow health provider advice'
    ]
  },
  {
    level: 'Hazardous',
    color: 'purple',
    aqiRange: '201+',
    description: 'Health warning of emergency conditions affecting the entire population.',
    recommendations: [
      'Stay indoors',
      'Avoid all physical exertion',
      'Follow local health authority guidance',
      'Seek medical attention if experiencing symptoms'
    ]
  }
];

const vulnerableGroups = [
  {
    group: 'Children',
    icon: '👶',
    risks: 'Developing lungs are more susceptible to air pollutants',
    advice: 'Limit outdoor play during poor air quality days'
  },
  {
    group: 'Elderly',
    icon: '👴',
    risks: 'Age-related health conditions can be exacerbated',
    advice: 'Stay indoors and monitor health closely'
  },
  {
    group: 'Asthma/Respiratory',
    icon: '🫁',
    risks: 'Air pollutants can trigger attacks and worsen conditions',
    advice: 'Keep rescue inhaler handy and follow action plan'
  },
  {
    group: 'Heart Disease',
    icon: '❤️',
    risks: 'Poor air quality can affect cardiovascular health',
    advice: 'Consult doctor about activity restrictions'
  },
  {
    group: 'Pregnant Women',
    icon: '🤰',
    risks: 'Fetus development may be affected by pollutants',
    advice: 'Avoid exposure to high pollution areas'
  }
];

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Health & Air Quality
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Understand how air quality affects your health and get personalized recommendations
            to protect yourself and your loved ones from air pollution.
          </p>
        </section>

        {/* Current Health Risk Assessment */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-red-400" />
            Current Health Risk Assessment
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
                  Air quality is within safe limits.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Vulnerable Groups</h4>
              <div className="space-y-2">
                {vulnerableGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <div className="flex items-center space-x-2">
                      <span>{group.icon}</span>
                      <span className="text-sm font-medium">{group.group}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      index < 2 ? 'bg-yellow-500/20 text-yellow-400' :
                      index < 4 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {index < 2 ? 'Monitor' : index < 4 ? 'Caution' : 'High Risk'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Health Risk Levels */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-yellow-400" />
            Air Quality Health Risk Levels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthRiskLevels.map((level, index) => (
              <div key={index} className={`p-4 border rounded-lg ${
                level.color === 'green' ? 'border-green-500/30 bg-green-500/10' :
                level.color === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/10' :
                level.color === 'orange' ? 'border-orange-500/30 bg-orange-500/10' :
                level.color === 'red' ? 'border-red-500/30 bg-red-500/10' :
                'border-purple-500/30 bg-purple-500/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${
                    level.color === 'green' ? 'text-green-400' :
                    level.color === 'yellow' ? 'text-yellow-400' :
                    level.color === 'orange' ? 'text-orange-400' :
                    level.color === 'red' ? 'text-red-400' :
                    'text-purple-400'
                  }`}>{level.level}</span>
                  <span className="text-sm font-semibold">{level.aqiRange}</span>
                </div>
                <p className="text-xs text-gray-300 mb-3">{level.description}</p>
                <div className="space-y-1">
                  {level.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-gray-400 flex items-start">
                      <span className="mr-1">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Suggestions */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-red-400" />
            Health Protection Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Vulnerable Groups Details */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-400" />
            Vulnerable Groups Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vulnerableGroups.map((group, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-lg">
                <div className="text-3xl mb-3">{group.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{group.group}</h4>
                <p className="text-sm text-gray-300 mb-3">
                  <strong>Risks:</strong> {group.risks}
                </p>
                <p className="text-sm text-blue-300">
                  <strong>Advice:</strong> {group.advice}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Phone className="w-8 h-8 mr-3 text-red-400" />
            Emergency Contacts & Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Health Monitoring Tips */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <Info className="w-8 h-8 mr-3 text-purple-400" />
            Health Monitoring & Prevention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Daily Health Checklist</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Check local air quality index daily
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Monitor your breathing and energy levels
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Keep track of allergy or asthma symptoms
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Stay informed about weather patterns
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Plan outdoor activities for cleaner air days
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">When to Seek Medical Help</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  Difficulty breathing or chest tightness
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  Persistent coughing or wheezing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  Rapid heartbeat or dizziness
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  Symptoms worsen despite precautions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  Fever or other unusual symptoms
                </li>
              </ul>
            </div>
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