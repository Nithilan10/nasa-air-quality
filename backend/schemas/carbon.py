from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class CarbonCalculationRequest(BaseModel):
    daily_miles: float = Field(..., description="Daily miles driven", ge=0, le=500)
    public_transit_usage: float = Field(..., description="Public transit usage ratio", ge=0, le=1)
    electric_vehicle_usage: float = Field(0.0, description="Electric vehicle usage ratio", ge=0, le=1)
    meat_consumption: float = Field(..., description="Daily meat consumption in kg", ge=0, le=2)
    dairy_consumption: float = Field(..., description="Daily dairy consumption in kg", ge=0, le=2)
    vegetable_consumption: float = Field(..., description="Daily vegetable consumption in kg", ge=0, le=5)
    electronics_purchases: float = Field(..., description="Monthly electronics purchases", ge=0, le=10)
    clothing_purchases: float = Field(..., description="Monthly clothing purchases", ge=0, le=20)
    furniture_purchases: float = Field(..., description="Monthly furniture purchases", ge=0, le=5)

class CarbonCalculationResponse(BaseModel):
    total_daily_co2: float = Field(..., description="Total daily CO2 emissions in kg")
    category: str = Field(..., description="Carbon footprint category")
    breakdown: Dict[str, float] = Field(..., description="CO2 breakdown by category")
    recommendations: List[str] = Field(..., description="Reduction recommendations")

class CarbonTrackingRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    daily_miles: float = Field(..., description="Daily miles driven", ge=0, le=500)
    public_transit_usage: float = Field(..., description="Public transit usage ratio", ge=0, le=1)
    electric_vehicle_usage: float = Field(0.0, description="Electric vehicle usage ratio", ge=0, le=1)
    meat_consumption: float = Field(..., description="Daily meat consumption in kg", ge=0, le=2)
    dairy_consumption: float = Field(..., description="Daily dairy consumption in kg", ge=0, le=2)
    vegetable_consumption: float = Field(..., description="Daily vegetable consumption in kg", ge=0, le=5)
    electronics_purchases: float = Field(..., description="Monthly electronics purchases", ge=0, le=10)
    clothing_purchases: float = Field(..., description="Monthly clothing purchases", ge=0, le=20)
    furniture_purchases: float = Field(..., description="Monthly furniture purchases", ge=0, le=5)

class CarbonTrackingResponse(BaseModel):
    user_id: str = Field(..., description="User identifier")
    current_footprint: float = Field(..., description="Current daily CO2 emissions")
    category: str = Field(..., description="Carbon footprint category")
    tracking_started: bool = Field(..., description="Whether tracking was started")
    total_entries: int = Field(..., description="Total tracking entries")

class CarbonHistoryResponse(BaseModel):
    user_id: str = Field(..., description="User identifier")
    history: List[Dict] = Field(..., description="Historical carbon data")
    total_days: int = Field(..., description="Total days tracked")
    average_daily_co2: float = Field(..., description="Average daily CO2 emissions")

class CarbonUpdateRequest(BaseModel):
    daily_miles: float = Field(..., description="Daily miles driven", ge=0, le=500)
    public_transit_usage: float = Field(..., description="Public transit usage ratio", ge=0, le=1)
    electric_vehicle_usage: float = Field(0.0, description="Electric vehicle usage ratio", ge=0, le=1)
    meat_consumption: float = Field(..., description="Daily meat consumption in kg", ge=0, le=2)
    dairy_consumption: float = Field(..., description="Daily dairy consumption in kg", ge=0, le=2)
    vegetable_consumption: float = Field(..., description="Daily vegetable consumption in kg", ge=0, le=5)
    electronics_purchases: float = Field(..., description="Monthly electronics purchases", ge=0, le=10)
    clothing_purchases: float = Field(..., description="Monthly clothing purchases", ge=0, le=20)
    furniture_purchases: float = Field(..., description="Monthly furniture purchases", ge=0, le=5)