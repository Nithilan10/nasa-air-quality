from pydantic import BaseModel, Field
from typing import List, Optional

class ForecastRequest(BaseModel):
    location: str = Field(..., description="Location name")
    base_temperature: float = Field(..., description="Base temperature in Celsius", ge=-50, le=60)
    base_humidity: float = Field(..., description="Base humidity percentage", ge=0, le=100)
    base_pressure: float = Field(..., description="Base atmospheric pressure in hPa", ge=800, le=1100)
    base_wind_speed: float = Field(..., description="Base wind speed in m/s", ge=0, le=50)
    base_pm25: float = Field(..., description="Base PM2.5 concentration in μg/m³", ge=0, le=500)
    base_o3: float = Field(..., description="Base O3 concentration in ppb", ge=0, le=500)

class HourlyForecast(BaseModel):
    hour: int = Field(..., description="Hour of day (0-23)")
    aqi: float = Field(..., description="Predicted AQI value")
    category: str = Field(..., description="AQI category")
    temperature: float = Field(..., description="Predicted temperature")
    humidity: float = Field(..., description="Predicted humidity")

class ForecastResponse(BaseModel):
    location: str = Field(..., description="Location name")
    forecast_hours: int = Field(..., description="Number of forecast hours")
    hourly_forecasts: List[HourlyForecast] = Field(..., description="Hourly forecast data")
    average_aqi: float = Field(..., description="Average AQI over forecast period")
    max_aqi: float = Field(..., description="Maximum AQI in forecast")
    min_aqi: float = Field(..., description="Minimum AQI in forecast")