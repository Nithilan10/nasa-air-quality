from pathlib import Path
import pandas as pd
import numpy as np
import requests
from scipy.spatial import cKDTree
from typing import Dict, List, Optional, Tuple
import datetime

BASE = Path(__file__).resolve().parent.parent
RAW_DIR = BASE / "data" / "raw"
PROC_DIR = BASE / "data" / "processed"
ML_DIR = BASE / "data" / "ml_ready"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROC_DIR.mkdir(parents=True, exist_ok=True)
ML_DIR.mkdir(parents=True, exist_ok=True)

def load_json(path):
    if not path.exists():
        return pd.DataFrame()
    return pd.read_json(path, convert_dates=["time"])

def merge_nearest_space(df1, df2, tol=0.1):
    """Merge two dataframes based on nearest spatial coordinates"""
    if df1.empty or df2.empty:
        return df1 if not df1.empty else df2
    
    # Check if both dataframes have lat/lon columns
    if not all(col in df1.columns for col in ["lat", "lon"]) or not all(col in df2.columns for col in ["lat", "lon"]):
        # If no lat/lon, try to merge by location name
        if "location" in df1.columns and "location" in df2.columns:
            return merge_by_location(df1, df2)
        else:
            return pd.concat([df1, df2], axis=1)
    
    tree = cKDTree(df2[["lat","lon"]].values)
    dist, idx = tree.query(df1[["lat","lon"]].values)
    mask = dist <= tol
    df1_matched = df1[mask].reset_index(drop=True)
    df2_matched = df2.iloc[idx[mask]].reset_index(drop=True)
    return pd.concat([df1_matched, df2_matched], axis=1)

def merge_by_location(df1, df2):
    """Merge dataframes by location name"""
    if "location" not in df1.columns or "location" not in df2.columns:
        return pd.concat([df1, df2], axis=1)
    
    # Find common columns (excluding location)
    common_cols = set(df1.columns) & set(df2.columns) - {"location"}
    
    # Add suffixes to common columns
    df1_renamed = df1.copy()
    df2_renamed = df2.copy()
    
    for col in common_cols:
        if col in df1_renamed.columns:
            df1_renamed = df1_renamed.rename(columns={col: f"{col}_1"})
        if col in df2_renamed.columns:
            df2_renamed = df2_renamed.rename(columns={col: f"{col}_2"})
    
    merged = df1_renamed.merge(df2_renamed, on="location", how="outer")
    return merged

def calculate_health_risk_score(pollution_data: Dict, health_data: Dict) -> float:
    """Calculate health risk score for asthma and respiratory conditions"""
    risk_score = 0.0
    
    # Air quality risk factors
    if 'pm25' in pollution_data and pollution_data['pm25']:
        pm25 = float(pollution_data['pm25'])
        if pm25 > 35:  # WHO guideline
            risk_score += (pm25 / 35) * 2.0
    
    if 'o3' in pollution_data and pollution_data['o3']:
        o3 = float(pollution_data['o3'])
        if o3 > 0.07:  # 8-hour average limit
            risk_score += (o3 / 0.07) * 1.5
    
    if 'no2' in pollution_data and pollution_data['no2']:
        no2 = float(pollution_data['no2'])
        if no2 > 0.053:  # Annual limit
            risk_score += (no2 / 0.053) * 1.2
    
    # Health vulnerability factors
    if 'asthma_rate' in health_data and health_data['asthma_rate']:
        asthma_rate = float(health_data['asthma_rate'])
        risk_score += asthma_rate * 10  # Amplify asthma vulnerability
    
    if 'copd_rate' in health_data and health_data['copd_rate']:
        copd_rate = float(health_data['copd_rate'])
        risk_score += copd_rate * 8  # COPD vulnerability
    
    # Pollen allergy risk
    if 'pollen_level' in pollution_data and pollution_data['pollen_level']:
        pollen = float(pollution_data['pollen_level'])
        if pollen > 5:  # High pollen threshold
            risk_score += (pollen / 5) * 1.0
    
    return min(risk_score, 10.0)  # Cap at 10

def calculate_carbon_impact(activity_data: Dict) -> Dict:
    """Calculate carbon footprint impact for various activities"""
    carbon_impact = {
        'transportation': 0.0,
        'food': 0.0,
        'energy': 0.0,
        'consumer_goods': 0.0,
        'total_daily': 0.0
    }
    
    # Transportation emissions (kg CO2)
    if 'vehicle_miles' in activity_data:
        miles = float(activity_data['vehicle_miles'])
        carbon_impact['transportation'] = miles * 0.411  # Average car emissions
    
    if 'public_transit_miles' in activity_data:
        miles = float(activity_data['public_transit_miles'])
        carbon_impact['transportation'] += miles * 0.17  # Public transit emissions
    
    # Food emissions (kg CO2 per day)
    if 'meat_consumption' in activity_data:
        meat_kg = float(activity_data['meat_consumption'])
        carbon_impact['food'] += meat_kg * 27.0  # Beef emissions
    
    if 'dairy_consumption' in activity_data:
        dairy_kg = float(activity_data['dairy_consumption'])
        carbon_impact['food'] += dairy_kg * 13.5  # Cheese emissions
    
    # Energy consumption (kWh to CO2)
    if 'electricity_kwh' in activity_data:
        kwh = float(activity_data['electricity_kwh'])
        carbon_impact['energy'] = kwh * 0.4  # Average grid emissions
    
    # Consumer goods
    if 'electronics_purchases' in activity_data:
        electronics = float(activity_data['electronics_purchases'])
        carbon_impact['consumer_goods'] += electronics * 100.0  # Average electronics
    
    carbon_impact['total_daily'] = sum(carbon_impact.values())
    
    return carbon_impact

def calculate_aqi(pollutant_data: Dict) -> Dict:
    """Calculate Air Quality Index for different pollutants"""
    aqi_values = {}
    
    # PM2.5 AQI
    if 'pm25' in pollutant_data:
        pm25 = float(pollutant_data['pm25'])
        if pm25 <= 12.0:
            aqi_values['pm25_aqi'] = ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0
        elif pm25 <= 35.4:
            aqi_values['pm25_aqi'] = ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
        elif pm25 <= 55.4:
            aqi_values['pm25_aqi'] = ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
        else:
            aqi_values['pm25_aqi'] = 200  # Simplified for high values
    
    # PM10 AQI
    if 'pm10' in pollutant_data:
        pm10 = float(pollutant_data['pm10'])
        if pm10 <= 54:
            aqi_values['pm10_aqi'] = ((50 - 0) / (54 - 0)) * (pm10 - 0) + 0
        elif pm10 <= 154:
            aqi_values['pm10_aqi'] = ((100 - 51) / (154 - 55)) * (pm10 - 55) + 51
        else:
            aqi_values['pm10_aqi'] = 200  # Simplified for high values
    
    # Overall AQI is the maximum of individual pollutant AQIs
    if aqi_values:
        aqi_values['overall_aqi'] = max(aqi_values.values())
        
        # AQI category
        overall_aqi = aqi_values['overall_aqi']
        if overall_aqi <= 50:
            aqi_values['aqi_category'] = 'Good'
        elif overall_aqi <= 100:
            aqi_values['aqi_category'] = 'Moderate'
        elif overall_aqi <= 150:
            aqi_values['aqi_category'] = 'Unhealthy for Sensitive Groups'
        elif overall_aqi <= 200:
            aqi_values['aqi_category'] = 'Unhealthy'
        elif overall_aqi <= 300:
            aqi_values['aqi_category'] = 'Very Unhealthy'
        else:
            aqi_values['aqi_category'] = 'Hazardous'
    
    return aqi_values

def get_health_recommendations(aqi: float, pollen_level: float, asthma_risk: float) -> List[str]:
    """Generate health recommendations based on air quality and health risk"""
    recommendations = []
    
    # AQI-based recommendations
    if aqi > 100:
        recommendations.append("Limit outdoor activities, especially for sensitive groups")
    if aqi > 150:
        recommendations.append("Stay indoors with windows closed")
        recommendations.append("Use air purifiers if available")
    if aqi > 200:
        recommendations.append("Avoid all outdoor activities")
        recommendations.append("Consider wearing N95 mask if going outside")
    
    # Pollen-based recommendations
    if pollen_level > 5:
        recommendations.append("High pollen levels - consider allergy medication")
        recommendations.append("Keep windows closed during peak pollen hours")
    
    # Asthma-specific recommendations
    if asthma_risk > 5:
        recommendations.append("High asthma risk - carry rescue inhaler")
        recommendations.append("Monitor symptoms closely")
        recommendations.append("Consider staying indoors")
    
    return recommendations

def calculate_personal_exposure(location_data: Dict, activity_data: Dict) -> Dict:
    """Calculate personal exposure based on location and activities"""
    exposure = {
        'indoor_exposure': 0.0,
        'outdoor_exposure': 0.0,
        'total_exposure': 0.0,
        'exposure_risk': 'Low'
    }
    
    # Base outdoor exposure from location air quality
    if 'outdoor_aqi' in location_data:
        outdoor_aqi = float(location_data['outdoor_aqi'])
        exposure['outdoor_exposure'] = outdoor_aqi
    
    # Indoor exposure (typically 50-80% of outdoor)
    exposure['indoor_exposure'] = exposure['outdoor_exposure'] * 0.6
    
    # Adjust based on activities
    if 'outdoor_hours' in activity_data:
        outdoor_hours = float(activity_data['outdoor_hours'])
        total_hours = 24.0
        exposure['total_exposure'] = (
            (outdoor_hours / total_hours) * exposure['outdoor_exposure'] +
            ((total_hours - outdoor_hours) / total_hours) * exposure['indoor_exposure']
        )
    else:
        exposure['total_exposure'] = exposure['indoor_exposure']
    
    # Risk categorization
    if exposure['total_exposure'] > 150:
        exposure['exposure_risk'] = 'High'
    elif exposure['total_exposure'] > 100:
        exposure['exposure_risk'] = 'Moderate'
    elif exposure['total_exposure'] > 50:
        exposure['exposure_risk'] = 'Low'
    else:
        exposure['exposure_risk'] = 'Very Low'
    
    return exposure

def validate_data_quality(df: pd.DataFrame) -> Dict:
    """Validate data quality and return quality metrics"""
    quality_metrics = {
        'total_records': len(df),
        'missing_values': df.isnull().sum().sum(),
        'missing_percentage': (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
        'duplicate_records': df.duplicated().sum(),
        'data_completeness': 0.0,
        'quality_score': 0.0
    }
    
    # Calculate data completeness
    quality_metrics['data_completeness'] = 100 - quality_metrics['missing_percentage']
    
    # Calculate overall quality score
    quality_metrics['quality_score'] = (
        quality_metrics['data_completeness'] * 0.6 +
        (100 - (quality_metrics['duplicate_records'] / quality_metrics['total_records'] * 100)) * 0.4
    )
    
    return quality_metrics

def create_data_summary(df: pd.DataFrame) -> Dict:
    """Create a summary of the dataset for monitoring"""
    summary = {
        'dataset_info': {
            'total_records': len(df),
            'total_columns': len(df.columns),
            'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024 / 1024,
            'date_range': None
        },
        'column_info': {},
        'data_sources': []
    }
    
    # Date range
    date_cols = [col for col in df.columns if 'date' in col.lower()]
    if date_cols:
        try:
            dates = pd.to_datetime(df[date_cols[0]], errors='coerce')
            summary['dataset_info']['date_range'] = {
                'start': dates.min().isoformat() if not dates.isna().all() else None,
                'end': dates.max().isoformat() if not dates.isna().all() else None
            }
        except:
            pass
    
    # Column information
    for col in df.columns:
        summary['column_info'][col] = {
            'dtype': str(df[col].dtype),
            'non_null_count': df[col].count(),
            'null_count': df[col].isnull().sum(),
            'unique_values': df[col].nunique()
        }
    
    # Data sources
    if 'data_source' in df.columns:
        summary['data_sources'] = df['data_source'].value_counts().to_dict()
    
    return summary
