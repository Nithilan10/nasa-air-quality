from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class AlertRequest(BaseModel):
    location: str = Field(..., description="Location name")
    aqi: float = Field(..., description="Air Quality Index", ge=0, le=500)
    health_condition: Optional[str] = Field(None, description="Health condition")
    pollen_level: Optional[int] = Field(None, description="Pollen level (1-5)", ge=1, le=5)

class AlertResponse(BaseModel):
    location: str = Field(..., description="Location name")
    alert_level: str = Field(..., description="Alert level (GREEN, YELLOW, ORANGE, RED, PURPLE)")
    aqi: float = Field(..., description="Air Quality Index")
    aqi_category: str = Field(..., description="AQI category")
    message: str = Field(..., description="Alert message")
    recommendations: List[str] = Field(..., description="Recommendations")
    timestamp: str = Field(..., description="Alert timestamp")
    expires_at: str = Field(..., description="Alert expiration time")

class AlertSubscriptionRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    location: str = Field(..., description="Location for alerts")
    health_condition: Optional[str] = Field(None, description="Health condition")
    alert_threshold: int = Field(50, description="AQI threshold for alerts", ge=0, le=500)

class AlertThresholdsResponse(BaseModel):
    aqi_thresholds: Dict[str, Dict] = Field(..., description="AQI alert thresholds")
    health_condition_thresholds: Dict[str, int] = Field(..., description="Health condition specific thresholds")
    pollen_threshold: int = Field(..., description="Pollen alert threshold")

class AlertCheckRequest(BaseModel):
    location: str = Field(..., description="Location name")
    aqi: float = Field(..., description="Air Quality Index", ge=0, le=500)
    health_condition: Optional[str] = Field(None, description="Health condition")
    pollen_level: Optional[int] = Field(None, description="Pollen level (1-5)", ge=1, le=5)

class AlertCheckResponse(BaseModel):
    location: str = Field(..., description="Location name")
    alert_level: str = Field(..., description="Alert level")
    aqi: float = Field(..., description="Air Quality Index")
    aqi_category: str = Field(..., description="AQI category")
    message: str = Field(..., description="Alert message")
    recommendations: List[str] = Field(..., description="Recommendations")
    should_alert: bool = Field(..., description="Whether alert should be triggered")
    severity_score: float = Field(..., description="Severity score (0-10)")
    timestamp: str = Field(..., description="Check timestamp")