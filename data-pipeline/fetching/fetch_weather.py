import requests
import pandas as pd
from pathlib import Path
import datetime
import json
import time
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

RAW_DIR = Path(__file__).resolve().parent.parent.parent / "data/raw/weather"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# API Keys (set in .env file)
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
NOAA_API_KEY = os.getenv("NOAA_API_KEY", "")
POLLEN_API_KEY = os.getenv("POLLEN_API_KEY", "")

# Default locations for data collection
LOCATIONS = [
    {"lat": 47.6062, "lon": -122.3321, "name": "Seattle", "state": "WA"},
    {"lat": 40.7128, "lon": -74.0060, "name": "New York", "state": "NY"},
    {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles", "state": "CA"},
    {"lat": 41.8781, "lon": -87.6298, "name": "Chicago", "state": "IL"},
    {"lat": 29.7604, "lon": -95.3698, "name": "Houston", "state": "TX"}
]

def fetch_openweather_data():
    """Fetch comprehensive weather data from OpenWeatherMap"""
    if not OPENWEATHER_API_KEY:
        print("[WARN] OpenWeather API key not found. Set OPENWEATHER_API_KEY in .env file")
        return pd.DataFrame()
    
    all_data = []
    today = datetime.date.today()
    
    for loc in LOCATIONS:
        # Current weather
        current_url = "http://api.openweathermap.org/data/2.5/weather"
        current_params = {
            "lat": loc["lat"],
            "lon": loc["lon"],
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        try:
            resp = requests.get(current_url, params=current_params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                data["location"] = loc["name"]
                data["state"] = loc["state"]
                data["data_type"] = "current"
                all_data.append(data)
            else:
                print(f"[WARN] OpenWeather current failed for {loc['name']}: {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] OpenWeather current error for {loc['name']}: {e}")
        
        # 5-day forecast
        forecast_url = "http://api.openweathermap.org/data/2.5/forecast"
        forecast_params = {
            "lat": loc["lat"],
            "lon": loc["lon"],
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        try:
            resp = requests.get(forecast_url, params=forecast_params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("list", []):
                    item["location"] = loc["name"]
                    item["state"] = loc["state"]
                    item["data_type"] = "forecast"
                    all_data.append(item)
            else:
                print(f"[WARN] OpenWeather forecast failed for {loc['name']}: {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] OpenWeather forecast error for {loc['name']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    if all_data:
        df = pd.json_normalize(all_data)
        out_file = RAW_DIR / f"openweather_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] OpenWeather data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_noaa_data():
    """Fetch weather data from NOAA"""
    if not NOAA_API_KEY:
        print("[WARN] NOAA API key not found. Set NOAA_API_KEY in .env file")
        return pd.DataFrame()
    
    all_data = []
    today = datetime.date.today()
    
    for loc in LOCATIONS:
        # NOAA weather observations
        url = "https://api.weather.gov/points/{lat},{lon}/observations"
        params = {
            "start": (today - datetime.timedelta(days=1)).isoformat(),
            "end": today.isoformat()
        }
        
        try:
            resp = requests.get(url.format(lat=loc["lat"], lon=loc["lon"]), 
                              params=params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for obs in data.get("features", []):
                    obs_data = obs.get("properties", {})
                    obs_data["location"] = loc["name"]
                    obs_data["state"] = loc["state"]
                    obs_data["data_type"] = "noaa_observation"
                    all_data.append(obs_data)
            else:
                print(f"[WARN] NOAA data failed for {loc['name']}: {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] NOAA data error for {loc['name']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    if all_data:
        df = pd.json_normalize(all_data)
        out_file = RAW_DIR / f"noaa_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] NOAA data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_pollen_data():
    """Fetch pollen count and allergy data"""
    if not POLLEN_API_KEY:
        print("[WARN] Pollen API key not found. Set POLLEN_API_KEY in .env file")
        return pd.DataFrame()
    
    all_data = []
    today = datetime.date.today()
    
    for loc in LOCATIONS:
        # Pollen.com API (example endpoint)
        url = "https://api.pollen.com/api/forecast/extended"
        params = {
            "zipCode": f"{loc['lat']},{loc['lon']}",  # This would need proper zip code lookup
            "api_key": POLLEN_API_KEY
        }
        
        try:
            resp = requests.get(url, params=params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for day_data in data.get("Location", {}).get("periods", []):
                    day_data["location"] = loc["name"]
                    day_data["state"] = loc["state"]
                    day_data["data_type"] = "pollen"
                    all_data.append(day_data)
            else:
                print(f"[WARN] Pollen data failed for {loc['name']}: {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] Pollen data error for {loc['name']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    if all_data:
        df = pd.json_normalize(all_data)
        out_file = RAW_DIR / f"pollen_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] Pollen data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_fire_weather_data():
    """Fetch fire weather and smoke data"""
    all_data = []
    today = datetime.date.today()
    
    # National Interagency Fire Center (NIFC) data
    url = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/CY_WildlandFire_Locations_ToDate/FeatureServer/0/query"
    params = {
        "where": "1=1",
        "outFields": "*",
        "f": "json",
        "geometry": "-125,24,-66,49",  # North America bounding box
        "geometryType": "esriGeometryEnvelope",
        "spatialRel": "esriSpatialRelIntersects"
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            for feature in data.get("features", []):
                fire_data = feature.get("attributes", {})
                fire_data["data_type"] = "fire_incident"
                all_data.append(fire_data)
        else:
            print(f"[WARN] Fire weather data failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] Fire weather data error: {e}")
    
    # NOAA Fire Weather data
    for loc in LOCATIONS:
        url = "https://api.weather.gov/alerts"
        params = {
            "point": f"{loc['lat']},{loc['lon']}",
            "event": "Fire Weather Watch,Red Flag Warning"
        }
        
        try:
            resp = requests.get(url, params=params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for alert in data.get("features", []):
                    alert_data = alert.get("properties", {})
                    alert_data["location"] = loc["name"]
                    alert_data["state"] = loc["state"]
                    alert_data["data_type"] = "fire_alert"
                    all_data.append(alert_data)
        except Exception as e:
            print(f"[ERROR] Fire alert error for {loc['name']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    if all_data:
        df = pd.json_normalize(all_data)
        out_file = RAW_DIR / f"fire_weather_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] Fire weather data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_uv_index_data():
    """Fetch UV index data"""
    all_data = []
    today = datetime.date.today()
    
    for loc in LOCATIONS:
        # OpenWeatherMap UV Index
        if OPENWEATHER_API_KEY:
            url = "http://api.openweathermap.org/data/2.5/uvi"
            params = {
                "lat": loc["lat"],
                "lon": loc["lon"],
                "appid": OPENWEATHER_API_KEY
            }
            
            try:
                resp = requests.get(url, params=params, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    data["location"] = loc["name"]
                    data["state"] = loc["state"]
                    data["data_type"] = "uv_index"
                    all_data.append(data)
            except Exception as e:
                print(f"[ERROR] UV index error for {loc['name']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    if all_data:
        df = pd.json_normalize(all_data)
        out_file = RAW_DIR / f"uv_index_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] UV index data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_all_weather_data():
    """Fetch data from all weather sources"""
    print("[INFO] Starting comprehensive weather data collection...")
    
    # Fetch from all sources
    openweather_data = fetch_openweather_data()
    noaa_data = fetch_noaa_data()
    pollen_data = fetch_pollen_data()
    fire_weather_data = fetch_fire_weather_data()
    uv_data = fetch_uv_index_data()
    
    # Combine all weather data
    all_data = []
    for name, data in [
        ("openweather", openweather_data),
        ("noaa", noaa_data),
        ("pollen", pollen_data),
        ("fire_weather", fire_weather_data),
        ("uv_index", uv_data)
    ]:
        if not data.empty:
            data['weather_source'] = name
            all_data.append(data)
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"all_weather_data_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] Combined weather data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

if __name__ == "__main__":
    fetch_all_weather_data()
