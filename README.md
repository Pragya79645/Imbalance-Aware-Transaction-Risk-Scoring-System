# Fraud Detection ML Pipeline

A comprehensive machine learning pipeline for detecting fraudulent transactions using multiple classification and anomaly detection algorithms. This project includes a FastAPI backend, Next.js frontend, and a complete model training/evaluation workflow with interactive notebooks.

## 📋 Project Overview

This fraud detection system implements:
- **Multiple ML Models**: Logistic Regression, Random Forest, Isolation Forest
- **Handling Imbalanced Data**: SMOTE (Synthetic Minority Over-sampling Technique)
- **REST API Backend**: FastAPI with model serving
- **Interactive Dashboard**: Next.js frontend for real-time predictions
- **Exploratory Analysis**: Jupyter notebooks for data exploration and model optimization


## 📊 Models

### 1. **Baseline Logistic Regression**
- Simple linear classifier for fraud detection
- Baseline performance comparison
- Fast inference time

### 2. **SMOTE + Logistic Regression**
- Handles class imbalance using SMOTE
- 10% minority class oversampling
- Improved recall for fraud detection

### 3. **Random Forest Classifier**
- 300 trees with max depth of 10
- Balanced class weights
- Better feature interactions
- Main production model

### 4. **Isolation Forest**
- Unsupervised anomaly detection
- Identifies outlier transactions
- Contamination rate based on fraud ratio

## 🔧 API Endpoints

### POST `/predict`
Predict fraud for a single transaction.

**Request:**
```json
{
  "features": [value1, value2, ..., valueN]
}
```

**Response:**
```json
{
  "prediction": 0,
  "confidence": 0.95,
  "model_used": "random_forest"
}
```

## 📓 Jupyter Notebooks

### 01_eda.ipynb
Exploratory Data Analysis
- Dataset statistics and distribution
- Missing value analysis
- Feature correlations
- Class imbalance visualization

### 02_baseline_model.ipynb
Baseline Model Training
- Simple Logistic Regression
- Initial performance metrics
- Baseline comparison

### 03_advanced_anomaly_optimized.ipynb
Advanced Models & Optimization
- SMOTE implementation
- Isolation Forest for anomaly detection
- Hyperparameter tuning
- Model comparison and selection

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




**Last Updated**: December 2025
