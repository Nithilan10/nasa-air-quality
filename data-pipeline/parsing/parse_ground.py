import json
import pandas as pd
from pathlib import Path
from datetime import datetime

RAW_DIR = Path(__file__).resolve().parent.parent / "data/raw/ground"
OUT_FILE = Path(__file__).resolve().parent.parent / "data/processed/ground_parsed.json"
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

data_list = []

for csv_file in RAW_DIR.glob("*.csv"):
    df = pd.read_csv(csv_file)
    if 'datetime' in df.columns:
        df['time'] = pd.to_datetime(df['datetime'])
    elif 'timestamp' in df.columns:
        df['time'] = pd.to_datetime(df['timestamp'])
    
    for _, row in df.iterrows():
        data_list.append({
            "lat": float(row.get("latitude", row.get("lat", -1e30))),
            "lon": float(row.get("longitude", row.get("lon", -1e30))),
            "no2_total": float(row.get("no2", -1e30)),
            "pm25": float(row.get("pm25", -1e30)),
            "o3": float(row.get("o3", -1e30)),
            "time": row['time'].isoformat() if 'time' in row else '2000-01-01T00:00:00'
        })

with open(OUT_FILE, "w") as f:
    json.dump(data_list, f)
print(f"Saved {len(data_list)} ground rows → {OUT_FILE}")
