import json
import pandas as pd
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent.parent / "data/raw/weather"
OUT_FILE = Path(__file__).resolve().parent.parent / "data/processed/weather_parsed.json"
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

data_list = []

for csv_file in RAW_DIR.glob("*.csv"):
    df = pd.read_csv(csv_file)
    for _, row in df.iterrows():
        data_list.append({
            "lat": float(row.get("latitude", row.get("lat", -1e30))),
            "lon": float(row.get("longitude", row.get("lon", -1e30))),
            "temperature": float(row.get("temperature", -1e30)),
            "humidity": float(row.get("humidity", -1e30)),
            "wind_speed": float(row.get("wind_speed", -1e30)),
            "pressure": float(row.get("pressure", -1e30)),
            "time": str(row.get("time", "2000-01-01T00:00:00"))
        })

with open(OUT_FILE, "w") as f:
    json.dump(data_list, f)
print(f"Saved {len(data_list)} weather rows → {OUT_FILE}")
