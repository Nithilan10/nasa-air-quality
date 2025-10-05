import pandas as pd
import xgboost as xgb
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data/ml_ready/enhanced_training_dataset.csv"
df = pd.read_csv(DATA_PATH)

# Use AQI as target variable for air quality prediction
# Only use numeric columns for XGBoost
numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
X = df[numeric_cols].drop(["AQI"], axis=1, errors='ignore')
y = df["AQI"]

# Remove any remaining non-numeric columns
X = X.select_dtypes(include=['number'])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = xgb.XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print("XGB RMSE:", mean_squared_error(y_test, y_pred)**0.5)
joblib.dump(model, Path(__file__).resolve().parent.parent.parent / "models/xgb_model.pkl")
