# Fraud Detection ML Pipeline

A production-oriented machine learning system for detecting high-risk financial transactions in highly imbalanced datasets, using a multi-strategy modeling approach rather than relying on a single oversampling technique.

# 📌 Project Overview

Financial fraud detection is a rare-event classification problem, where fraudulent transactions represent a very small fraction of total data.
This project demonstrates how to design, evaluate, and deploy ML models realistically under extreme class imbalance.

Instead of treating fraud detection as a generic binary classification task, this system focuses on:

Handling severe data imbalance

Prioritizing recall and risk detection over raw accuracy

Comparing supervised and unsupervised modeling approaches

Deploying models via a FastAPI backend

Providing a frontend interface for real-time transaction risk scoring

# 🎯 Key Objectives

Detect high-risk (fraudulent) transactions in imbalanced data

Avoid misleading accuracy-based evaluation

Compare multiple modeling strategies

Build a deployable, end-to-end ML pipeline

Make predictions interpretable and usable for real users

# 🧠 Core ML Concepts Demonstrated

Class imbalance handling (data-level + algorithm-level)

Precision–Recall tradeoff

Threshold optimization

Anomaly detection for rare events

Model comparison and selection

Real-world deployment considerations

# 📊 Models Implemented
1️⃣ Baseline Logistic Regression

Trained on original imbalanced data

No oversampling or class balancing

Used to demonstrate why accuracy fails in fraud detection

📌 Purpose: Baseline reference model

2️⃣ Logistic Regression + SMOTE

Uses Synthetic Minority Over-sampling Technique (SMOTE)

Applied only to training data

Improves recall for fraud class

Used mainly for experimentation and comparison

📌 Purpose: Analyze impact of data-level balancing
⚠️ Not used as final production model

3️⃣ Random Forest Classifier (Primary Model)

300 decision trees

Max depth limited to avoid overfitting

Uses class_weight = 'balanced'

Partial minority oversampling (10%)

Custom decision threshold (≠ 0.5)

# 📌 Purpose: Realistic supervised fraud detection
✅ Main production model

4️⃣ Isolation Forest (Unsupervised)

Trained only on normal transactions

No labels required

No synthetic data

Detects anomalies as potential fraud

📌 Purpose: Detect rare, unseen fraud patterns
💡 Useful when labels are noisy or incomplete

⚖️ Handling Highly Imbalanced Data (IMPORTANT)

This project does NOT rely on SMOTE alone.

Instead, imbalance is handled using a multi-strategy approach:

# ✅ Techniques Used

Baseline learning to expose imbalance effects

SMOTE for experimental comparison

Class weighting in Random Forest

Threshold tuning for realistic predictions

Precision-Recall & PR-AUC evaluation

Anomaly detection without synthetic data

# ❌ Techniques Avoided

Blind accuracy optimization

Full dataset oversampling

Hard-coded 50% decision thresholds

# 📈 Model Evaluation Metrics

Because fraud detection is a rare-event problem, the following metrics are used:

Precision

Recall

F1-Score

PR-AUC (Precision-Recall Area Under Curve)

🚫 Accuracy is intentionally NOT used as the primary metric.

# 🔧 Threshold Optimization

Instead of using a default 0.5 probability threshold:

Thresholds are tuned to maximize F1-score

Recall is prioritized to minimize missed fraud cases

Produces more realistic risk predictions

# 🔌 API Backend (FastAPI)
Endpoint

POST /predict

Request
{
  "features": [value1, value2, ..., valueN]
}

Response
{
  "prediction": 0,
  "risk_label": "Low Risk",
  "fraud_probability": 0.21,
  "model_used": "random_forest"
}


## 📦 Dependencies

### Python Packages
- **Data Processing**: numpy, pandas, scikit-learn
- **ML Models**: scikit-learn, imbalanced-learn, xgboost, lightgbm
- **API**: fastapi, uvicorn
- **Model Persistence**: joblib
- **Visualization**: matplotlib, seaborn

### Node.js Packages
- **Framework**: Next.js, React
- **Styling**: Tailwind CSS
- **API Client**: axios or fetch



