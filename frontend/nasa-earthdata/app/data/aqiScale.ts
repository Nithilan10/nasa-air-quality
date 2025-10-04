export const aqiScale = [
  { range: '0-50', level: 'Good', color: '#00e400', description: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
  { range: '51-100', level: 'Moderate', color: '#ffff00', description: 'Air quality is acceptable. However, there may be a risk for some people.' },
  { range: '101-150', level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Members of sensitive groups may experience health effects.' },
  { range: '151-200', level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects.' },
  { range: '201-300', level: 'Very Unhealthy', color: '#8f3f97', description: 'Health alert: everyone may experience more serious health effects.' },
  { range: '301+', level: 'Hazardous', color: '#7e0023', description: 'Health warning of emergency conditions. The entire population is more likely to be affected.' },
];