import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data/ml_ready/enhanced_training_dataset.csv"
df = pd.read_csv(DATA_PATH, low_memory=False)

# metadata features: latitude, longitude, time features (if exist)
meta_cols = [c for c in df.columns if c in ["lat", "lon", "no2_trop", "no2_strat"]]
if not meta_cols:
    # Use available numeric columns for metadata model
    meta_cols = df.select_dtypes(include=['number']).columns.tolist()[:10]  # Use first 10 numeric columns
X = df[meta_cols]
y = df["AQI"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=300, max_depth=10)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print("Metadata RF RMSE:", mean_squared_error(y_test, y_pred)**0.5)
joblib.dump(model, Path(__file__).resolve().parent.parent.parent / "models/metadata_model.pkl")
