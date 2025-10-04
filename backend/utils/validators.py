from typing import Any, Dict, List
import re

class InputValidator:
    @staticmethod
    def validate_aqi(aqi: float) -> bool:
        """Validate AQI range"""
        return 0 <= aqi <= 500
    
    @staticmethod
    def validate_temperature(temp: float) -> bool:
        """Validate temperature range"""
        return -50 <= temp <= 60
    
    @staticmethod
    def validate_humidity(humidity: float) -> bool:
        """Validate humidity range"""
        return 0 <= humidity <= 100
    
    @staticmethod
    def validate_pressure(pressure: float) -> bool:
        """Validate atmospheric pressure range"""
        return 800 <= pressure <= 1100
    
    @staticmethod
    def validate_wind_speed(wind_speed: float) -> bool:
        """Validate wind speed range"""
        return 0 <= wind_speed <= 50
    
    @staticmethod
    def validate_pollution_concentration(concentration: float) -> bool:
        """Validate pollution concentration range"""
        return 0 <= concentration <= 500
    
    @staticmethod
    def validate_pollen_level(level: int) -> bool:
        """Validate pollen level range"""
        return 1 <= level <= 5
    
    @staticmethod
    def validate_health_condition(condition: str) -> bool:
        """Validate health condition"""
        valid_conditions = ["asthma", "copd", "heart_disease", "elderly", "children"]
        return condition.lower() in valid_conditions
    
    @staticmethod
    def validate_location_name(location: str) -> bool:
        """Validate location name format"""
        if not location or len(location.strip()) < 2:
            return False
        # Basic validation - no special characters except spaces, commas, hyphens
        pattern = r'^[a-zA-Z\s,\-\.]+$'
        return bool(re.match(pattern, location.strip()))
    
    @staticmethod
    def validate_user_id(user_id: str) -> bool:
        """Validate user ID format"""
        if not user_id or len(user_id.strip()) < 3:
            return False
        # Alphanumeric with underscores and hyphens
        pattern = r'^[a-zA-Z0-9_\-]+$'
        return bool(re.match(pattern, user_id.strip()))
    
    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> bool:
        """Validate coordinate ranges"""
        return -90 <= lat <= 90 and -180 <= lon <= 180
    
    @staticmethod
    def validate_carbon_inputs(data: Dict[str, Any]) -> List[str]:
        """Validate carbon footprint input data"""
        errors = []
        
        if 'daily_miles' in data and not (0 <= data['daily_miles'] <= 500):
            errors.append("Daily miles must be between 0 and 500")
        
        if 'public_transit_usage' in data and not (0 <= data['public_transit_usage'] <= 1):
            errors.append("Public transit usage must be between 0 and 1")
        
        if 'electric_vehicle_usage' in data and not (0 <= data['electric_vehicle_usage'] <= 1):
            errors.append("Electric vehicle usage must be between 0 and 1")
        
        if 'meat_consumption' in data and not (0 <= data['meat_consumption'] <= 2):
            errors.append("Meat consumption must be between 0 and 2 kg")
        
        if 'dairy_consumption' in data and not (0 <= data['dairy_consumption'] <= 2):
            errors.append("Dairy consumption must be between 0 and 2 kg")
        
        if 'vegetable_consumption' in data and not (0 <= data['vegetable_consumption'] <= 5):
            errors.append("Vegetable consumption must be between 0 and 5 kg")
        
        return errors