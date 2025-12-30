import joblib
from sklearn.ensemble import RandomForestClassifier

def train_random_forest(X, y):
    rf = RandomForestClassifier(n_estimators=300, max_depth=10, class_weight='balanced', random_state=42)
    rf.fit(X, y)
    return rf

def save_model(model, path):
    joblib.dump(model, path)

def load_model(path):
    return joblib.load(path)
