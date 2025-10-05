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

RAW_DIR = Path(__file__).resolve().parent.parent.parent / "data/raw/carbon"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# API Keys (set in .env file)
EPA_EMISSIONS_API_KEY = os.getenv("EPA_EMISSIONS_API_KEY", "")
EIA_API_KEY = os.getenv("EIA_API_KEY", "")
CARBON_FOOTPRINT_API_KEY = os.getenv("CARBON_FOOTPRINT_API_KEY", "")

# Default locations for carbon data
LOCATIONS = [
    {"name": "Seattle", "state": "WA", "fips": "53033"},
    {"name": "New York", "state": "NY", "fips": "36061"},
    {"name": "Los Angeles", "state": "CA", "fips": "06037"},
    {"name": "Chicago", "state": "IL", "fips": "17031"},
    {"name": "Houston", "state": "TX", "fips": "48201"}
]

def fetch_epa_emissions_data():
    """Fetch emissions data from EPA"""
    if not EPA_EMISSIONS_API_KEY:
        print("[WARN] EPA Emissions API key not found. Set EPA_EMISSIONS_API_KEY in .env file")
        return pd.DataFrame()
    
    all_data = []
    today = datetime.date.today()
    
    # EPA Air Emissions data
    url = "https://api.epa.gov/air-emissions/v1/emissions"
    params = {
        "api_key": EPA_EMISSIONS_API_KEY,
        "year": today.year,
        "state": "ALL"
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            df = pd.DataFrame(data.get('data', []))
            df['data_source'] = 'EPA_EMISSIONS'
            all_data.append(df)
            print(f"[INFO] EPA emissions data: {len(df)} records")
        else:
            print(f"[WARN] EPA emissions data failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] EPA emissions data error: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"epa_emissions_{today}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] EPA emissions data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

def fetch_eia_energy_data():
    """Fetch energy consumption data from EIA"""
    if not EIA_API_KEY:
        print("[WARN] EIA API key not found. Set EIA_API_KEY in .env file")
        return pd.DataFrame()
    
    all_data = []
    today = datetime.date.today()
    
    # EIA State Energy Data
    url = "https://api.eia.gov/v2/electricity/state/data/"
    params = {
        "api_key": EIA_API_KEY,
        "frequency": "annual",
        "data[0]": "generation",
        "data[1]": "consumption",
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        "length": 5000
    }
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            df = pd.DataFrame(data.get('response', {}).get('data', []))
            df['data_source'] = 'EIA_ENERGY'
            all_data.append(df)
            print(f"[INFO] EIA energy data: {len(df)} records")
        else:
            print(f"[WARN] EIA energy data failed: {resp.status_code}")
    except Exception as e:
        print(f"[ERROR] EIA energy data error: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"eia_energy_{today}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] EIA energy data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

def fetch_transportation_emissions():
    """Fetch transportation emissions data"""
    all_data = []
    today = datetime.date.today()
    
    # Transportation emissions factors (EPA data)
    transportation_factors = {
        "gasoline_car": 8.89,  # kg CO2 per gallon
        "diesel_car": 10.16,   # kg CO2 per gallon
        "electric_car": 0.0,   # kg CO2 per mile (varies by grid)
        "public_transit": 0.17, # kg CO2 per passenger mile
        "airplane": 0.255,     # kg CO2 per passenger mile
        "train": 0.041,        # kg CO2 per passenger mile
    }
    
    # Simulated transportation data by location
    for loc in LOCATIONS:
        transport_data = {
            "location": loc["name"],
            "state": loc["state"],
            "fips": loc["fips"],
            "avg_daily_vehicle_miles": 25.0 + (hash(loc["name"]) % 20),
            "public_transit_usage_rate": 0.15 + (hash(loc["name"]) % 30) / 100,
            "electric_vehicle_penetration": 0.05 + (hash(loc["name"]) % 15) / 100,
            "data_source": "TRANSPORTATION_EMISSIONS",
            "date": today.isoformat()
        }
        
        # Calculate estimated daily emissions
        daily_emissions = (
            transport_data["avg_daily_vehicle_miles"] * 0.7 * transportation_factors["gasoline_car"] / 25 +  # Gas cars
            transport_data["avg_daily_vehicle_miles"] * 0.25 * transportation_factors["diesel_car"] / 25 +  # Diesel cars
            transport_data["avg_daily_vehicle_miles"] * transport_data["electric_vehicle_penetration"] * 0.1  # Electric (grid dependent)
        )
        
        transport_data["estimated_daily_co2_kg"] = daily_emissions
        all_data.append(transport_data)
    
    if all_data:
        df = pd.DataFrame(all_data)
        out_file = RAW_DIR / f"transportation_emissions_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] Transportation emissions data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_food_carbon_data():
    """Fetch food carbon footprint data"""
    all_data = []
    today = datetime.date.today()
    
    # Food carbon footprint factors (kg CO2 per kg of food)
    food_factors = {
        "beef": 27.0,
        "lamb": 21.0,
        "cheese": 13.5,
        "pork": 12.1,
        "chicken": 6.9,
        "eggs": 4.2,
        "rice": 3.6,
        "wheat": 2.1,
        "vegetables": 2.0,
        "fruits": 1.1,
        "nuts": 0.3
    }
    
    # Simulated food consumption data by location
    for loc in LOCATIONS:
        food_data = {
            "location": loc["name"],
            "state": loc["state"],
            "fips": loc["fips"],
            "avg_daily_meat_consumption_kg": 0.2 + (hash(loc["name"]) % 10) / 100,
            "avg_daily_dairy_consumption_kg": 0.3 + (hash(loc["name"]) % 15) / 100,
            "avg_daily_vegetable_consumption_kg": 0.4 + (hash(loc["name"]) % 20) / 100,
            "data_source": "FOOD_CARBON",
            "date": today.isoformat()
        }
        
        # Calculate estimated daily food emissions
        daily_food_emissions = (
            food_data["avg_daily_meat_consumption_kg"] * food_factors["beef"] * 0.4 +  # Beef
            food_data["avg_daily_meat_consumption_kg"] * food_factors["chicken"] * 0.6 +  # Chicken
            food_data["avg_daily_dairy_consumption_kg"] * food_factors["cheese"] * 0.3 +  # Cheese
            food_data["avg_daily_dairy_consumption_kg"] * food_factors["eggs"] * 0.7 +  # Eggs
            food_data["avg_daily_vegetable_consumption_kg"] * food_factors["vegetables"]  # Vegetables
        )
        
        food_data["estimated_daily_food_co2_kg"] = daily_food_emissions
        all_data.append(food_data)
    
    if all_data:
        df = pd.DataFrame(all_data)
        out_file = RAW_DIR / f"food_carbon_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] Food carbon data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_consumer_product_emissions():
    """Fetch consumer product carbon footprint data"""
    all_data = []
    today = datetime.date.today()
    
    # Consumer product carbon factors (kg CO2 per item)
    product_factors = {
        "smartphone": 55.0,
        "laptop": 200.0,
        "clothing_item": 25.0,
        "furniture_item": 100.0,
        "electronics": 50.0,
        "household_appliance": 150.0
    }
    
    # Simulated consumer behavior data by location
    for loc in LOCATIONS:
        consumer_data = {
            "location": loc["name"],
            "state": loc["state"],
            "fips": loc["fips"],
            "avg_monthly_electronics_purchases": 0.5 + (hash(loc["name"]) % 5) / 10,
            "avg_monthly_clothing_purchases": 2.0 + (hash(loc["name"]) % 10) / 10,
            "avg_monthly_furniture_purchases": 0.1 + (hash(loc["name"]) % 3) / 10,
            "data_source": "CONSUMER_PRODUCTS",
            "date": today.isoformat()
        }
        
        # Calculate estimated monthly consumer emissions
        monthly_consumer_emissions = (
            consumer_data["avg_monthly_electronics_purchases"] * product_factors["smartphone"] * 0.6 +
            consumer_data["avg_monthly_electronics_purchases"] * product_factors["laptop"] * 0.4 +
            consumer_data["avg_monthly_clothing_purchases"] * product_factors["clothing_item"] +
            consumer_data["avg_monthly_furniture_purchases"] * product_factors["furniture_item"]
        )
        
        consumer_data["estimated_monthly_consumer_co2_kg"] = monthly_consumer_emissions
        all_data.append(consumer_data)
    
    if all_data:
        df = pd.DataFrame(all_data)
        out_file = RAW_DIR / f"consumer_products_{today}.csv"
        df.to_csv(out_file, index=False)
        print(f"[INFO] Consumer products data saved → {out_file}")
        return df
    
    return pd.DataFrame()

def fetch_all_carbon_data():
    """Fetch data from all carbon footprint sources"""
    print("[INFO] Starting comprehensive carbon footprint data collection...")
    
    # Fetch from all sources
    epa_emissions = fetch_epa_emissions_data()
    eia_energy = fetch_eia_energy_data()
    transportation = fetch_transportation_emissions()
    food_carbon = fetch_food_carbon_data()
    consumer_products = fetch_consumer_product_emissions()
    
    # Combine all carbon data
    all_data = []
    for name, data in [
        ("epa_emissions", epa_emissions),
        ("eia_energy", eia_energy),
        ("transportation", transportation),
        ("food_carbon", food_carbon),
        ("consumer_products", consumer_products)
    ]:
        if not data.empty:
            data['carbon_source'] = name
            all_data.append(data)
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"all_carbon_data_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] Combined carbon data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

if __name__ == "__main__":
    fetch_all_carbon_data()
