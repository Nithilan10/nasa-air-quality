from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
import datetime
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from schemas.alerts import (
    AlertRequest, AlertResponse, AlertSubscriptionRequest,
    AlertThresholdsResponse, AlertCheckRequest, AlertCheckResponse
)

router = APIRouter()

# Global model variable
rf_model = None

def load_rf_model():
    """Load Random Forest model for alerts"""
    global rf_model
    try:
        import joblib
        model_path = Path(__file__).parent.parent.parent / "models/metadata_model.pkl"
        rf_model = joblib.load(model_path)
        print("✅ Random Forest model loaded successfully")
        return rf_model
    except Exception as e:
        print(f"❌ Error loading Random Forest model: {e}")
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

def get_alert_level(aqi: float) -> str:
    """Get alert level based on AQI"""
    if aqi <= 50:
        return "GREEN"
    elif aqi <= 100:
        return "YELLOW"
    elif aqi <= 150:
        return "ORANGE"
    elif aqi <= 200:
        return "RED"
    else:
        return "PURPLE"

def get_alert_message(aqi: float, condition: Optional[str] = None, pollen_level: Optional[int] = None) -> str:
    """Generate alert message based on AQI and conditions"""
    aqi_category = get_aqi_category(aqi)
    
    if aqi <= 50:
        message = "Good air quality - safe for outdoor activities"
    elif aqi <= 100:
        message = "Moderate air quality - sensitive groups should limit outdoor exertion"
    elif aqi <= 150:
        message = "Unhealthy for sensitive groups - avoid prolonged outdoor activities"
    elif aqi <= 200:
        message = "Unhealthy - everyone should avoid outdoor activities"
    else:
        message = "Hazardous - stay indoors with windows closed"
    
    # Add condition-specific advice
    if condition:
        if condition in ["asthma", "copd"] and aqi > 50:
            message += f" - {condition.upper()} patients should stay indoors"
        elif condition == "heart_disease" and aqi > 100:
            message += " - Heart disease patients should avoid outdoor activities"
        elif condition == "elderly" and aqi > 100:
            message += " - Elderly should limit outdoor exposure"
    
    # Add pollen advice
    if pollen_level and pollen_level > 3:
        message += f" - High pollen levels ({pollen_level}/5) may worsen symptoms"
    
    return message

def get_alert_recommendations(aqi: float, condition: Optional[str] = None) -> List[str]:
    """Get specific recommendations based on alert level"""
    recommendations = []
    
    if aqi <= 50:
        recommendations = [
            "Enjoy outdoor activities",
            "Good time for outdoor exercise",
            "No special precautions needed"
        ]
    elif aqi <= 100:
        recommendations = [
            "Sensitive groups should limit outdoor exertion",
            "Consider indoor activities if you have respiratory conditions",
            "Monitor symptoms and reduce activity if breathing becomes difficult"
        ]
    elif aqi <= 150:
        recommendations = [
            "People with asthma should avoid prolonged outdoor exertion",
            "Children and adults with respiratory conditions should limit outdoor activities",
            "Consider staying indoors with windows closed",
            "Use air purifiers if available"
        ]
    elif aqi <= 200:
        recommendations = [
            "Everyone should avoid prolonged outdoor exertion",
            "People with asthma should avoid all outdoor activities",
            "Sensitive groups should remain indoors",
            "Close windows and doors",
            "Use air conditioning and air purifiers"
        ]
    else:
        recommendations = [
            "Everyone should avoid all outdoor activities",
            "Stay indoors with windows and doors closed",
            "Use air conditioning and air purifiers",
            "Consider evacuating to areas with better air quality",
            "Emergency conditions - follow local health advisories"
        ]
    
    # Add condition-specific recommendations
    if condition == "asthma":
        recommendations.extend([
            "Keep rescue inhaler readily available",
            "Avoid triggers like smoke and strong odors"
        ])
    elif condition == "copd":
        recommendations.extend([
            "Monitor oxygen saturation levels",
            "Use prescribed medications as directed"
        ])
    elif condition == "heart_disease":
        recommendations.extend([
            "Monitor blood pressure regularly",
            "Limit physical exertion"
        ])
    
    return recommendations

@router.get("/current/{location}", response_model=AlertResponse)
async def get_current_alerts(location: str):
    """Get current air quality alerts for a location"""
    # This would integrate with real-time data sources
    # For now, return a placeholder response
    return AlertResponse(
        location=location,
        alert_level="YELLOW",
        aqi=75,
        aqi_category="Moderate",
        message="Moderate air quality - sensitive groups should limit outdoor exertion",
        recommendations=[
            "Sensitive groups should limit outdoor exertion",
            "Consider indoor activities if you have respiratory conditions"
        ],
        timestamp=datetime.datetime.now().isoformat(),
        expires_at=(datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
    )

@router.post("/check", response_model=AlertCheckResponse)
async def check_air_quality_alerts(request: AlertCheckRequest):
    """Check air quality alerts based on current conditions"""
    try:
        aqi = request.aqi
        alert_level = get_alert_level(aqi)
        aqi_category = get_aqi_category(aqi)
        
        message = get_alert_message(
            aqi, 
            request.health_condition, 
            request.pollen_level
        )
        
        recommendations = get_alert_recommendations(aqi, request.health_condition)
        
        # Determine if alert should be triggered
        should_alert = False
        if request.health_condition:
            if request.health_condition in ["asthma", "copd", "children"] and aqi > 50:
                should_alert = True
            elif request.health_condition in ["heart_disease", "elderly"] and aqi > 100:
                should_alert = True
        else:
            should_alert = aqi > 100
        
        return AlertCheckResponse(
            location=request.location,
            alert_level=alert_level,
            aqi=aqi,
            aqi_category=aqi_category,
            message=message,
            recommendations=recommendations,
            should_alert=should_alert,
            severity_score=calculate_severity_score(aqi, request.health_condition, request.pollen_level),
            timestamp=datetime.datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert check error: {str(e)}")

@router.post("/subscribe")
async def subscribe_to_alerts(request: AlertSubscriptionRequest):
    """Subscribe to air quality alerts"""
    # This would integrate with a notification system
    return {
        "user_id": request.user_id,
        "location": request.location,
        "health_condition": request.health_condition,
        "alert_threshold": request.alert_threshold,
        "subscribed": True,
        "subscription_id": f"sub_{request.user_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    }

@router.get("/thresholds", response_model=AlertThresholdsResponse)
async def get_alert_thresholds():
    """Get air quality alert thresholds"""
    thresholds = {
        "GREEN": {"min": 0, "max": 50, "description": "Good"},
        "YELLOW": {"min": 51, "max": 100, "description": "Moderate"},
        "ORANGE": {"min": 101, "max": 150, "description": "Unhealthy for Sensitive Groups"},
        "RED": {"min": 151, "max": 200, "description": "Unhealthy"},
        "PURPLE": {"min": 201, "max": 500, "description": "Hazardous"}
    }
    
    health_condition_thresholds = {
        "asthma": 50,
        "copd": 50,
        "children": 50,
        "heart_disease": 100,
        "elderly": 100,
        "general": 100
    }
    
    return AlertThresholdsResponse(
        aqi_thresholds=thresholds,
        health_condition_thresholds=health_condition_thresholds,
        pollen_threshold=3
    )

def calculate_severity_score(aqi: float, condition: Optional[str] = None, pollen_level: Optional[int] = None) -> float:
    """Calculate severity score (0-10)"""
    score = 0
    
    # Base AQI score
    if aqi <= 50:
        score = 1
    elif aqi <= 100:
        score = 3
    elif aqi <= 150:
        score = 5
    elif aqi <= 200:
        score = 7
    else:
        score = 9
    
    # Adjust for health condition
    if condition in ["asthma", "copd", "children"]:
        score += 1
    elif condition in ["heart_disease", "elderly"]:
        score += 0.5
    
    # Adjust for pollen
    if pollen_level and pollen_level > 3:
        score += 0.5
    
    return min(10, score)