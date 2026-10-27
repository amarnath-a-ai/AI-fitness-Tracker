import requests
import json
import os
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from config import config

router = APIRouter()

# Load Indian Foods Dataset
dataset_path = Path(__file__).parent.parent / 'data' / 'indian_foods.json'
indian_foods = []
if dataset_path.exists():
    with open(dataset_path, 'r', encoding='utf-8') as f:
        indian_foods = json.load(f)

def find_food_in_dataset(query: str):
    if not indian_foods: return []
    query_lower = query.lower()
    
    # Filter out common stop words from query for better matching
    stopwords = ['calories', 'in', 'macros', 'for', 'how', 'much', 'protein', 'is', 'a', 'of']
    words = [w for w in query_lower.split() if w not in stopwords and len(w) > 2]
    
    if not words: return []
    
    matches = []
    for food in indian_foods:
        food_name_lower = food['name'].lower()
        # Check if any significant word matches exactly or is a substring
        if any(w in food_name_lower for w in words):
            matches.append(food)
            
    # Sort matches by length (shorter names that match are usually more direct hits)
    matches.sort(key=lambda x: len(x['name']))
    return matches[:3]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    user: Dict[str, Any]

def get_offline_coach_response(message: str) -> str:
    lower_msg = message.lower()
    
    # Check dataset first
    matches = find_food_in_dataset(message)
    if matches and any(word in lower_msg for word in ['calories', 'protein', 'carbs', 'fat', 'macros', 'nutrition', 'in', 'for']):
        response = "Here is the nutritional information from our Indian food database:\n\n"
        for m in matches:
            response += f"* **{m['name']}** ({m['servingSize']}): {m['calories']} kcal | {m['protein']}g Protein | {m['carbs']}g Carbs | {m['fat']}g Fat\n"
        response += "\nLet me know if you need to track this meal!"
        return response
    
    # Workout splits / plans trigger
    if any(k in lower_msg for k in ["split", "plan", "routine", "program", "schedule"]):
        return (
            "Here are the highly accurate training splits recommended by Athrix:\n\n"
            "Push-Pull-Legs (PPL) - 3 to 6 Days/Week (Intermediate/Advanced)\n"
            "* Push Day: Focus on Chest, Shoulders, and Triceps (Bench Press 4x8, Overhead Press 3x10, Tricep Dips 3x12).\n"
            "* Pull Day: Focus on Back and Biceps (Deadlifts 4x5, Barbell Rows 4x10, Pull-ups 3xMax, Bicep Curls 3x12).\n"
            "* Legs Day: Focus on Quadriceps, Hamstrings, and Calves (Squats 4x10, Roman Deadlifts 3x12, Leg Press 3x15).\n\n"
            "Upper-Lower Split - 4 Days/Week (Beginner/Intermediate)\n"
            "* Upper Body: Exercises for chest, back, shoulders, arms (3 sets per movement, 8-12 reps).\n"
            "* Lower Body: Focus on leg compounds, glute accessory, calves, and core (4 sets per movement, 10-15 reps).\n\n"
            "Full Body Routine - 3 Days/Week (Beginners/Time-Constrained)\n"
            "* Perform compound exercises (squat, bench press, rows, overhead press) in a single session. Rest 48 hours between workouts."
        )

    # Exercise Form & Details trigger
    if any(k in lower_msg for k in ["form", "posture", "technique", "how to", "instruction"]):
        return (
            "Athrix Form and Safety Guidelines:\n\n"
            "Barbell Squat Form:\n"
            "1. Setup the bar on your upper traps. Keep chest up and feet slightly wider than shoulder-width.\n"
            "2. Initiate the descent by pushing hips backward (like sitting in a chair), bending knees.\n"
            "3. Go down until thighs are parallel to the floor. Keep knees aligned with toes.\n"
            "4. Drive back up through the heels, keeping the spine straight. Squeeze glutes at lock.\n\n"
            "Deadlift Form:\n"
            "1. Stand with feet hip-width, barbell directly over your mid-foot.\n"
            "2. Hinge forward, grip bar outside shins, flat back, chest up, shoulder blades retracted.\n"
            "3. Take a deep breath, brace your core, and drive through the floor to lift the bar close to shins.\n"
            "4. Push hips forward to lock out. Never round your lower back under weight load."
        )

    # Generic Indian food trigger fallback
    if any(k in lower_msg for k in ["indian food", "indian diet", "diet"]):
        return (
            "Here is a custom Athrix Indian Macro & Diet guideline:\n\n"
            "High-Protein Vegetarian Sources:\n"
            "* Paneer Tikka (100g): 260 kcal | 18g Protein | 8g Carbs | 18g Fat. Excellent for keto or low-carb diets.\n"
            "* Dal Tadka (1 bowl): 120 kcal | 8g Protein | 16g Carbs | 3g Fat. Combine with brown rice or roti for complete proteins.\n"
            "* Sattu Drink (2 tbsp in water): 150 kcal | 9g Protein. A highly effective natural post-workout option.\n\n"
            "High-Protein Non-Vegetarian Sources:\n"
            "* Chicken Tikka (100g): 165 kcal | 25g Protein | 5g Carbs | 6g Fat. Super clean macro balance.\n"
            "* Boiled Eggs (2 pieces): 155 kcal | 13g Protein | 11g Fat. Great breakfast starter.\n\n"
            "Tip: Prefer multigrain rotis or brown/basmati rice over white bread or parathas to optimize fiber and glycemic index."
        )

    # Protein / muscle trigger
    if "protein" in lower_msg or "muscle" in lower_msg:
        return "For muscle gain, aim for 1.6 to 2.2 grams of protein per kg of body weight daily. Try chicken breast, egg whites, paneer, tofu, lentils, and whey protein."
    
    # Weight loss trigger
    if any(k in lower_msg for k in ["lose weight", "fat loss", "weight loss"]):
        return "To lose weight safely, maintain a calorie deficit of 300-500 kcal daily. Combine resistance training with moderate cardio, stay hydrated, and focus on high-fiber foods."
    
    # Water trigger
    if "water" in lower_msg or "hydrate" in lower_msg:
        return "Stay hydrated by consuming at least 2.5 to 3.5 liters of water daily. Increase this on workout days to replace sweat loss."

    # Supplements trigger
    if "supplement" in lower_msg:
        return "Standard recommended supplements are Whey Protein, Creatine Monohydrate (5g/day for power), Multivitamins, and Fish Oil. Consult a doctor first."
        
    return (
        "Welcome to Athrix! I'm your certified AI fitness & nutrition coach. "
        "Ask me about custom workout routines, training splits (PPL/Full Body), exercise forms, "
        "or exact nutritional macros for over 1000 authentic Indian foods! What are your fitness goals today?"
    )


def call_gemini_api(message: str, history: List[ChatMessage], context: str, user: Dict[str, Any]) -> str:
    """Call Google Gemini API using the REST endpoint (supports AQ. format keys)."""
    api_key = config.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    system_prompt = (
        f"You are a professional certified fitness and nutrition coach at Athrix. "
        f"The user's name is {user.get('firstName', 'there')}, their fitness goal is "
        f"{user.get('fitnessGoal', 'general fitness')}, and their activity level is "
        f"{user.get('activityLevel', 'moderate')}. "
        f"Provide clear, motivating, science-backed fitness and nutrition advice. "
        f"Format responses with bullet points and bold text where helpful. "
        f"Keep responses concise and actionable.{context}"
    )

    # Build conversation contents for Gemini
    contents = []

    # Add chat history (Gemini uses 'user' and 'model' roles)
    for hist in history:
        gemini_role = "model" if hist.role == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": hist.content}]})

    # Add current user message
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": 600,
            "temperature": 0.7,
        }
    }

    response = requests.post(url, json=payload, timeout=15)
    response.raise_for_status()
    data = response.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


@router.post("/chatbot")
def chat_with_coach(req: ChatRequest):
    # Build RAG context from Indian food dataset
    context = ""
    matches = find_food_in_dataset(req.message)
    if matches:
        context = " Use the following real database records to answer the user's food query accurately: "
        for m in matches:
            context += f"{m['name']}: {m['calories']} kcal, {m['protein']}g protein, {m['carbs']}g carbs, {m['fat']}g fat per {m['servingSize']}. "

    # --- Primary: Google Gemini API ---
    if config.GEMINI_API_KEY:
        try:
            response_text = call_gemini_api(req.message, req.history, context, req.user)
            return {"response": response_text}
        except Exception as e:
            print(f"[Gemini API Error] {e} — falling back to OpenAI or offline.")

    # --- Secondary: OpenAI API (if configured) ---
    if config.OPENAI_API_KEY and config.OPENAI_API_KEY != "mock":
        try:
            headers = {
                "Authorization": f"Bearer {config.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            system_prompt = f"You are a professional certified fitness and nutrition coach at Athrix. Provide clear, motivating, and science-backed advice. Avoid using emojis.{context}"
            messages = [{"role": "system", "content": system_prompt}]
            for hist in req.history:
                messages.append({"role": hist.role, "content": hist.content})
            messages.append({"role": "user", "content": req.message})
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=10)
            if res.status_code == 200:
                return {"response": res.json()["choices"][0]["message"]["content"]}
        except Exception as e:
            print(f"[OpenAI API Error] {e} — falling back to offline.")

    # --- Fallback: Offline rule-based responses ---
    return {"response": get_offline_coach_response(req.message)}
