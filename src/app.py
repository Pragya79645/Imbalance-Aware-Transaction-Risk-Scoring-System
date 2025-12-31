from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_curve, auc, f1_score, recall_score, precision_score, confusion_matrix

# Load model and scaler
model = joblib.load("rf_fraud_model.pkl")
scaler = joblib.load("scaler.pkl")

# Try to load additional models if they exist
try:
    baseline_model = joblib.load("baseline_lr_model.pkl")
except:
    baseline_model = None

try:
    smote_model = joblib.load("smote_lr_model.pkl")
except:
    smote_model = None

try:
    iso_forest = joblib.load("iso_forest_model.pkl")
except:
    iso_forest = None

app = FastAPI(title="Fraud Detection API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://imbalance-aware-transaction-risk-scoring-ian5.onrender.com"],
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

@app.get("/models")
def get_available_models():
    """Get list of available models."""
    return {
        "models": [
            {"name": "Random Forest", "id": "rf", "available": True},
            {"name": "Baseline Model", "id": "baseline", "available": baseline_model is not None},
            {"name": "SMOTE Model", "id": "smote", "available": smote_model is not None},
            {"name": "Isolation Forest", "id": "iso_forest", "available": iso_forest is not None},
        ]
    }

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

@app.post("/compare")
def compare_models(transaction: Transaction):
    """Compare predictions across multiple models."""
    try:
        X = np.array(transaction.features).reshape(1, -1)
        X_scaled = scaler.transform(X)
        
        results = {
            "random_forest": None,
            "baseline": None,
            "smote": None,
            "isolation_forest": None,
        }
        
        # Random Forest prediction
        try:
            prob_rf = model.predict_proba(X_scaled)[0][1]
            prediction_rf = int(prob_rf > 0.41)
            results["random_forest"] = {
                "fraud_probability": float(prob_rf),
                "prediction": "Fraud" if prediction_rf == 1 else "Not Fraud",
                "risk_level": get_risk_level(prob_rf),
                "threshold": 0.41
            }
        except Exception as e:
            results["random_forest"] = {"error": str(e)}
        
        # Baseline Logistic Regression
        if baseline_model:
            try:
                prob_baseline = baseline_model.predict_proba(X_scaled)[0][1]
                prediction_baseline = baseline_model.predict(X_scaled)[0]
                results["baseline"] = {
                    "fraud_probability": float(prob_baseline),
                    "prediction": "Fraud" if prediction_baseline == 1 else "Not Fraud",
                    "risk_level": get_risk_level(prob_baseline),
                    "threshold": 0.5
                }
            except Exception as e:
                results["baseline"] = {"error": str(e)}
        
        # SMOTE Logistic Regression
        if smote_model:
            try:
                prob_smote = smote_model.predict_proba(X_scaled)[0][1]
                prediction_smote = smote_model.predict(X_scaled)[0]
                results["smote"] = {
                    "fraud_probability": float(prob_smote),
                    "prediction": "Fraud" if prediction_smote == 1 else "Not Fraud",
                    "risk_level": get_risk_level(prob_smote),
                    "threshold": 0.5
                }
            except Exception as e:
                results["smote"] = {"error": str(e)}
        
        # Isolation Forest
        if iso_forest:
            try:
                pred_iso = iso_forest.predict(X_scaled)[0]
                score_iso = iso_forest.score_samples(X_scaled)[0]
                # Normalize anomaly score to 0-1
                prob_iso = 1 / (1 + np.exp(score_iso))
                results["isolation_forest"] = {
                    "fraud_probability": float(prob_iso),
                    "prediction": "Fraud" if pred_iso == -1 else "Not Fraud",
                    "risk_level": get_risk_level(prob_iso),
                    "anomaly_score": float(score_iso)
                }
            except Exception as e:
                results["isolation_forest"] = {"error": str(e)}
        
        return results
    except Exception as e:
        return {
            "error": str(e),
            "random_forest": None,
            "baseline": None,
            "smote": None,
            "isolation_forest": None,
        }


# Load test dataset for metrics calculation
try:
    data = pd.read_csv('../data/raw')
    if data is not None:
        y_test_global = data['Class'] if 'Class' in data.columns else None
        X_test_global = data.drop('Class', axis=1) if 'Class' in data.columns else data
        X_test_global_scaled = scaler.transform(X_test_global)
except Exception as e:
    print(f"Warning: Could not load test data for metrics: {e}")
    y_test_global = None
    X_test_global_scaled = None


@app.get("/metrics")
def get_metrics():
    """Get model performance metrics: PR-AUC, F1-Score, Recall (Fraud class)."""
    if y_test_global is None or X_test_global_scaled is None:
        return {
            "error": "Test data not available for metrics calculation",
            "metrics": None
        }
    
    try:
        # Get predictions from the main RF model
        y_probs = model.predict_proba(X_test_global_scaled)[:, 1]
        y_pred = (y_probs > 0.41).astype(int)
        
        # Calculate PR-AUC
        precision, recall, _ = precision_recall_curve(y_test_global, y_probs)
        pr_auc = auc(recall, precision)
        
        # Calculate F1-Score (weighted for class imbalance)
        f1 = f1_score(y_test_global, y_pred)
        
        # Calculate Recall for fraud class (class 1)
        recall_fraud = recall_score(y_test_global, y_pred, pos_label=1)
        
        # Calculate precision for fraud class for context
        precision_fraud = precision_score(y_test_global, y_pred, pos_label=1)
        
        return {
            "metrics": {
                "pr_auc": float(pr_auc),
                "f1_score": float(f1),
                "recall_fraud": float(recall_fraud),
                "precision_fraud": float(precision_fraud),
                "threshold": 0.41
            },
            "explanation": "Accuracy is hidden because it's misleading with imbalanced data. These metrics better capture fraud detection performance."
        }
    except Exception as e:
        return {
            "error": str(e),
            "metrics": None
        }


@app.get("/threshold-metrics")
def get_threshold_metrics(threshold: float = Query(0.5, ge=0.0, le=1.0)):
    """
    Calculate metrics at a specific threshold.
    Shows how recall and false positives change with threshold.
    """
    if y_test_global is None or X_test_global_scaled is None:
        return {
            "error": "Test data not available for metrics calculation",
            "metrics": None
        }
    
    try:
        # Get predictions from the main RF model
        y_probs = model.predict_proba(X_test_global_scaled)[:, 1]
        y_pred = (y_probs > threshold).astype(int)
        
        # Calculate metrics
        recall_fraud = recall_score(y_test_global, y_pred, pos_label=1, zero_division=0)
        precision_fraud = precision_score(y_test_global, y_pred, pos_label=1, zero_division=0)
        f1 = f1_score(y_test_global, y_pred, zero_division=0)
        
        # Calculate false positives
        tn, fp, fn, tp = confusion_matrix(y_test_global, y_pred).ravel()
        false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
        false_positives = int(fp)
        
        # Calculate total positive detections
        total_predicted_fraud = int(np.sum(y_pred))
        
        return {
            "threshold": float(threshold),
            "recall": float(recall_fraud),
            "precision": float(precision_fraud),
            "f1_score": float(f1),
            "false_positives": false_positives,
            "false_positive_rate": float(false_positive_rate),
            "true_positives": int(tp),
            "total_predicted_fraud": total_predicted_fraud,
            "total_fraud_cases": int(np.sum(y_test_global))
        }
    except Exception as e:
        return {
            "error": str(e),
            "metrics": None
        }

