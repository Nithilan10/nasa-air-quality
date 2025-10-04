/**
 * Utility functions for Air Quality Index (AQI) calculations and display
 */

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#00e400'; // Good - green
  if (aqi <= 100) return '#ffff00'; // Moderate - yellow
  if (aqi <= 150) return '#ff7e00'; // Unhealthy for sensitive groups - orange
  if (aqi <= 200) return '#ff0000'; // Unhealthy - red
  if (aqi <= 300) return '#8f3f97'; // Very unhealthy - purple
  return '#7e0023'; // Hazardous - maroon
};

export const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getAQICategory = (aqi: number): { level: string; color: string; description: string } => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: '#00e400',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.'
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Moderate',
      color: '#ffff00',
      description: 'Air quality is acceptable. However, there may be a risk for some people.'
    };
  }
  if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: '#ff7e00',
      description: 'Members of sensitive groups may experience health effects.'
    };
  }
  if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      color: '#ff0000',
      description: 'Everyone may begin to experience health effects.'
    };
  }
  if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      color: '#8f3f97',
      description: 'Health alert: everyone may experience more serious health effects.'
    };
  }
  return {
    level: 'Hazardous',
    color: '#7e0023',
    description: 'Health warning of emergency conditions. The entire population is more likely to be affected.'
  };
};