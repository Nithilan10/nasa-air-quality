import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data/ml_ready/enhanced_training_dataset.csv"
df = pd.read_csv(DATA_PATH, low_memory=False)

# Use AQI as target variable and only numeric features
numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
X = df[numeric_cols].drop(["AQI"], axis=1, errors='ignore').values
y = df["AQI"].values.reshape(-1, 1)

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()
X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y)

X_scaled = X_scaled.reshape((X_scaled.shape[0], 1, X_scaled.shape[1]))
model = Sequential()
model.add(LSTM(64, input_shape=(X_scaled.shape[1], X_scaled.shape[2])))
model.add(Dense(1))
model.compile(optimizer="adam", loss="mse")
model.fit(X_scaled, y_scaled, epochs=50, batch_size=32, validation_split=0.2, callbacks=[EarlyStopping(patience=5)])
model.save(Path(__file__).resolve().parent.parent.parent / "models/lstm_model.h5")
