from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from pydantic import BaseModel

# Load model and scaler
model = joblib.load("rf_fraud_model.pkl")
scaler = joblib.load("scaler.pkl")

app = FastAPI(title="Fraud Detection API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Input schema
class Transaction(BaseModel):
    features: list  # list of numbers

@app.get("/")
def root():
    return {"message": "Fraud Detection API is running", "status": "OK"}

def get_risk_level(probability: float) -> str:
    """Determine risk level based on fraud probability."""
    if probability < 0.30:
        return "Low Risk"
    elif probability < 0.60:
        return "Medium Risk"
    else:
        return "High Risk"

@app.post("/predict")
def predict(transaction: Transaction):
    try:
        X = np.array(transaction.features).reshape(1, -1)
        X_scaled = scaler.transform(X)

        prob = model.predict_proba(X_scaled)[0][1]
        prediction = int(prob > 0.41)  # optimized threshold
        risk_level = get_risk_level(prob)

        return {
            "fraud_probability": float(prob),
            "prediction": "Fraud" if prediction == 1 else "Not Fraud",
            "risk_level": risk_level
        }
    except Exception as e:
        return {
            "error": str(e),
            "fraud_probability": None,
            "prediction": None,
            "risk_level": None
        }

