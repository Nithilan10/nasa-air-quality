import requests
import pandas as pd
from pathlib import Path
import datetime
import json
import time
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

RAW_DIR = Path(__file__).resolve().parent.parent.parent / "data/raw/ground"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# API Keys (set in .env file)
EPA_API_KEY = os.getenv("EPA_API_KEY", "")
PURPLEAIR_API_KEY = os.getenv("PURPLEAIR_API_KEY", "")
PANDORA_API_KEY = os.getenv("PANDORA_API_KEY", "")

def fetch_openaq(limit: int = 10000, parameters: List[str] = None):
    """Fetch comprehensive air quality data from OpenAQ"""
    if parameters is None:
        parameters = ["pm25", "pm10", "o3", "no2", "so2", "co"]
    
    all_data = []
    for param in parameters:
        url = f"https://api.openaq.org/v2/measurements"
        params = {
            "limit": limit,
            "parameter": param,
            "date_from": (datetime.date.today() - datetime.timedelta(days=1)).isoformat(),
            "date_to": datetime.date.today().isoformat()
        }
        
        try:
            resp = requests.get(url, params=params, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('results'):
                    df = pd.json_normalize(data['results'])
                    df['parameter'] = param
                    all_data.append(df)
                    print(f"[INFO] OpenAQ {param} data: {len(df)} records")
                time.sleep(0.5)  # Rate limiting
            else:
                print(f"[WARN] OpenAQ {param} failed: {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] OpenAQ {param} error: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"openaq_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] OpenAQ data saved → {out_file}")
        return combined_df
    return pd.DataFrame()

def fetch_epa_airnow():
    """Fetch data from EPA AirNow API"""
    if not EPA_API_KEY:
        print("[WARN] EPA API key not found. Set EPA_API_KEY in .env file")
        return pd.DataFrame()
    
    # Get current air quality data
    url = "https://www.airnowapi.org/aq/observation/zipCode/current/"
    params = {
        "format": "application/json",
        "zipCode": "98101",  # Seattle as example
        "distance": 25,
        "API_KEY": EPA_API_KEY
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            df = pd.DataFrame(data)
            out_file = RAW_DIR / f"epa_airnow_{datetime.date.today()}.csv"
            df.to_csv(out_file, index=False)
            print(f"[INFO] EPA AirNow data saved → {out_file}")
            return df
        else:
            print(f"[WARN] EPA AirNow failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] EPA AirNow error: {e}")
    
    return pd.DataFrame()

def fetch_purpleair():
    """Fetch data from PurpleAir community sensors"""
    if not PURPLEAIR_API_KEY:
        print("[WARN] PurpleAir API key not found. Set PURPLEAIR_API_KEY in .env file")
        return pd.DataFrame()
    
    # PurpleAir API endpoint for sensor data
    url = "https://api.purpleair.com/v1/sensors"
    headers = {"X-API-Key": PURPLEAIR_API_KEY}
    params = {
        "fields": "pm2.5_atm,pm2.5_cf_1,humidity,temperature,pressure,latitude,longitude,name",
        "location_type": 0,  # Outdoor sensors
        "max_age": 3600,     # Data within last hour
        "nwlng": -125.0,     # Northwest longitude (US West Coast)
        "nwlat": 49.0,       # Northwest latitude
        "selng": -66.0,      # Southeast longitude (US East Coast)
        "selat": 24.0        # Southeast latitude
    }
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('data'):
                # Convert to DataFrame
                fields = params['fields'].split(',')
                df = pd.DataFrame(data['data'], columns=['sensor_index'] + fields)
                out_file = RAW_DIR / f"purpleair_{datetime.date.today()}.csv"
                df.to_csv(out_file, index=False)
                print(f"[INFO] PurpleAir data saved → {out_file}")
                return df
        else:
            print(f"[WARN] PurpleAir failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] PurpleAir error: {e}")
    
    return pd.DataFrame()

def fetch_pandora():
    """Fetch data from Pandora network (requires credentials)"""
    if not PANDORA_API_KEY:
        print("[WARN] Pandora API key not found. Set PANDORA_API_KEY in .env file")
        return pd.DataFrame()
    
    # Pandora API endpoint (example - actual endpoint may vary)
    url = "https://pandora.gsfc.nasa.gov/api/v1/measurements"
    headers = {"Authorization": f"Bearer {PANDORA_API_KEY}"}
    params = {
        "start_date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat(),
        "end_date": datetime.date.today().isoformat(),
        "parameters": "no2,o3,hcho"
    }
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            df = pd.DataFrame(data.get('measurements', []))
            if not df.empty:
                out_file = RAW_DIR / f"pandora_{datetime.date.today()}.csv"
                df.to_csv(out_file, index=False)
                print(f"[INFO] Pandora data saved → {out_file}")
                return df
        else:
            print(f"[WARN] Pandora failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] Pandora error: {e}")
    
    return pd.DataFrame()

def fetch_tolnet():
    """Fetch data from TolNet (Tropospheric Ozone Lidar Network)"""
    # TolNet data is typically available through NASA's data portal
    # This is a placeholder for the actual implementation
    print("[INFO] TolNet data fetch placeholder (requires NASA data portal access)")
    return pd.DataFrame()

def fetch_all_ground_data():
    """Fetch data from all ground-based monitoring sources"""
    print("[INFO] Starting comprehensive ground data collection...")
    
    # Fetch from all sources
    openaq_data = fetch_openaq()
    epa_data = fetch_epa_airnow()
    purpleair_data = fetch_purpleair()
    pandora_data = fetch_pandora()
    tolnet_data = fetch_tolnet()
    
    # Combine all data sources
    all_data = []
    for name, data in [
        ("openaq", openaq_data),
        ("epa", epa_data),
        ("purpleair", purpleair_data),
        ("pandora", pandora_data),
        ("tolnet", tolnet_data)
    ]:
        if not data.empty:
            data['source'] = name
            all_data.append(data)
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"all_ground_data_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] Combined ground data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

if __name__ == "__main__":
    fetch_all_ground_data()
