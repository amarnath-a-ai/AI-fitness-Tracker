from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

router = APIRouter()

class UserMealProfile(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    goal: str
    dietPreference: str
    allergies: List[str]
    medicalConditions: List[str]
    dailyCalorieGoal: Optional[float] = 2000

class UserWorkoutProfile(BaseModel):
    age: int
    gender: str
    weight: float
    goal: str
    activityLevel: str

# Static lists matching our database seeds for content filtering recommendation
FOOD_ITEMS = [
    {"name": "Chicken Tikka", "category": "indian", "calories": 165, "protein": 25, "carbs": 5, "fat": 6, "diet": "non_vegetarian"},
    {"name": "Dal Tadka", "category": "indian", "calories": 120, "protein": 8, "carbs": 16, "fat": 3, "diet": "vegetarian"},
    {"name": "Paneer Tikka", "category": "indian", "calories": 260, "protein": 18, "carbs": 8, "fat": 18, "diet": "vegetarian"},
    {"name": "Roti / Chapati", "category": "grains", "calories": 104, "protein": 3, "carbs": 21, "fat": 1, "diet": "vegetarian"},
    {"name": "Steamed Rice", "category": "grains", "calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "diet": "vegetarian"},
    {"name": "Masala Dosa", "category": "indian", "calories": 168, "protein": 4, "carbs": 25, "fat": 6, "diet": "vegetarian"},
    {"name": "Greek Yogurt", "category": "dairy", "calories": 100, "protein": 17, "carbs": 6, "fat": 0.7, "diet": "vegetarian"},
    {"name": "Whey Protein Shake", "category": "supplements", "calories": 120, "protein": 24, "carbs": 3, "fat": 1.5, "diet": "vegetarian"},
    {"name": "Boiled Eggs", "category": "protein", "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "diet": "non_vegetarian"},
    {"name": "Avocado Toast", "category": "breakfast", "calories": 240, "protein": 6, "carbs": 22, "fat": 15, "diet": "vegetarian"}
]

WORKOUT_ITEMS = [
    {"name": "Bench Press", "muscle": "Chest", "type": "strength", "difficulty": "intermediate"},
    {"name": "Push-ups", "muscle": "Chest", "type": "strength", "difficulty": "beginner"},
    {"name": "Pull-ups", "muscle": "Back", "type": "strength", "difficulty": "intermediate"},
    {"name": "Deadlifts", "muscle": "Back", "type": "strength", "difficulty": "advanced"},
    {"name": "Squats", "muscle": "Legs", "type": "strength", "difficulty": "intermediate"},
    {"name": "Running", "muscle": "Legs", "type": "cardio", "difficulty": "beginner"},
    {"name": "Plank", "muscle": "Core", "type": "flexibility", "difficulty": "beginner"},
    {"name": "Burpees", "muscle": "Full Body", "type": "hiit", "difficulty": "intermediate"}
]

@router.post("/recommend/meal")
def recommend_meals(profile: UserMealProfile):
    # Filter based on diet preference
    filtered_foods = [
        f for f in FOOD_ITEMS 
        if profile.dietPreference == "non_vegetarian" or f["diet"] == "vegetarian"
    ]
    
    # Calculate a simplified similarity: protein to calorie ratio vs goal
    # If goal is muscle_gain, rank by higher protein ratio. If weight_loss, rank by lower calorie density.
    scores = []
    for food in filtered_foods:
        score = 0
        if profile.goal == "muscle_gain":
            score = food["protein"] / (food["calories"] + 1)
        elif profile.goal == "weight_loss":
            score = 1.0 / (food["calories"] + 1)
        else:
            score = food["protein"] * 0.5 + food["carbs"] * 0.5
        scores.append(score)
        
    sorted_indices = np.argsort(scores)[::-1]
    recommendations = [filtered_foods[int(idx)] for idx in sorted_indices[:4]]
    
    return {
        "dailyCalories": profile.dailyCalorieGoal,
        "recommendations": recommendations,
        "macros": {
            "protein": "30%" if profile.goal == "muscle_gain" else "20%",
            "carbs": "40%" if profile.goal == "weight_loss" else "50%",
            "fat": "30%"
        }
    }

@router.post("/recommend/workout")
def recommend_workouts(profile: UserWorkoutProfile):
    # Simple Content Filtering based on user goal
    # muscle_gain/strength -> strength exercises, weight_loss -> cardio/hiit exercises
    recommended = []
    for w in WORKOUT_ITEMS:
        if profile.goal in ["muscle_gain", "strength"] and w["type"] == "strength":
            recommended.append(w)
        elif profile.goal == "weight_loss" and w["type"] in ["cardio", "hiit"]:
            recommended.append(w)
            
    if not recommended:
        recommended = WORKOUT_ITEMS[:4]
        
    return {
        "programName": f"Personalized {profile.goal.capitalize()} Routine",
        "duration": "45-60 min",
        "frequency": "4-5 days/week",
        "exercises": recommended
    }
