from pathlib import Path
import json
import datetime

# Paths
BASE = Path(__file__).resolve().parent.parent  # project root
MODEL_DIR = BASE / "models"
MODEL_DIR.mkdir(exist_ok=True)
META_FILE = MODEL_DIR / "metadata.json"


def save_metadata(model_name, metrics, params, dataset="ml_ready/training_dataset.csv"):
    """
    Save metadata for a trained model
    """
    # Load existing metadata
    if META_FILE.exists():
        with open(META_FILE, "r") as f:
            metadata = json.load(f)
    else:
        metadata = {}

    # Add or update entry
    metadata[model_name] = {
        "trained_on": dataset,
        "timestamp": datetime.datetime.now().isoformat(),
        "metrics": metrics,
        "params": params
    }

    # Save back to file
    with open(META_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"✅ Metadata updated for {model_name}")


# Example usage if run standalone
if __name__ == "__main__":
    save_metadata(
        model_name="xgb_model",
        metrics={"RMSE": 12.4, "R2": 0.82},
        params={"n_estimators": 300, "max_depth": 6}
    )
    save_metadata(
        model_name="lstm_model",
        metrics={"MSE": 0.015},
        params={"layers": [64, 32], "time_steps": 5}
    )
