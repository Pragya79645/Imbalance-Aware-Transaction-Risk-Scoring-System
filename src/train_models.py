"""
Train and save all models for the fraud detection system
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest
from imblearn.over_sampling import SMOTE

# Load dataset
print("Loading dataset...")
data = pd.read_csv('../data/raw/fraud_dataset.csv')

X = data.drop('Class', axis=1)
y = data['Class']

# Scale features
print("Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split (stratified)
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, stratify=y, random_state=42
)

# 1. Baseline Logistic Regression (no SMOTE)
print("\n1️⃣ Training Baseline Logistic Regression...")
baseline_lr = LogisticRegression(max_iter=1000, random_state=42)
baseline_lr.fit(X_train, y_train)
joblib.dump(baseline_lr, 'baseline_lr_model.pkl')
print(f"   Baseline LR Accuracy: {baseline_lr.score(X_test, y_test):.4f}")

# 2. SMOTE + Logistic Regression
print("\n2️⃣ Training SMOTE + Logistic Regression...")
smote = SMOTE(sampling_strategy=0.1, random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)

smote_lr = LogisticRegression(max_iter=1000, random_state=42)
smote_lr.fit(X_train_smote, y_train_smote)
joblib.dump(smote_lr, 'smote_lr_model.pkl')
print(f"   SMOTE LR Accuracy: {smote_lr.score(X_test, y_test):.4f}")

# 3. Isolation Forest
print("\n3️⃣ Training Isolation Forest...")
X_train_normal = X_train[y_train == 0]
fraud_ratio = y_train.value_counts()[1] / len(y_train)

iso_forest = IsolationForest(contamination=fraud_ratio, random_state=42)
iso_forest.fit(X_train_normal)
joblib.dump(iso_forest, 'iso_forest_model.pkl')

# Evaluate
y_pred_iso = iso_forest.predict(X_test)
y_pred_iso_binary = np.where(y_pred_iso == -1, 1, 0)
iso_accuracy = np.mean(y_pred_iso_binary == y_test)
print(f"   Isolation Forest Accuracy: {iso_accuracy:.4f}")

print("\n✅ All models trained and saved successfully!")
print("\nSaved files:")
print("  - baseline_lr_model.pkl")
print("  - smote_lr_model.pkl")
print("  - iso_forest_model.pkl")
print("  - scaler.pkl (already exists)")
