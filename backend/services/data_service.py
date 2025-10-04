import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from pathlib import Path

class DataService:
    def __init__(self):
        self.data_path = Path(__file__).parent.parent.parent.parent / "data/ml_ready"
    
    def load_training_data(self) -> Optional[pd.DataFrame]:
        """Load training data for reference"""
        try:
            data_file = self.data_path / "enhanced_training_dataset.csv"
            if data_file.exists():
                return pd.read_csv(data_file, low_memory=False)
        except Exception as e:
            print(f"Error loading training data: {e}")
        return None
    
    def get_feature_columns(self) -> List[str]:
        """Get feature column names"""
        training_data = self.load_training_data()
        if training_data is not None:
            numeric_cols = training_data.select_dtypes(include=['number']).columns.tolist()
            return [col for col in numeric_cols if col not in ['AQI']]
        return []
    
    def get_median_values(self) -> Dict[str, float]:
        """Get median values for missing features"""
        training_data = self.load_training_data()
        if training_data is not None:
            numeric_cols = training_data.select_dtypes(include=['number']).columns.tolist()
            return training_data[numeric_cols].median().to_dict()
        return {}
    
    def validate_input_data(self, data: Dict) -> bool:
        """Validate input data ranges"""
        validations = {
            'temperature': (-50, 60),
            'humidity': (0, 100),
            'pressure': (800, 1100),
            'wind_speed': (0, 50),
            'pm25': (0, 500),
            'o3': (0, 500)
        }
        
        for key, (min_val, max_val) in validations.items():
            if key in data:
                if not (min_val <= data[key] <= max_val):
                    return False
        return True