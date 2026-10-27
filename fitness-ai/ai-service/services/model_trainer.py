import os
import sys
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config
from services.data_processor import (
    generate_bmi_dataset,
    generate_calorie_dataset,
    generate_health_risk_dataset,
    generate_sleep_dataset
)

def train_and_save_all_models():
    model_dir = config.MODEL_PATH
    os.makedirs(model_dir, exist_ok=True)
    print(f"Training models and saving checkpoints to: {model_dir}")

    # 1. BMI Classifier
    print("Training BMI Classifier...")
    df_bmi = generate_bmi_dataset()
    X_bmi = df_bmi[["height", "weight"]]
    y_bmi = df_bmi["class"]
    X_train, X_test, y_train, y_test = train_test_split(X_bmi, y_bmi, test_size=0.2, random_state=42)
    bmi_model = RandomForestClassifier(n_estimators=100, random_state=42)
    bmi_model.fit(X_train, y_train)
    joblib.dump(bmi_model, os.path.join(model_dir, "bmi_classifier.joblib"))

    # 2. Calorie Predictor
    print("Training Calorie Predictor...")
    df_cal = generate_calorie_dataset()
    X_cal = df_cal[["age", "gender", "weight", "height", "duration", "intensity"]]
    y_cal = df_cal["calories"]
    X_train, X_test, y_train, y_test = train_test_split(X_cal, y_cal, test_size=0.2, random_state=42)
    cal_model = RandomForestRegressor(n_estimators=100, random_state=42)
    cal_model.fit(X_train, y_train)
    joblib.dump(cal_model, os.path.join(model_dir, "calorie_predictor.joblib"))

    # 3. Health Risk Predictor
    print("Training Health Risk Predictor...")
    df_risk = generate_health_risk_dataset()
    X_risk = df_risk[["age", "bmi", "activity_level", "sleep", "water"]]
    y_risk = df_risk["risk"]
    X_train, X_test, y_train, y_test = train_test_split(X_risk, y_risk, test_size=0.2, random_state=42)
    risk_model = LogisticRegression(random_state=42)
    risk_model.fit(X_train, y_train)
    joblib.dump(risk_model, os.path.join(model_dir, "health_risk_predictor.joblib"))

    # 4. Sleep Quality Predictor
    print("Training Sleep Quality Predictor...")
    df_sleep = generate_sleep_dataset()
    X_sleep = df_sleep[["duration", "stress_level", "caffeine", "screen_time"]]
    y_sleep = df_sleep["quality"]
    X_train, X_test, y_train, y_test = train_test_split(X_sleep, y_sleep, test_size=0.2, random_state=42)
    sleep_model = RandomForestClassifier(n_estimators=100, random_state=42)
    sleep_model.fit(X_train, y_train)
    joblib.dump(sleep_model, os.path.join(model_dir, "sleep_quality_predictor.joblib"))

    # 5. Massive 500MB+ Dataset Training (Out-of-Core Learning)
    data_dir = os.path.dirname(model_dir)
    massive_data_path = os.path.join(data_dir, "massive_health_dataset.csv")
    if os.path.exists(massive_data_path):
        print(f"Training on Massive 500MB+ Dataset: {massive_data_path}")
        from sklearn.linear_model import SGDClassifier
        import pandas as pd
        
        massive_model = SGDClassifier(loss='log_loss', random_state=42)
        classes = np.array([0, 1, 2])
        
        chunk_size = 500000
        for chunk in pd.read_csv(massive_data_path, chunksize=chunk_size):
            X_massive = chunk[['age', 'gender', 'height_cm', 'weight_kg', 'bmi', 'activity_level', 'daily_steps', 'sleep_duration', 'resting_heart_rate']]
            y_massive = chunk['health_status']
            massive_model.partial_fit(X_massive, y_massive, classes=classes)
            
        joblib.dump(massive_model, os.path.join(model_dir, "massive_health_classifier.joblib"))
        print("Massive dataset model trained successfully!")

    print("All models trained and checkpointed successfully!")


if __name__ == "__main__":
    import numpy as np
    train_and_save_all_models()
