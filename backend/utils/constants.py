# AQI Categories and Thresholds
AQI_CATEGORIES = {
    "Good": {"min": 0, "max": 50, "color": "green"},
    "Moderate": {"min": 51, "max": 100, "color": "yellow"},
    "Unhealthy for Sensitive Groups": {"min": 101, "max": 150, "color": "orange"},
    "Unhealthy": {"min": 151, "max": 200, "color": "red"},
    "Very Unhealthy": {"min": 201, "max": 300, "color": "purple"},
    "Hazardous": {"min": 301, "max": 500, "color": "maroon"}
}

# Alert Levels
ALERT_LEVELS = {
    "GREEN": {"aqi_range": (0, 50), "description": "Good air quality"},
    "YELLOW": {"aqi_range": (51, 100), "description": "Moderate air quality"},
    "ORANGE": {"aqi_range": (101, 150), "description": "Unhealthy for sensitive groups"},
    "RED": {"aqi_range": (151, 200), "description": "Unhealthy"},
    "PURPLE": {"aqi_range": (201, 500), "description": "Hazardous"}
}

# Health Conditions and Sensitivity
HEALTH_CONDITIONS = {
    "asthma": {
        "sensitivity": "high",
        "aqi_threshold": 50,
        "description": "Chronic respiratory condition affecting airways"
    },
    "copd": {
        "sensitivity": "high", 
        "aqi_threshold": 50,
        "description": "Chronic Obstructive Pulmonary Disease"
    },
    "heart_disease": {
        "sensitivity": "medium",
        "aqi_threshold": 100,
        "description": "Cardiovascular conditions"
    },
    "elderly": {
        "sensitivity": "medium",
        "aqi_threshold": 100,
        "description": "General elderly population (65+)"
    },
    "children": {
        "sensitivity": "high",
        "aqi_threshold": 50,
        "description": "Children under 18"
    }
}

# Carbon Footprint Categories
CARBON_CATEGORIES = {
    "Low": {"max": 20, "description": "Eco-conscious lifestyle"},
    "Medium": {"max": 40, "description": "Average lifestyle"},
    "High": {"max": 60, "description": "High-impact lifestyle"},
    "Very High": {"max": float('inf'), "description": "Very high-impact lifestyle"}
}

# Pollen Levels
POLLEN_LEVELS = {
    1: "Very Low",
    2: "Low", 
    3: "Moderate",
    4: "High",
    5: "Very High"
}

# Default Values
DEFAULT_VALUES = {
    "temperature": 20.0,
    "humidity": 50.0,
    "pressure": 1013.0,
    "wind_speed": 2.0,
    "pm25": 15.0,
    "o3": 30.0,
    "pollen_level": 3
}

# API Configuration
API_CONFIG = {
    "max_forecast_hours": 24,
    "max_history_days": 365,
    "default_page_size": 50,
    "max_page_size": 100
}