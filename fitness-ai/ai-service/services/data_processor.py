import numpy as np
import pandas as pd

def generate_bmi_dataset(size=1000):
    np.random.seed(42)
    height = np.random.uniform(1.4, 2.0, size) # in meters
    weight = np.random.uniform(40, 120, size)  # in kg
    bmi = weight / (height ** 2)
    
    # Classify BMI
    # Underweight < 18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese >= 30
    classes = []
    for val in bmi:
        if val < 18.5:
            classes.append(0) # Underweight
        elif val < 25:
            classes.append(1) # Normal
        elif val < 30:
            classes.append(2) # Overweight
        else:
            classes.append(3) # Obese
            
    df = pd.DataFrame({
        "height": height * 100, # to cm
        "weight": weight,
        "bmi": bmi,
        "class": classes
    })
    return df

def generate_calorie_dataset(size=1000):
    np.random.seed(42)
    age = np.random.randint(18, 70, size)
    gender = np.random.choice([0, 1], size) # 0: Female, 1: Male
    weight = np.random.uniform(50, 100, size)
    height = np.random.uniform(150, 190, size)
    duration = np.random.uniform(10, 120, size) # workout duration in minutes
    intensity = np.random.choice([1, 2, 3], size) # 1: Low, 2: Moderate, 3: High
    
    # Simple formula for calories burned estimation
    # MET values: Low: 3, Moderate: 6, High: 9
    met = np.where(intensity == 1, 3, np.where(intensity == 2, 6, 9))
    calories = (met * 3.5 * weight / 200) * duration
    
    df = pd.DataFrame({
        "age": age,
        "gender": gender,
        "weight": weight,
        "height": height,
        "duration": duration,
        "intensity": intensity,
        "calories": calories
    })
    return df

def generate_health_risk_dataset(size=1000):
    np.random.seed(42)
    age = np.random.randint(18, 80, size)
    bmi = np.random.uniform(15, 40, size)
    activity_level = np.random.choice([0, 1, 2, 3], size) # Sedentary, Light, Moderate, Active
    sleep = np.random.uniform(4, 10, size)
    water = np.random.uniform(1, 6, size) # liters
    
    # Health risk calculation based on factors
    risk_score = (age * 0.1) + (bmi * 0.3) - (activity_level * 0.5) - (sleep * 0.2) - (water * 0.2)
    risk = np.where(risk_score > 8, 1, 0) # 1: Risk, 0: Healthy
    
    df = pd.DataFrame({
        "age": age,
        "bmi": bmi,
        "activity_level": activity_level,
        "sleep": sleep,
        "water": water,
        "risk": risk
    })
    return df

def generate_sleep_dataset(size=1000):
    np.random.seed(42)
    duration = np.random.uniform(4, 10, size)
    stress_level = np.random.randint(1, 10, size)
    caffeine = np.random.uniform(0, 500, size) # mg
    screen_time = np.random.uniform(0, 8, size) # hours before sleep
    
    quality_score = (duration * 10) - (stress_level * 3) - (caffeine * 0.05) - (screen_time * 2)
    quality = np.where(quality_score > 60, 2, np.where(quality_score > 40, 1, 0)) # 2: Good, 1: Fair, 0: Poor
    
    df = pd.DataFrame({
        "duration": duration,
        "stress_level": stress_level,
        "caffeine": caffeine,
        "screen_time": screen_time,
        "quality": quality
    })
    return df
