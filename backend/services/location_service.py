from typing import Dict, Optional, Tuple
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class LocationService:
    def __init__(self):
        self.opencage_api_key = os.getenv("OPENCAGE_API_KEY", "")
        self.base_url = "https://api.opencagedata.com/geocode/v1/json"
    
    async def geocode_location(self, location: str) -> Optional[Tuple[float, float]]:
        """Convert location name to coordinates"""
        try:
            if not self.opencage_api_key:
                return None
            
            params = {
                "q": location,
                "key": self.opencage_api_key,
                "limit": 1
            }
            
            response = requests.get(self.base_url, params=params)
            if response.status_code == 200:
                data = response.json()
                if data["results"]:
                    result = data["results"][0]
                    lat = result["geometry"]["lat"]
                    lon = result["geometry"]["lng"]
                    return (lat, lon)
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    
    async def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        """Convert coordinates to location name"""
        try:
            if not self.opencage_api_key:
                return None
            
            params = {
                "q": f"{lat},{lon}",
                "key": self.opencage_api_key,
                "limit": 1
            }
            
            response = requests.get(self.base_url, params=params)
            if response.status_code == 200:
                data = response.json()
                if data["results"]:
                    result = data["results"][0]
                    return result["formatted"]
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return None
    
    def validate_coordinates(self, lat: float, lon: float) -> bool:
        """Validate coordinate ranges"""
        return -90 <= lat <= 90 and -180 <= lon <= 180