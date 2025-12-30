import pandas as pd
from sklearn.preprocessing import StandardScaler

def preprocess_input(df, scaler=None):
    if scaler is None:
        scaler = StandardScaler()
        df_scaled = scaler.fit_transform(df)
    else:
        df_scaled = scaler.transform(df)
    return df_scaled, scaler
