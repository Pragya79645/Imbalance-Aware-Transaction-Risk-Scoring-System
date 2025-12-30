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

@app.post("/predict")
def predict(transaction: Transaction):
    try:
        X = np.array(transaction.features).reshape(1, -1)
        X_scaled = scaler.transform(X)

        prob = model.predict_proba(X_scaled)[0][1]
        prediction = int(prob > 0.41)  # optimized threshold

        return {
            "fraud_probability": float(prob),
            "prediction": "Fraud" if prediction == 1 else "Not Fraud"
        }
    except Exception as e:
        return {
            "error": str(e),
            "fraud_probability": None,
            "prediction": None
        }

