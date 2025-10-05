import requests
from pathlib import Path
import datetime
import os
import tarfile
import xarray as xr
import pandas as pd
from typing import List, Optional
import earthaccess
from dotenv import load_dotenv

load_dotenv()

RAW_DIR = Path(__file__).resolve().parent.parent.parent / "data/raw/satellite"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# NASA Earthdata credentials
EARTHDATA_USERNAME = os.getenv("EARTHDATA_USERNAME", "")
EARTHDATA_PASSWORD = os.getenv("EARTHDATA_PASSWORD", "")

def authenticate_earthdata():
    """Authenticate with NASA Earthdata"""
    if not EARTHDATA_USERNAME or not EARTHDATA_PASSWORD:
        print("[WARN] Earthdata credentials not found. Set EARTHDATA_USERNAME and EARTHDATA_PASSWORD in .env file")
        return False
    
    try:
        earthaccess.login(EARTHDATA_USERNAME, EARTHDATA_PASSWORD)
        print("[INFO] Successfully authenticated with NASA Earthdata")
        return True
    except Exception as e:
        print(f"[ERROR] Earthdata authentication failed: {e}")
        return False

def download_tempo_no2(start_date=None, end_date=None, bbox=None):
    """Download TEMPO NO2 Level 2 data"""
    start_date = start_date or (datetime.date.today() - datetime.timedelta(days=1))
    end_date = end_date or datetime.date.today()
    
    if not authenticate_earthdata():
        return pd.DataFrame()
    
    # TEMPO NO2 Level 2 product search
    results = earthaccess.search_data(
        short_name="TEMPO_NO2_L2",
        bounding_box=bbox,  # [west, south, east, north]
        temporal=(start_date.isoformat(), end_date.isoformat()),
        count=100
    )
    
    downloaded_files = []
    for result in results:
        try:
            files = earthaccess.download(result, RAW_DIR)
            downloaded_files.extend(files)
            print(f"[INFO] Downloaded TEMPO NO2 file: {files[0].name}")
        except Exception as e:
            print(f"[ERROR] Failed to download TEMPO NO2 file: {e}")
    
    return process_tempo_files(downloaded_files, "NO2")

def download_tempo_hcho(start_date=None, end_date=None, bbox=None):
    """Download TEMPO HCHO (formaldehyde) Level 2 data"""
    start_date = start_date or (datetime.date.today() - datetime.timedelta(days=1))
    end_date = end_date or datetime.date.today()
    
    if not authenticate_earthdata():
        return pd.DataFrame()
    
    # TEMPO HCHO Level 2 product search
    results = earthaccess.search_data(
        short_name="TEMPO_HCHO_L2",
        bounding_box=bbox,
        temporal=(start_date.isoformat(), end_date.isoformat()),
        count=100
    )
    
    downloaded_files = []
    for result in results:
        try:
            files = earthaccess.download(result, RAW_DIR)
            downloaded_files.extend(files)
            print(f"[INFO] Downloaded TEMPO HCHO file: {files[0].name}")
        except Exception as e:
            print(f"[ERROR] Failed to download TEMPO HCHO file: {e}")
    
    return process_tempo_files(downloaded_files, "HCHO")

def download_tempo_o3(start_date=None, end_date=None, bbox=None):
    """Download TEMPO O3 (ozone) Level 2 data"""
    start_date = start_date or (datetime.date.today() - datetime.timedelta(days=1))
    end_date = end_date or datetime.date.today()
    
    if not authenticate_earthdata():
        return pd.DataFrame()
    
    # TEMPO O3 Level 2 product search
    results = earthaccess.search_data(
        short_name="TEMPO_O3_L2",
        bounding_box=bbox,
        temporal=(start_date.isoformat(), end_date.isoformat()),
        count=100
    )
    
    downloaded_files = []
    for result in results:
        try:
            files = earthaccess.download(result, RAW_DIR)
            downloaded_files.extend(files)
            print(f"[INFO] Downloaded TEMPO O3 file: {files[0].name}")
        except Exception as e:
            print(f"[ERROR] Failed to download TEMPO O3 file: {e}")
    
    return process_tempo_files(downloaded_files, "O3")

def process_tempo_files(file_paths: List[str], parameter: str):
    """Process downloaded TEMPO NetCDF files and extract data"""
    all_data = []
    
    for file_path in file_paths:
        try:
            # Open NetCDF file
            ds = xr.open_dataset(file_path)
            
            # Extract relevant variables
            if parameter == "NO2":
                data_var = ds.get('nitrogendioxide_tropospheric_column', ds.get('NO2_column', None))
            elif parameter == "HCHO":
                data_var = ds.get('formaldehyde_tropospheric_column', ds.get('HCHO_column', None))
            elif parameter == "O3":
                data_var = ds.get('ozone_total_column', ds.get('O3_column', None))
            else:
                continue
            
            if data_var is None:
                print(f"[WARN] Parameter {parameter} not found in {file_path}")
                continue
            
            # Convert to DataFrame
            df = data_var.to_dataframe().reset_index()
            df['parameter'] = parameter
            df['file_source'] = file_path.name
            df['download_time'] = datetime.datetime.now()
            
            all_data.append(df)
            print(f"[INFO] Processed {parameter} data from {file_path.name}: {len(df)} records")
            
        except Exception as e:
            print(f"[ERROR] Failed to process {file_path}: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"tempo_{parameter.lower()}_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] TEMPO {parameter} data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

def download_modis_aod(start_date=None, end_date=None, bbox=None):
    """Download MODIS Aerosol Optical Depth data for validation"""
    start_date = start_date or (datetime.date.today() - datetime.timedelta(days=1))
    end_date = end_date or datetime.date.today()
    
    if not authenticate_earthdata():
        return pd.DataFrame()
    
    # MODIS AOD product search
    results = earthaccess.search_data(
        short_name="MOD04_L2",  # MODIS Terra AOD
        bounding_box=bbox,
        temporal=(start_date.isoformat(), end_date.isoformat()),
        count=50
    )
    
    downloaded_files = []
    for result in results:
        try:
            files = earthaccess.download(result, RAW_DIR)
            downloaded_files.extend(files)
            print(f"[INFO] Downloaded MODIS AOD file: {files[0].name}")
        except Exception as e:
            print(f"[ERROR] Failed to download MODIS AOD file: {e}")
    
    return process_modis_files(downloaded_files)

def process_modis_files(file_paths: List[str]):
    """Process MODIS files and extract AOD data"""
    all_data = []
    
    for file_path in file_paths:
        try:
            ds = xr.open_dataset(file_path)
            
            # Extract AOD data
            aod_var = ds.get('Optical_Depth_Land_And_Ocean', ds.get('AOD', None))
            if aod_var is None:
                continue
            
            df = aod_var.to_dataframe().reset_index()
            df['parameter'] = 'AOD'
            df['file_source'] = file_path.name
            df['download_time'] = datetime.datetime.now()
            
            all_data.append(df)
            print(f"[INFO] Processed MODIS AOD data from {file_path.name}: {len(df)} records")
            
        except Exception as e:
            print(f"[ERROR] Failed to process MODIS file {file_path}: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"modis_aod_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] MODIS AOD data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

def download_sentinel5p(start_date=None, end_date=None, bbox=None):
    """Download Sentinel-5P data for validation"""
    start_date = start_date or (datetime.date.today() - datetime.timedelta(days=1))
    end_date = end_date or datetime.date.today()
    
    if not authenticate_earthdata():
        return pd.DataFrame()
    
    # Sentinel-5P product search
    results = earthaccess.search_data(
        short_name="S5P_L2__NO2___",
        bounding_box=bbox,
        temporal=(start_date.isoformat(), end_date.isoformat()),
        count=50
    )
    
    downloaded_files = []
    for result in results:
        try:
            files = earthaccess.download(result, RAW_DIR)
            downloaded_files.extend(files)
            print(f"[INFO] Downloaded Sentinel-5P file: {files[0].name}")
        except Exception as e:
            print(f"[ERROR] Failed to download Sentinel-5P file: {e}")
    
    return process_sentinel5p_files(downloaded_files)

def process_sentinel5p_files(file_paths: List[str]):
    """Process Sentinel-5P files"""
    all_data = []
    
    for file_path in file_paths:
        try:
            ds = xr.open_dataset(file_path)
            
            # Extract NO2 data
            no2_var = ds.get('nitrogendioxide_tropospheric_column', ds.get('NO2_column', None))
            if no2_var is None:
                continue
            
            df = no2_var.to_dataframe().reset_index()
            df['parameter'] = 'NO2_S5P'
            df['file_source'] = file_path.name
            df['download_time'] = datetime.datetime.now()
            
            all_data.append(df)
            print(f"[INFO] Processed Sentinel-5P data from {file_path.name}: {len(df)} records")
            
        except Exception as e:
            print(f"[ERROR] Failed to process Sentinel-5P file {file_path}: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"sentinel5p_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] Sentinel-5P data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

def download_all_satellite_data(bbox=None):
    """Download data from all satellite sources"""
    print("[INFO] Starting comprehensive satellite data collection...")
    
    # Default bounding box for North America (can be customized)
    if bbox is None:
        bbox = [-125.0, 24.0, -66.0, 49.0]  # [west, south, east, north]
    
    # Download from all sources
    tempo_no2 = download_tempo_no2(bbox=bbox)
    tempo_hcho = download_tempo_hcho(bbox=bbox)
    tempo_o3 = download_tempo_o3(bbox=bbox)
    modis_aod = download_modis_aod(bbox=bbox)
    sentinel5p = download_sentinel5p(bbox=bbox)
    
    # Combine all satellite data
    all_data = []
    for name, data in [
        ("tempo_no2", tempo_no2),
        ("tempo_hcho", tempo_hcho),
        ("tempo_o3", tempo_o3),
        ("modis_aod", modis_aod),
        ("sentinel5p", sentinel5p)
    ]:
        if not data.empty:
            data['satellite_source'] = name
            all_data.append(data)
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        out_file = RAW_DIR / f"all_satellite_data_{datetime.date.today()}.csv"
        combined_df.to_csv(out_file, index=False)
        print(f"[INFO] Combined satellite data saved → {out_file}")
        return combined_df
    
    return pd.DataFrame()

if __name__ == "__main__":
    download_all_satellite_data()
