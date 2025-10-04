import requests
import os
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

class WeatherService:
    def __init__(self):
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY", "")
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(self, location: str) -> Optional[Dict]:
        """Get current weather data for a location"""
        try:
            if not self.openweather_api_key:
                return None
            
            # Geocoding to get coordinates
            geocode_url = f"{self.base_url}/weather"
            params = {
                "q": location,
                "appid": self.openweather_api_key,
                "units": "metric"
            }
            
            response = requests.get(geocode_url, params=params)
            if response.status_code == 200:
                data = response.json()
                return {
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "wind_speed": data["wind"]["speed"],
                    "location": data["name"],
                    "country": data["sys"]["country"]
                }
        except Exception as e:
            print(f"Weather service error: {e}")
            return None
    
    async def get_weather_by_coordinates(self, lat: float, lon: float) -> Optional[Dict]:
        """Get weather data by coordinates"""
        try:
            if not self.openweather_api_key:
                return None
            
            url = f"{self.base_url}/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.openweather_api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return {
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "wind_speed": data["wind"]["speed"],
                    "location": data["name"],
                    "country": data["sys"]["country"]
                }
        except Exception as e:
            print(f"Weather service error: {e}")
            return None