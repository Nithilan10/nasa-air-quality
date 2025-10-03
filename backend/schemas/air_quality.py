from pydantic import BaseModel, Field
from typing import Optional

class AQIPredictionRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius", ge=-50, le=60)
    humidity: float = Field(..., description="Humidity percentage", ge=0, le=100)
    pressure: float = Field(..., description="Atmospheric pressure in hPa", ge=800, le=1100)
    wind_speed: float = Field(..., description="Wind speed in m/s", ge=0, le=50)
    pm25: float = Field(..., description="PM2.5 concentration in μg/m³", ge=0, le=500)
    o3: float = Field(..., description="Ozone concentration in ppb", ge=0, le=500)

class AQIPredictionResponse(BaseModel):
    aqi: float = Field(..., description="Predicted AQI value")
    category: str = Field(..., description="AQI category (Good, Moderate, etc.)")
    temperature: float = Field(..., description="Input temperature")
    humidity: float = Field(..., description="Input humidity")
    pressure: float = Field(..., description="Input pressure")
    wind_speed: float = Field(..., description="Input wind speed")
    pm25: float = Field(..., description="Input PM2.5")
    o3: float = Field(..., description="Input O3")

class LocationAQIRequest(BaseModel):
    location: str = Field(..., description="Location name")
    latitude: Optional[float] = Field(None, description="Latitude", ge=-90, le=90)
    longitude: Optional[float] = Field(None, description="Longitude", ge=-180, le=180)
    temperature: float = Field(..., description="Temperature in Celsius", ge=-50, le=60)
    humidity: float = Field(..., description="Humidity percentage", ge=0, le=100)
    pressure: float = Field(..., description="Atmospheric pressure in hPa", ge=800, le=1100)
    wind_speed: float = Field(..., description="Wind speed in m/s", ge=0, le=50)
    pm25: float = Field(..., description="PM2.5 concentration in μg/m³", ge=0, le=500)
    o3: float = Field(..., description="Ozone concentration in ppb", ge=0, le=500)

class LocationAQIResponse(BaseModel):
    location: str = Field(..., description="Location name")
    aqi: float = Field(..., description="Predicted AQI value")
    category: str = Field(..., description="AQI category")
    temperature: float = Field(..., description="Temperature")
    humidity: float = Field(..., description="Humidity")
    pressure: float = Field(..., description="Pressure")
    wind_speed: float = Field(..., description="Wind speed")
    pm25: float = Field(..., description="PM2.5")
    o3: float = Field(..., description="O3")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")