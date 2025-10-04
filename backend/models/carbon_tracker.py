from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel
import datetime

from schemas.carbon import (
    CarbonCalculationRequest, CarbonCalculationResponse,
    CarbonTrackingRequest, CarbonTrackingResponse,
    CarbonHistoryResponse, CarbonUpdateRequest
)

router = APIRouter()

# In-memory storage for demo (use database in production)
carbon_data = {}

def calculate_transportation_co2(daily_miles: float, public_transit_usage: float, 
                                electric_vehicle_usage: float = 0.0) -> float:
    """Calculate daily transportation CO2 emissions in kg"""
    # Gasoline car: ~0.4 kg CO2 per mile
    # Public transit: ~0.1 kg CO2 per mile
    # Electric vehicle: ~0.05 kg CO2 per mile
    
    gas_miles = daily_miles * (1 - public_transit_usage - electric_vehicle_usage)
    transit_miles = daily_miles * public_transit_usage
    ev_miles = daily_miles * electric_vehicle_usage
    
    co2 = (gas_miles * 0.4) + (transit_miles * 0.1) + (ev_miles * 0.05)
    return round(co2, 2)

def calculate_food_co2(meat_consumption: float, dairy_consumption: float, 
                      vegetable_consumption: float) -> float:
    """Calculate daily food CO2 emissions in kg"""
    # Meat: ~25 kg CO2 per kg
    # Dairy: ~10 kg CO2 per kg  
    # Vegetables: ~2 kg CO2 per kg
    
    co2 = (meat_consumption * 25) + (dairy_consumption * 10) + (vegetable_consumption * 2)
    return round(co2, 2)

def calculate_consumer_co2(electronics_purchases: float, clothing_purchases: float,
                          furniture_purchases: float) -> float:
    """Calculate monthly consumer CO2 emissions in kg (converted to daily)"""
    # Electronics: ~200 kg CO2 per purchase
    # Clothing: ~50 kg CO2 per purchase
    # Furniture: ~300 kg CO2 per purchase
    
    monthly_co2 = (electronics_purchases * 200) + (clothing_purchases * 50) + (furniture_purchases * 300)
    daily_co2 = monthly_co2 / 30  # Convert to daily
    return round(daily_co2, 2)

def get_carbon_category(total_daily_co2: float) -> str:
    """Categorize carbon footprint"""
    if total_daily_co2 < 20:
        return "Low"
    elif total_daily_co2 < 40:
        return "Medium"
    elif total_daily_co2 < 60:
        return "High"
    else:
        return "Very High"

@router.post("/calculate", response_model=CarbonCalculationResponse)
async def calculate_carbon_footprint(request: CarbonCalculationRequest):
    """Calculate carbon footprint based on lifestyle data"""
    try:
        # Calculate each component
        transport_co2 = calculate_transportation_co2(
            request.daily_miles, 
            request.public_transit_usage,
            request.electric_vehicle_usage
        )
        
        food_co2 = calculate_food_co2(
            request.meat_consumption,
            request.dairy_consumption,
            request.vegetable_consumption
        )
        
        consumer_co2 = calculate_consumer_co2(
            request.electronics_purchases,
            request.clothing_purchases,
            request.furniture_purchases
        )
        
        total_daily_co2 = transport_co2 + food_co2 + consumer_co2
        category = get_carbon_category(total_daily_co2)
        
        return CarbonCalculationResponse(
            total_daily_co2=total_daily_co2,
            category=category,
            breakdown={
                "transportation": transport_co2,
                "food": food_co2,
                "consumer": consumer_co2
            },
            recommendations=get_carbon_recommendations(total_daily_co2, category)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@router.post("/track", response_model=CarbonTrackingResponse)
async def track_carbon_footprint(request: CarbonTrackingRequest):
    """Track carbon footprint over time"""
    try:
        # Calculate current footprint
        calc_request = CarbonCalculationRequest(
            daily_miles=request.daily_miles,
            public_transit_usage=request.public_transit_usage,
            electric_vehicle_usage=request.electric_vehicle_usage,
            meat_consumption=request.meat_consumption,
            dairy_consumption=request.dairy_consumption,
            vegetable_consumption=request.vegetable_consumption,
            electronics_purchases=request.electronics_purchases,
            clothing_purchases=request.clothing_purchases,
            furniture_purchases=request.furniture_purchases
        )
        
        calculation = await calculate_carbon_footprint(calc_request)
        
        # Store in memory (use database in production)
        user_id = request.user_id
        if user_id not in carbon_data:
            carbon_data[user_id] = []
        
        entry = {
            "date": datetime.datetime.now().isoformat(),
            "total_daily_co2": calculation.total_daily_co2,
            "category": calculation.category,
            "breakdown": calculation.breakdown
        }
        
        carbon_data[user_id].append(entry)
        
        return CarbonTrackingResponse(
            user_id=user_id,
            current_footprint=calculation.total_daily_co2,
            category=calculation.category,
            tracking_started=True,
            total_entries=len(carbon_data[user_id])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tracking error: {str(e)}")

@router.get("/history/{user_id}", response_model=CarbonHistoryResponse)
async def get_carbon_history(user_id: str, days: int = 30):
    """Get carbon footprint history for a user"""
    if user_id not in carbon_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    history = carbon_data[user_id][-days:]  # Last N days
    
    return CarbonHistoryResponse(
        user_id=user_id,
        history=history,
        total_days=len(history),
        average_daily_co2=round(sum(entry["total_daily_co2"] for entry in history) / len(history), 2) if history else 0
    )

@router.put("/update/{user_id}")
async def update_carbon_tracking(user_id: str, request: CarbonUpdateRequest):
    """Update carbon tracking data"""
    if user_id not in carbon_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add new entry
    calc_request = CarbonCalculationRequest(
        daily_miles=request.daily_miles,
        public_transit_usage=request.public_transit_usage,
        electric_vehicle_usage=request.electric_vehicle_usage,
        meat_consumption=request.meat_consumption,
        dairy_consumption=request.dairy_consumption,
        vegetable_consumption=request.vegetable_consumption,
        electronics_purchases=request.electronics_purchases,
        clothing_purchases=request.clothing_purchases,
        furniture_purchases=request.furniture_purchases
    )
    
    calculation = await calculate_carbon_footprint(calc_request)
    
    entry = {
        "date": datetime.datetime.now().isoformat(),
        "total_daily_co2": calculation.total_daily_co2,
        "category": calculation.category,
        "breakdown": calculation.breakdown
    }
    
    carbon_data[user_id].append(entry)
    
    return {
        "user_id": user_id,
        "updated": True,
        "new_footprint": calculation.total_daily_co2,
        "category": calculation.category
    }

def get_carbon_recommendations(total_co2: float, category: str) -> List[str]:
    """Get personalized carbon reduction recommendations"""
    recommendations = []
    
    if category in ["High", "Very High"]:
        recommendations.extend([
            "Consider using public transportation or carpooling",
            "Reduce meat consumption - try plant-based alternatives",
            "Buy fewer electronics and extend device lifespans",
            "Choose energy-efficient appliances"
        ])
    elif category == "Medium":
        recommendations.extend([
            "Walk or bike for short trips",
            "Buy local and seasonal produce",
            "Reduce, reuse, and recycle more"
        ])
    else:
        recommendations.extend([
            "Great job! Continue your eco-friendly lifestyle",
            "Consider sharing your practices with others",
            "Look into renewable energy options"
        ])
    
    return recommendations