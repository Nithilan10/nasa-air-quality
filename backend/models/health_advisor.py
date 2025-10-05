from fastapi import APIRouter, HTTPException
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import torch
from pathlib import Path
from typing import List, Dict
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from schemas.health import (
    HealthRecommendationRequest, HealthRecommendationResponse,
    HealthConditionResponse,
    PersonalizedHealthRequest, PersonalizedHealthResponse
)

router = APIRouter()

# Global model variables
gpt_tokenizer = None
gpt_model = None

def load_gpt_model():
    """Load GPT-2 model for health recommendations"""
    global gpt_tokenizer, gpt_model
    try:
        model_path = Path(__file__).parent.parent.parent / "models/gpt_text_model"
        gpt_tokenizer = GPT2Tokenizer.from_pretrained(model_path)
        gpt_model = GPT2LMHeadModel.from_pretrained(model_path)
        gpt_tokenizer.pad_token = gpt_tokenizer.eos_token
        print("✅ GPT-2 model loaded successfully")
        return gpt_model, gpt_tokenizer
    except Exception as e:
        print(f"❌ Error loading GPT-2 model: {e}")
        return None, None

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

def generate_health_recommendation(condition: str, aqi: float, pollen_level: int) -> str:
    """Generate health recommendation using GPT-2 model"""
    if gpt_model is None or gpt_tokenizer is None:
        return get_fallback_recommendation(condition, aqi, pollen_level)
    
    try:
        prompt = f"Air Quality Health Recommendations for {condition} patients with AQI {aqi} and pollen level {pollen_level}:"
        
        inputs = gpt_tokenizer.encode(prompt, return_tensors="pt", max_length=100, truncation=True)
        
        with torch.no_grad():
            outputs = gpt_model.generate(
                inputs,
                max_length=inputs.shape[1] + 50,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=gpt_tokenizer.eos_token_id
            )
        
        recommendation = gpt_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return recommendation[len(prompt):].strip()
    except Exception as e:
        print(f"GPT-2 generation error: {e}")
        return get_fallback_recommendation(condition, aqi, pollen_level)

def get_fallback_recommendation(condition: str, aqi: float, pollen_level: int) -> str:
    """Fallback recommendations when GPT-2 is not available"""
    aqi_category = get_aqi_category(aqi)
    
    recommendations = {
        "asthma": {
            "Good": "Safe for outdoor activities. Keep rescue inhaler handy.",
            "Moderate": "Limit prolonged outdoor exertion. Monitor symptoms.",
            "Unhealthy for Sensitive Groups": "Avoid outdoor activities. Stay indoors with windows closed.",
            "Unhealthy": "Stay indoors. Use air purifier if available.",
            "Very Unhealthy": "Remain indoors. Consider relocating to cleaner air area.",
            "Hazardous": "Emergency conditions - stay indoors with windows closed."
        },
        "copd": {
            "Good": "Generally safe for light outdoor activities.",
            "Moderate": "Limit outdoor activities. Monitor breathing.",
            "Unhealthy for Sensitive Groups": "Avoid outdoor activities. Use oxygen if prescribed.",
            "Unhealthy": "Stay indoors. Monitor oxygen levels.",
            "Very Unhealthy": "Remain indoors. Contact healthcare provider if symptoms worsen.",
            "Hazardous": "Emergency conditions - stay indoors and contact healthcare provider."
        },
        "heart_disease": {
            "Good": "Safe for normal activities. Monitor heart rate.",
            "Moderate": "Limit strenuous activities. Monitor symptoms.",
            "Unhealthy for Sensitive Groups": "Avoid outdoor activities. Monitor blood pressure.",
            "Unhealthy": "Stay indoors. Rest and monitor vital signs.",
            "Very Unhealthy": "Remain indoors. Contact healthcare provider if needed.",
            "Hazardous": "Emergency conditions - stay indoors and contact healthcare provider."
        },
        "elderly": {
            "Good": "Safe for outdoor activities with moderation.",
            "Moderate": "Limit outdoor activities. Stay hydrated.",
            "Unhealthy for Sensitive Groups": "Avoid outdoor activities. Stay indoors.",
            "Unhealthy": "Stay indoors. Monitor health closely.",
            "Very Unhealthy": "Remain indoors. Contact healthcare provider if symptoms develop.",
            "Hazardous": "Emergency conditions - stay indoors and contact healthcare provider."
        }
    }
    
    base_recommendation = recommendations.get(condition, {}).get(aqi_category, "Monitor symptoms and consult healthcare provider.")
    
    if pollen_level > 3:
        base_recommendation += f" High pollen levels ({pollen_level}/5) may worsen symptoms."
    
    return base_recommendation

@router.post("/recommendations", response_model=HealthRecommendationResponse)
async def get_health_recommendations(request: HealthRecommendationRequest):
    """Get health recommendations based on condition and air quality"""
    try:
        recommendation = generate_health_recommendation(
            request.condition, 
            request.aqi, 
            request.pollen_level
        )
        
        aqi_category = get_aqi_category(request.aqi)
        
        return HealthRecommendationResponse(
            condition=request.condition,
            aqi=request.aqi,
            aqi_category=aqi_category,
            pollen_level=request.pollen_level,
            recommendation=recommendation,
            severity_level=get_severity_level(request.aqi, request.condition),
            additional_tips=get_additional_tips(request.condition, request.aqi)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@router.get("/conditions", response_model=HealthConditionResponse)
async def get_health_conditions():
    """Get list of supported health conditions"""
    conditions = [
        {
            "condition": "asthma",
            "description": "Chronic respiratory condition affecting airways",
            "sensitivity_level": "High",
            "aqi_threshold": 50
        },
        {
            "condition": "copd",
            "description": "Chronic Obstructive Pulmonary Disease",
            "sensitivity_level": "High",
            "aqi_threshold": 50
        },
        {
            "condition": "heart_disease",
            "description": "Cardiovascular conditions",
            "sensitivity_level": "Medium",
            "aqi_threshold": 100
        },
        {
            "condition": "elderly",
            "description": "General elderly population (65+)",
            "sensitivity_level": "Medium",
            "aqi_threshold": 100
        },
        {
            "condition": "children",
            "description": "Children under 18",
            "sensitivity_level": "High",
            "aqi_threshold": 50
        }
    ]
    
    return HealthConditionResponse(conditions=conditions)

@router.post("/personalized", response_model=PersonalizedHealthResponse)
async def get_personalized_health_advice(request: PersonalizedHealthRequest):
    """Get personalized health advice based on multiple factors"""
    try:
        # Generate base recommendation
        base_recommendation = generate_health_recommendation(
            request.condition,
            request.aqi,
            request.pollen_level
        )
        
        # Add personalized factors
        personalized_tips = []
        
        if request.age and request.age > 65:
            personalized_tips.append("As an elderly person, monitor symptoms more closely.")
        
        if request.has_rescue_inhaler:
            personalized_tips.append("Keep your rescue inhaler readily available.")
        
        if request.uses_oxygen:
            personalized_tips.append("Monitor your oxygen levels more frequently.")
        
        if request.outdoor_activities:
            personalized_tips.append("Consider rescheduling outdoor activities for better air quality days.")
        
        aqi_category = get_aqi_category(request.aqi)
        
        return PersonalizedHealthResponse(
            condition=request.condition,
            aqi=request.aqi,
            aqi_category=aqi_category,
            pollen_level=request.pollen_level,
            base_recommendation=base_recommendation,
            personalized_tips=personalized_tips,
            severity_level=get_severity_level(request.aqi, request.condition),
            emergency_contact_needed=request.aqi > 200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personalized advice error: {str(e)}")

def get_severity_level(aqi: float, condition: str) -> str:
    """Determine severity level based on AQI and condition"""
    if aqi <= 50:
        return "Low"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "High" if condition in ["asthma", "copd", "children"] else "Moderate"
    elif aqi <= 200:
        return "High"
    else:
        return "Critical"

def get_additional_tips(condition: str, aqi: float) -> List[str]:
    """Get additional tips based on condition and AQI"""
    tips = []
    
    if condition == "asthma":
        tips.extend([
            "Keep rescue inhaler within reach",
            "Avoid triggers like smoke and strong odors",
            "Use air purifier in your home"
        ])
    elif condition == "copd":
        tips.extend([
            "Monitor oxygen saturation levels",
            "Use prescribed medications as directed",
            "Avoid exposure to respiratory irritants"
        ])
    elif condition == "heart_disease":
        tips.extend([
            "Monitor blood pressure regularly",
            "Limit physical exertion during poor air quality",
            "Stay hydrated and rest adequately"
        ])
    
    if aqi > 100:
        tips.extend([
            "Close windows and doors",
            "Use air conditioning with clean filters",
            "Consider wearing N95 mask if going outside"
        ])
    
    return tips