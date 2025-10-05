from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Optional
import sys
import os

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from schemas.air_quality import AQIPredictionRequest, AQIPredictionResponse, LocationAQIRequest, LocationAQIResponse

router = APIRouter()

# Global model variable
xgb_model = None

def load_xgb_model():
    """Load XGBoost model"""
    global xgb_model
    try:
        model_path = Path(__file__).parent.parent.parent / "models/xgb_model.pkl"
        xgb_model = joblib.load(model_path)
        print("✅ XGBoost model loaded successfully")
        return xgb_model
    except Exception as e:
        print(f"❌ Error loading XGBoost model: {e}")
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

def create_feature_vector(request: AQIPredictionRequest) -> np.ndarray:
    """Create feature vector for prediction"""
    # Load training data for reference
    training_data_path = Path(__file__).parent.parent.parent / "data/ml_ready/enhanced_training_dataset.csv"
    training_data = pd.read_csv(training_data_path, low_memory=False)
    
    numeric_cols = training_data.select_dtypes(include=['number']).columns.tolist()
    feature_cols = [col for col in numeric_cols if col not in ['AQI']]
    features = np.zeros(len(feature_cols))
    
    # Map request data to features
    feature_mapping = {
        'main.temp': request.temperature,
        'main.humidity': request.humidity,
        'main.pressure': request.pressure,
        'wind.speed': request.wind_speed
    }
    
    for i, col in enumerate(feature_cols):
        if col in feature_mapping:
            features[i] = feature_mapping[col]
        elif 'pm25' in col.lower():
            features[i] = request.pm25
        elif 'o3' in col.lower():
            features[i] = request.o3
        else:
            # Use median value from training data
            features[i] = training_data[col].median()
    
    return features

@router.post("/predict", response_model=AQIPredictionResponse)
async def predict_aqi(request: AQIPredictionRequest):
    """Predict AQI based on weather and pollution data"""
    if xgb_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        features = create_feature_vector(request)
        aqi_pred = xgb_model.predict([features])[0]
        category = get_aqi_category(aqi_pred)
        
        return AQIPredictionResponse(
            aqi=round(aqi_pred, 1),
            category=category,
            temperature=request.temperature,
            humidity=request.humidity,
            pressure=request.pressure,
            wind_speed=request.wind_speed,
            pm25=request.pm25,
            o3=request.o3
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/location", response_model=LocationAQIResponse)
async def get_location_aqi(request: LocationAQIRequest):
    """Get AQI for a specific location with current weather"""
    if xgb_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Create prediction request from location data
        aqi_request = AQIPredictionRequest(
            temperature=request.temperature,
            humidity=request.humidity,
            pressure=request.pressure,
            wind_speed=request.wind_speed,
            pm25=request.pm25,
            o3=request.o3
        )
        
        features = create_feature_vector(aqi_request)
        aqi_pred = xgb_model.predict([features])[0]
        category = get_aqi_category(aqi_pred)
        
        return LocationAQIResponse(
            location=request.location,
            aqi=round(aqi_pred, 1),
            category=category,
            temperature=request.temperature,
            humidity=request.humidity,
            pressure=request.pressure,
            wind_speed=request.wind_speed,
            pm25=request.pm25,
            o3=request.o3,
            latitude=request.latitude,
            longitude=request.longitude
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location prediction error: {str(e)}")

@router.get("/current/{location}")
async def get_current_aqi(location: str):
    """Get current AQI for a location (placeholder for real-time data)"""
    # This would integrate with real-time data sources
    return {
        "location": location,
        "message": "Real-time data integration needed",
        "suggestion": "Use /predict endpoint with current weather data"
    }
