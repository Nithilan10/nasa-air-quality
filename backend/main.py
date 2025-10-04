from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Import model modules
import models.air_quality as air_quality
import models.forecast as forecast
import models.carbon_tracker as carbon_tracker
import models.health_advisor as health_advisor
import models.alert_system as alert_system

# Global model variables
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    print("Loading models...")
    try:
        models['xgb'] = air_quality.load_xgb_model()
        print("✅ XGBoost model loaded")
    except Exception as e:
        print(f"⚠️  XGBoost model loading failed: {e}")
    
    try:
        models['lstm'] = forecast.load_lstm_model()
        print("✅ LSTM model loaded")
    except Exception as e:
        print(f"⚠️  LSTM model loading failed: {e}")
    
    try:
        models['gpt'] = health_advisor.load_gpt_model()
        print("✅ GPT-2 model loaded")
    except Exception as e:
        print(f"⚠️  GPT-2 model loading failed: {e}")
    
    try:
        models['rf'] = alert_system.load_rf_model()
        print("✅ Random Forest model loaded")
    except Exception as e:
        print(f"⚠️  Random Forest model loading failed: {e}")
    
    print("Model loading completed!")
    yield
    # Cleanup on shutdown
    print("Shutting down...")

app = FastAPI(
    title="Air Quality Prediction API",
    description="API for air quality forecasting, health recommendations, and carbon tracking",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(air_quality.router, prefix="/api/v1/air-quality", tags=["Air Quality"])
app.include_router(forecast.router, prefix="/api/v1/forecast", tags=["Forecast"])
app.include_router(carbon_tracker.router, prefix="/api/v1/carbon", tags=["Carbon"])
app.include_router(health_advisor.router, prefix="/api/v1/health", tags=["Health"])
app.include_router(alert_system.router, prefix="/api/v1/alerts", tags=["Alerts"])

@app.get("/")
async def root():
    return {"message": "Air Quality Prediction API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": len(models)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)