import pandas as pd
import numpy as np
from pathlib import Path
from utils import merge_nearest_space, ML_DIR, RAW_DIR, calculate_health_risk_score, calculate_carbon_impact
import datetime
from typing import Dict, List, Optional

def load_data_from_directory(data_dir: Path, pattern: str = "*.csv") -> pd.DataFrame:
    """Load and combine all CSV files from a directory"""
    files = list(data_dir.glob(pattern))
    if not files:
        return pd.DataFrame()
    
    dataframes = []
    for file in files:
        try:
            df = pd.read_csv(file)
            if not df.empty:
                dataframes.append(df)
        except Exception as e:
            print(f"[WARN] Failed to load {file}: {e}")
    
    if dataframes:
        return pd.concat(dataframes, ignore_index=True)
    return pd.DataFrame()

def create_health_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create health-specific features for asthma and respiratory conditions"""
    if df.empty:
        return df
    
    # Air Quality Index (AQI) calculation
    if 'pm25' in df.columns and 'pm10' in df.columns:
        # Simplified AQI calculation
        df['aqi_pm25'] = df['pm25'].apply(lambda x: min(500, max(0, (x / 35) * 100)) if pd.notna(x) else np.nan)
        df['aqi_pm10'] = df['pm10'].apply(lambda x: min(500, max(0, (x / 50) * 100)) if pd.notna(x) else np.nan)
        df['aqi_max'] = df[['aqi_pm25', 'aqi_pm10']].max(axis=1)
    
    # Health risk categories
    if 'aqi_max' in df.columns:
        df['health_risk_category'] = pd.cut(
            df['aqi_max'], 
            bins=[0, 50, 100, 150, 200, 300, 500], 
            labels=['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous']
        )
    
    # Asthma-specific risk factors
    if 'o3' in df.columns:
        df['asthma_risk_o3'] = df['o3'].apply(lambda x: 1 if x > 0.07 else 0 if pd.notna(x) else np.nan)
    
    if 'no2' in df.columns:
        df['asthma_risk_no2'] = df['no2'].apply(lambda x: 1 if x > 0.053 else 0 if pd.notna(x) else np.nan)
    
    # Combined asthma risk score
    asthma_risk_cols = [col for col in df.columns if 'asthma_risk' in col]
    if asthma_risk_cols:
        # Convert to numeric and handle non-numeric values
        asthma_numeric = df[asthma_risk_cols].apply(pd.to_numeric, errors='coerce')
        df['asthma_risk_score'] = asthma_numeric.sum(axis=1)
    
    # Pollen allergy risk
    pollen_cols = [col for col in df.columns if 'pollen' in col.lower()]
    if pollen_cols:
        # Convert to numeric and handle non-numeric values
        pollen_numeric = df[pollen_cols].apply(pd.to_numeric, errors='coerce')
        df['pollen_risk_score'] = pollen_numeric.sum(axis=1)
    
    return df

def create_carbon_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create carbon footprint and environmental impact features"""
    if df.empty:
        return df
    
    # Transportation carbon impact
    if 'estimated_daily_co2_kg' in df.columns:
        df['transportation_carbon_impact'] = df['estimated_daily_co2_kg']
    
    # Food carbon impact
    if 'estimated_daily_food_co2_kg' in df.columns:
        df['food_carbon_impact'] = df['estimated_daily_food_co2_kg']
    
    # Consumer products carbon impact
    if 'estimated_monthly_consumer_co2_kg' in df.columns:
        df['consumer_carbon_impact'] = df['estimated_monthly_consumer_co2_kg'] / 30  # Daily average
    
    # Total personal carbon footprint
    carbon_cols = [col for col in df.columns if 'carbon_impact' in col]
    if carbon_cols:
        df['total_daily_carbon_kg'] = df[carbon_cols].sum(axis=1)
    
    # Carbon footprint categories
    if 'total_daily_carbon_kg' in df.columns:
        df['carbon_footprint_category'] = pd.cut(
            df['total_daily_carbon_kg'],
            bins=[0, 10, 20, 30, 50, 100],
            labels=['Very Low', 'Low', 'Moderate', 'High', 'Very High']
        )
    
    return df

def create_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create temporal features for time series analysis"""
    if df.empty:
        return df
    
    # Convert date columns to datetime
    date_cols = [col for col in df.columns if 'date' in col.lower()]
    for col in date_cols:
        try:
            df[col] = pd.to_datetime(df[col])
        except:
            continue
    
    # Extract temporal features
    if 'date' in df.columns:
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['season'] = df['month'].apply(lambda x: 
            'Winter' if x in [12, 1, 2] else
            'Spring' if x in [3, 4, 5] else
            'Summer' if x in [6, 7, 8] else 'Fall')
    
    return df

def create_geographic_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create geographic and location-based features"""
    if df.empty:
        return df
    
    # Urban vs rural classification based on location
    if 'location' in df.columns:
        urban_locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Seattle']
        df['is_urban'] = df['location'].isin(urban_locations).astype(int)
    
    # State-based features
    if 'state' in df.columns:
        # High pollution states
        high_pollution_states = ['CA', 'TX', 'NY', 'IL', 'PA']
        df['high_pollution_state'] = df['state'].isin(high_pollution_states).astype(int)
        
        # Coastal states (different weather patterns)
        coastal_states = ['CA', 'NY', 'FL', 'WA', 'OR', 'TX', 'LA', 'AL', 'GA', 'SC', 'NC', 'VA', 'MD', 'DE', 'NJ', 'CT', 'RI', 'MA', 'NH', 'ME']
        df['is_coastal'] = df['state'].isin(coastal_states).astype(int)
    
    return df

def create_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create interaction features between different variables"""
    if df.empty:
        return df
    
    # Weather-air quality interactions
    if 'temperature' in df.columns and 'pm25' in df.columns:
        df['temp_pm25_interaction'] = df['temperature'] * df['pm25']
    
    if 'humidity' in df.columns and 'o3' in df.columns:
        df['humidity_o3_interaction'] = df['humidity'] * df['o3']
    
    # Pollen-weather interactions
    if 'tree_pollen_level' in df.columns and 'temperature' in df.columns:
        df['pollen_temp_interaction'] = df['tree_pollen_level'] * df['temperature']
    
    # Health-pollution interactions
    if 'asthma_rate' in df.columns and 'aqi_max' in df.columns:
        df['asthma_pollution_interaction'] = df['asthma_rate'] * df['aqi_max']
    
    return df

def preprocess():
    """Enhanced preprocessing pipeline for asthma-focused air quality app"""
    print("[INFO] Starting enhanced preprocessing pipeline...")
    
    # Load data from all sources
    print("[INFO] Loading data from all sources...")
    satellite_data = load_data_from_directory(RAW_DIR / "satellite")
    ground_data = load_data_from_directory(RAW_DIR / "ground")
    weather_data = load_data_from_directory(RAW_DIR / "weather")
    health_data = load_data_from_directory(RAW_DIR / "health")
    carbon_data = load_data_from_directory(RAW_DIR / "carbon")
    pollen_data = load_data_from_directory(RAW_DIR / "pollen")
    
    print(f"[INFO] Loaded data: Satellite({len(satellite_data)}), Ground({len(ground_data)}), "
          f"Weather({len(weather_data)}), Health({len(health_data)}), "
          f"Carbon({len(carbon_data)}), Pollen({len(pollen_data)})")
    
    # Start with ground data as base
    merged = ground_data.copy() if not ground_data.empty else pd.DataFrame()
    
    # Merge satellite data
    if not satellite_data.empty and not merged.empty:
        merged = merge_nearest_space(merged, satellite_data)
        print(f"[INFO] Merged satellite data: {len(merged)} records")
    
    # Merge weather data
    if not weather_data.empty and not merged.empty:
        merged = merge_nearest_space(merged, weather_data)
        print(f"[INFO] Merged weather data: {len(merged)} records")
    
    # Merge health data
    if not health_data.empty and not merged.empty:
        merged = merge_nearest_space(merged, health_data)
        print(f"[INFO] Merged health data: {len(merged)} records")
    
    # Merge carbon data
    if not carbon_data.empty and not merged.empty:
        merged = merge_nearest_space(merged, carbon_data)
        print(f"[INFO] Merged carbon data: {len(merged)} records")
    
    # Merge pollen data
    if not pollen_data.empty and not merged.empty:
        merged = merge_nearest_space(merged, pollen_data)
        print(f"[INFO] Merged pollen data: {len(merged)} records")
    
    if merged.empty:
        print("[WARN] No data to process after merging")
        return
    
    print(f"[INFO] Starting feature engineering on {len(merged)} records...")
    
    # Create health-specific features
    merged = create_health_features(merged)
    print("[INFO] Created health features")
    
    # Create carbon footprint features
    merged = create_carbon_features(merged)
    print("[INFO] Created carbon features")
    
    # Create temporal features
    merged = create_temporal_features(merged)
    print("[INFO] Created temporal features")
    
    # Create geographic features
    merged = create_geographic_features(merged)
    print("[INFO] Created geographic features")
    
    # Create interaction features
    merged = create_interaction_features(merged)
    print("[INFO] Created interaction features")
    
    # Handle missing values
    print("[INFO] Handling missing values...")
    numeric_cols = merged.select_dtypes(include=[np.number]).columns.tolist()
    # Exclude date columns from numeric processing
    numeric_cols = [col for col in numeric_cols if 'date' not in col.lower()]
    
    if numeric_cols:
        # Fill numeric columns with median, handling any remaining non-numeric values
        for col in numeric_cols:
            if col in merged.columns:
                try:
                    merged[col] = pd.to_numeric(merged[col], errors='coerce')
                    median_val = merged[col].median()
                    if pd.notna(median_val):
                        merged[col] = merged[col].fillna(median_val)
                    else:
                        merged[col] = merged[col].fillna(0)
                except:
                    merged[col] = merged[col].fillna(0)
    
    # Fill categorical columns with mode
    categorical_cols = merged.select_dtypes(include=['object']).columns.tolist()
    for col in categorical_cols:
        if col in merged.columns:
            mode_val = merged[col].mode()
            if not mode_val.empty:
                merged[col] = merged[col].fillna(mode_val.iloc[0])
            else:
                merged[col] = merged[col].fillna('Unknown')
    
    # Save processed data
    output_file = ML_DIR / "enhanced_training_dataset.csv"
    merged.to_csv(output_file, index=False)
    print(f"[INFO] Enhanced training dataset saved → {output_file}")
    
    # Create separate datasets for different models
    create_model_specific_datasets(merged)
    
    return merged

def create_model_specific_datasets(df: pd.DataFrame):
    """Create specific datasets for different ML models"""
    if df.empty:
        return
    
    # Air quality prediction dataset
    aq_features = [col for col in df.columns if any(x in col.lower() for x in 
                   ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co', 'temperature', 'humidity', 'wind', 'pressure'])]
    if aq_features:
        # Find available date columns
        date_cols = [col for col in df.columns if 'date' in col.lower()]
        base_cols = ['location'] + (date_cols[:1] if date_cols else [])
        aq_dataset = df[aq_features + base_cols].copy()
        aq_dataset.to_csv(ML_DIR / "air_quality_dataset.csv", index=False)
        print(f"[INFO] Air quality dataset saved with {len(aq_features)} features")
    
    # Health risk prediction dataset
    health_features = [col for col in df.columns if any(x in col.lower() for x in 
                      ['asthma', 'copd', 'respiratory', 'pollen', 'aqi', 'health_risk'])]
    if health_features:
        health_dataset = df[health_features + base_cols].copy()
        health_dataset.to_csv(ML_DIR / "health_risk_dataset.csv", index=False)
        print(f"[INFO] Health risk dataset saved with {len(health_features)} features")
    
    # Carbon footprint dataset
    carbon_features = [col for col in df.columns if any(x in col.lower() for x in 
                       ['carbon', 'emissions', 'transportation', 'food', 'consumer'])]
    if carbon_features:
        carbon_dataset = df[carbon_features + base_cols].copy()
        carbon_dataset.to_csv(ML_DIR / "carbon_footprint_dataset.csv", index=False)
        print(f"[INFO] Carbon footprint dataset saved with {len(carbon_features)} features")
    
    # Pollen allergy dataset
    pollen_features = [col for col in df.columns if any(x in col.lower() for x in 
                       ['pollen', 'allergy', 'tree', 'grass', 'weed', 'mold'])]
    if pollen_features:
        pollen_dataset = df[pollen_features + base_cols].copy()
        pollen_dataset.to_csv(ML_DIR / "pollen_allergy_dataset.csv", index=False)
        print(f"[INFO] Pollen allergy dataset saved with {len(pollen_features)} features")

if __name__ == "__main__":
    preprocess()
