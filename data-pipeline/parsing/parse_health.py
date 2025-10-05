import json
import pandas as pd
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent.parent / "data/raw/health"
OUT_FILE = Path(__file__).resolve().parent.parent / "data/processed/health_parsed.json"
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

data_list = []

for csv_file in RAW_DIR.glob("*.csv"):
    df = pd.read_csv(csv_file)
    for _, row in df.iterrows():
        data_list.append({
            "lat": float(row.get("lat", -1e30)),
            "lon": float(row.get("lon", -1e30)),
            "asthma_rate": float(row.get("asthma_rate", -1e30)),
            "respiratory_hospitalizations": float(row.get("resp_hosp", -1e30)),
            "time": str(row.get("year", "2000-01-01"))
        })

with open(OUT_FILE, "w") as f:
    json.dump(data_list, f)
print(f"Saved {len(data_list)} health rows → {OUT_FILE}")
