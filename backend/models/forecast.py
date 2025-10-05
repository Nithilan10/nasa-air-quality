from fastapi import APIRouter, HTTPException
import tensorflow as tf
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Optional
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from schemas.forecast import ForecastRequest, ForecastResponse, HourlyForecast

router = APIRouter()

# Global model variable
lstm_model = None

def load_lstm_model():
    """Load LSTM model"""
    global lstm_model
    try:
        model_path = Path(__file__).parent.parent.parent / "models/lstm_model.h5"
        lstm_model = tf.keras.models.load_model(model_path, compile=False)
        print("✅ LSTM model loaded successfully")
        return lstm_model
    except Exception as e:
        print(f"❌ Error loading LSTM model: {e}")
        return None

def get_aqi_category(aqi: float) -> str:
    """Convert AQI to category"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def create_forecast_sequence(request: ForecastRequest) -> np.ndarray:
    """Create 24-hour sequence for LSTM prediction"""
    # Load training data for reference
    training_data_path = Path(__file__).parent.parent.parent / "data/ml_ready/enhanced_training_dataset.csv"
    training_data = pd.read_csv(training_data_path, low_memory=False)
    
    numeric_cols = training_data.select_dtypes(include=['number']).columns.tolist()
    feature_cols = [col for col in numeric_cols if col not in ['AQI']]
    
    # Create 24-hour sequence
    sequence = np.zeros((24, len(feature_cols)))
    
    for hour in range(24):
        # Simulate daily patterns
        temp = request.base_temperature + 5 * np.sin((hour - 6) * np.pi / 12)
        humidity = request.base_humidity + 10 * np.cos((hour - 6) * np.pi / 12)
        pressure = request.base_pressure + 5 * np.sin(hour * np.pi / 6)
        wind_speed = request.base_wind_speed + np.sin(hour * np.pi / 12) * 2
        
        # Map to features
        feature_mapping = {
            'main.temp': temp,
            'main.humidity': humidity,
            'main.pressure': pressure,
            'wind.speed': wind_speed
        }
        
        for i, col in enumerate(feature_cols):
            if col in feature_mapping:
                sequence[hour, i] = feature_mapping[col]
            elif 'pm25' in col.lower():
                sequence[hour, i] = request.base_pm25 + np.random.random() * 10
            elif 'o3' in col.lower():
                sequence[hour, i] = request.base_o3 + np.random.random() * 15
            else:
                sequence[hour, i] = training_data[col].median()
    
    return sequence.reshape(1, 24, -1)

@router.post("/24hour", response_model=ForecastResponse)
async def get_24hour_forecast(request: ForecastRequest):
    """Get 24-hour air quality forecast"""
    if lstm_model is None:
        raise HTTPException(status_code=500, detail="LSTM model not loaded")
    
    try:
        # Create forecast sequence
        sequence = create_forecast_sequence(request)
        
        # Make prediction
        forecast = lstm_model.predict(sequence, verbose=0)
        
        # Generate hourly forecasts
        hourly_forecasts = []
        for hour in range(24):
            # Use forecast value or simulate variation
            aqi = forecast[0][0] + np.random.random() * 10 - 5  # Add some variation
            aqi = max(0, aqi)  # Ensure non-negative
            
            hourly_forecasts.append(HourlyForecast(
                hour=hour,
                aqi=round(aqi, 1),
                category=get_aqi_category(aqi),
                temperature=request.base_temperature + 5 * np.sin((hour - 6) * np.pi / 12),
                humidity=request.base_humidity + 10 * np.cos((hour - 6) * np.pi / 12)
            ))
        
        return ForecastResponse(
            location=request.location,
            forecast_hours=24,
            hourly_forecasts=hourly_forecasts,
            average_aqi=round(np.mean([f.aqi for f in hourly_forecasts]), 1),
            max_aqi=round(max([f.aqi for f in hourly_forecasts]), 1),
            min_aqi=round(min([f.aqi for f in hourly_forecasts]), 1)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")

@router.get("/24hour/{location}")
async def get_location_forecast(location: str):
    """Get 24-hour forecast for a specific location"""
    # This would integrate with weather APIs for real-time data
    return {
        "location": location,
        "message": "Weather API integration needed",
        "suggestion": "Use /24hour endpoint with current weather data"
    }