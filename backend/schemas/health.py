from pydantic import BaseModel, Field
from typing import List, Optional

class HealthRecommendationRequest(BaseModel):
    condition: str = Field(..., description="Health condition (asthma, copd, heart_disease, elderly, children)")
    aqi: float = Field(..., description="Air Quality Index", ge=0, le=500)
    pollen_level: int = Field(..., description="Pollen level (1-5)", ge=1, le=5)

class HealthRecommendationResponse(BaseModel):
    condition: str = Field(..., description="Health condition")
    aqi: float = Field(..., description="Air Quality Index")
    aqi_category: str = Field(..., description="AQI category")
    pollen_level: int = Field(..., description="Pollen level")
    recommendation: str = Field(..., description="Health recommendation")
    severity_level: str = Field(..., description="Severity level (Low, Moderate, High, Critical)")
    additional_tips: List[str] = Field(..., description="Additional health tips")

class HealthCondition(BaseModel):
    condition: str = Field(..., description="Health condition name")
    description: str = Field(..., description="Condition description")
    sensitivity_level: str = Field(..., description="Air quality sensitivity level")
    aqi_threshold: int = Field(..., description="AQI threshold for alerts")

class HealthConditionResponse(BaseModel):
    conditions: List[HealthCondition] = Field(..., description="List of supported health conditions")

class PersonalizedHealthRequest(BaseModel):
    condition: str = Field(..., description="Health condition")
    aqi: float = Field(..., description="Air Quality Index", ge=0, le=500)
    pollen_level: int = Field(..., description="Pollen level (1-5)", ge=1, le=5)
    age: Optional[int] = Field(None, description="Age", ge=0, le=120)
    has_rescue_inhaler: Optional[bool] = Field(None, description="Has rescue inhaler")
    uses_oxygen: Optional[bool] = Field(None, description="Uses oxygen therapy")
    outdoor_activities: Optional[bool] = Field(None, description="Plans outdoor activities")

class PersonalizedHealthResponse(BaseModel):
    condition: str = Field(..., description="Health condition")
    aqi: float = Field(..., description="Air Quality Index")
    aqi_category: str = Field(..., description="AQI category")
    pollen_level: int = Field(..., description="Pollen level")
    base_recommendation: str = Field(..., description="Base health recommendation")
    personalized_tips: List[str] = Field(..., description="Personalized health tips")
    severity_level: str = Field(..., description="Severity level")
    emergency_contact_needed: bool = Field(..., description="Whether emergency contact is needed")