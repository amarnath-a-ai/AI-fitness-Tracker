import os
import joblib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import config

router = APIRouter()

class BMIPredictRequest(BaseModel):
    height: float # in cm
    weight: float # in kg

class CaloriePredictRequest(BaseModel):
    age: int
    gender: int # 0: Female, 1: Male
    weight: float # in kg
    height: float # in cm
    duration: float # in min
    intensity: int # 1: Low, 2: Moderate, 3: High

class HealthRiskPredictRequest(BaseModel):
    age: int
    bmi: float
    activity_level: int # 0: Sedentary, 1: Light, 2: Moderate, 3: Active
    sleep: float # hrs
    water: float # liters

class SleepPredictRequest(BaseModel):
    duration: float # hrs
    stress_level: int # 1-10
    caffeine: float # mg
    screen_time: float # hrs

def load_model(name: str):
    path = os.path.join(config.MODEL_PATH, f"{name}.joblib")
    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail=f"Model checkpoint '{name}' not found. Run model training.")
    return joblib.load(path)

@router.post("/predict/bmi")
def predict_bmi(req: BMIPredictRequest):
    try:
        model = load_model("bmi_classifier")
        # Feature input format: [[height, weight]]
        pred = model.predict([[req.height, req.weight]])
        classes = ["underweight", "normal", "overweight", "obese"]
        return {"bmi_class": classes[int(pred[0])]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/calories")
def predict_calories(req: CaloriePredictRequest):
    try:
        model = load_model("calorie_predictor")
        pred = model.predict([[req.age, req.gender, req.weight, req.height, req.duration, req.intensity]])
        return {"calories_burned": round(float(pred[0]), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/health-risk")
def predict_health_risk(req: HealthRiskPredictRequest):
    try:
        model = load_model("health_risk_predictor")
        pred = model.predict([[req.age, req.bmi, req.activity_level, req.sleep, req.water]])
        return {"risk_probability": round(float(model.predict_proba([[req.age, req.bmi, req.activity_level, req.sleep, req.water]])[0][1]), 2), "risk": int(pred[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/sleep")
def predict_sleep(req: SleepPredictRequest):
    try:
        model = load_model("sleep_quality_predictor")
        pred = model.predict([[req.duration, req.stress_level, req.caffeine, req.screen_time]])
        classes = ["poor", "fair", "good"]
        return {"sleep_quality": classes[int(pred[0])]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
