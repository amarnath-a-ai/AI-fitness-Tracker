import os
import sys
import pandas as pd
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config

def generate_massive_dataset(target_size_mb: int = 500, chunk_size: int = 500000):
    """
    Procedurally generates a massive synthetic health & fitness dataset.
    Generates data in chunks until the target file size is reached.
    """
    data_dir = os.path.dirname(config.MODEL_PATH)
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, "massive_health_dataset.csv")
    
    # Remove if exists
    if os.path.exists(file_path):
        os.remove(file_path)
        
    print(f"Starting generation of ~{target_size_mb}MB synthetic dataset...")
    
    bytes_written = 0
    target_bytes = target_size_mb * 1024 * 1024
    chunks = 0
    
    # Pre-calculate probabilities for categorical variables
    genders = [0, 1] # 0: Female, 1: Male
    activity_levels = [1, 2, 3, 4, 5] # Sedentary to Very Active
    fitness_goals = [0, 1, 2] # 0: Weight Loss, 1: Maintenance, 2: Muscle Gain
    
    while bytes_written < target_bytes:
        # Generate vectorized data chunk
        age = np.random.randint(18, 80, size=chunk_size)
        gender = np.random.choice(genders, size=chunk_size)
        
        # Male height/weight dist vs Female
        height_cm = np.where(gender == 1, 
                             np.random.normal(175, 7, size=chunk_size), 
                             np.random.normal(162, 6, size=chunk_size))
        
        weight_kg = np.where(gender == 1,
                             np.random.normal(80, 12, size=chunk_size),
                             np.random.normal(65, 10, size=chunk_size))
        
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        
        activity_level = np.random.choice(activity_levels, size=chunk_size, p=[0.2, 0.3, 0.3, 0.15, 0.05])
        daily_steps = np.random.normal(activity_level * 2500, 1500, size=chunk_size).clip(500, 30000)
        
        sleep_duration = np.random.normal(7.5, 1.2, size=chunk_size).clip(3, 12)
        heart_rate = np.random.normal(75 - (activity_level * 2), 8, size=chunk_size).clip(45, 110)
        
        goal = np.random.choice(fitness_goals, size=chunk_size, p=[0.4, 0.3, 0.3])
        
        # Target Variables (Heuristics based calculation for synthetic validity)
        # Calories needed
        bmr = np.where(gender == 1,
                       88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age),
                       447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age))
        
        activity_multiplier = 1.2 + ((activity_level - 1) * 0.175)
        tdee = bmr * activity_multiplier
        
        # Adjust target calories based on goal
        target_calories = np.where(goal == 0, tdee - 500, np.where(goal == 2, tdee + 300, tdee))
        
        # Health Risk Score (0-100)
        risk_score = (
            ((bmi > 30) | (bmi < 18.5)) * 30 +
            (sleep_duration < 6) * 20 +
            (activity_level <= 2) * 20 +
            (heart_rate > 90) * 15 +
            (age > 60) * 15
        ).clip(0, 100)
        
        # Determine strict classes
        health_status = np.where(risk_score > 60, 2, np.where(risk_score > 30, 1, 0)) # 0: Good, 1: Moderate, 2: High Risk
        
        df = pd.DataFrame({
            'age': age.astype(np.int8),
            'gender': gender.astype(np.int8),
            'height_cm': height_cm.astype(np.float32),
            'weight_kg': weight_kg.astype(np.float32),
            'bmi': bmi.astype(np.float32),
            'activity_level': activity_level.astype(np.int8),
            'daily_steps': daily_steps.astype(np.int32),
            'sleep_duration': sleep_duration.astype(np.float32),
            'resting_heart_rate': heart_rate.astype(np.int8),
            'fitness_goal': goal.astype(np.int8),
            'target_calories': target_calories.astype(np.float32),
            'health_risk_score': risk_score.astype(np.int8),
            'health_status': health_status.astype(np.int8)
        })
        
        # Append to CSV
        mode = 'w' if chunks == 0 else 'a'
        header = chunks == 0
        df.to_csv(file_path, mode=mode, header=header, index=False)
        
        # Update progress
        file_stats = os.stat(file_path)
        bytes_written = file_stats.st_size
        chunks += 1
        
        mb_written = bytes_written / (1024 * 1024)
        print(f"Generated {chunks * chunk_size:,} rows. Current size: {mb_written:.2f} MB / {target_size_mb} MB")

    print(f"Successfully generated massive dataset: {file_path}")
    print(f"Total Rows: {chunks * chunk_size:,}")
    print(f"Final Size: {bytes_written / (1024 * 1024):.2f} MB")

if __name__ == "__main__":
    # Generate 500MB dataset
    generate_massive_dataset(target_size_mb=500, chunk_size=1000000)
