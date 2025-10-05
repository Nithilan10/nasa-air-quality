import json
import numpy as np
from pathlib import Path
import xarray as xr

RAW_DIR = Path(__file__).resolve().parent.parent / "data/raw/satellite"
OUT_FILE = Path(__file__).resolve().parent.parent / "data/processed/satellite_parsed.json"
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

data_list = []

for nc_file in RAW_DIR.glob("*.nc"):
    ds = xr.open_dataset(nc_file)
    lat = ds['latitude'].values.flatten()
    lon = ds['longitude'].values.flatten()
    no2_trop = ds['NO2_troposphere'].values.flatten() if 'NO2_troposphere' in ds else np.full_like(lat, -1e30)
    no2_strat = ds['NO2_stratosphere'].values.flatten() if 'NO2_stratosphere' in ds else np.full_like(lat, -1e30)
    time = str(ds['time'].values[0]) if 'time' in ds else '2000-01-01T00:00:00'
    
    for i in range(len(lat)):
        data_list.append({
            "lat": float(lat[i]),
            "lon": float(lon[i]),
            "no2_trop": float(no2_trop[i]),
            "no2_strat": float(no2_strat[i]),
            "time": time
        })
    ds.close()

with open(OUT_FILE, "w") as f:
    json.dump(data_list, f)
print(f"Saved {len(data_list)} satellite rows → {OUT_FILE}")
