import pandas as pd
import json
import re

excel_path = r'C:\Users\AMARNATH\OneDrive\Desktop\course\course files\Indian_Food_Nutrition_Processed.xlsx'
df = pd.read_excel(excel_path)

# Image mapping dictionary based on keywords
image_keywords = {
    'tea': 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?auto=format&fit=crop&w=600&q=80',
    'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    'chicken': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'paneer': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    'dal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    'rice': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80',
    'chawal': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80',
    'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'egg': 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=600&q=80',
    'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'roti': 'https://images.unsplash.com/photo-1565557613262-6bf392fa9418?auto=format&fit=crop&w=600&q=80',
    'paratha': 'https://images.unsplash.com/photo-1565557613262-6bf392fa9418?auto=format&fit=crop&w=600&q=80',
    'dosa': 'https://images.unsplash.com/photo-1627409252431-7e04f0574744?auto=format&fit=crop&w=600&q=80',
    'idli': 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=600&q=80',
    'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    'curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    'lassi': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451b06?auto=format&fit=crop&w=600&q=80',
    'water': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    'default': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80' # Generic Indian food
}

def get_image_url(dish_name):
    lower_name = str(dish_name).lower()
    for keyword, url in image_keywords.items():
        if keyword in lower_name and keyword != 'default':
            return url
    return image_keywords['default']

foods = []
for index, row in df.iterrows():
    try:
        # Handle NaN values safely
        dish_name = str(row['Dish Name']) if pd.notna(row['Dish Name']) else "Unknown Dish"
        calories = float(row['Calories (kcal)']) if pd.notna(row['Calories (kcal)']) else 0.0
        carbs = float(row['Carbohydrates (g)']) if pd.notna(row['Carbohydrates (g)']) else 0.0
        protein = float(row['Protein (g)']) if pd.notna(row['Protein (g)']) else 0.0
        fats = float(row['Fats (g)']) if pd.notna(row['Fats (g)']) else 0.0
        fiber = float(row['Fibre (g)']) if pd.notna(row['Fibre (g)']) else 0.0
        sugar = float(row['Free Sugar (g)']) if pd.notna(row['Free Sugar (g)']) else 0.0
        sodium = float(row['Sodium (mg)']) if pd.notna(row['Sodium (mg)']) else 0.0
        
        # Clean the name, sometimes there's weird characters
        dish_name = re.sub(r'[^\x00-\x7F]+', ' ', dish_name).strip()
        
        # Build the final object
        food_obj = {
            "name": dish_name,
            "category": "indian",
            "calories": round(calories, 1),
            "protein": round(protein, 1),
            "carbs": round(carbs, 1),
            "fat": round(fats, 1),
            "fiber": round(fiber, 1),
            "sugar": round(sugar, 1),
            "sodium": round(sodium, 1),
            "servingSize": "100g",
            "servingWeight": 100,
            "image": get_image_url(dish_name),
            "mealType": ["lunch", "dinner"], # Default
            "dietType": [] # Can be populated later
        }
        
        # Very basic diet detection
        lower_name = dish_name.lower()
        if "chicken" in lower_name or "mutton" in lower_name or "fish" in lower_name or "egg" in lower_name:
            food_obj["dietType"].append("non_vegetarian")
            if "chicken" not in lower_name and "mutton" not in lower_name and "fish" not in lower_name and "egg" in lower_name:
                food_obj["dietType"].append("vegetarian") # Egg-vegetarian (eggetarian)
        else:
            food_obj["dietType"].append("vegetarian")
            
        foods.append(food_obj)
    except Exception as e:
        print(f"Skipping row {index} due to error: {e}")

# Save to AI service data directory
with open(r"C:\Users\AMARNATH\OneDrive\Desktop\course\AI Fitness Tracker 1\fitness-ai\ai-service\data\indian_foods.json", "w", encoding="utf-8") as f:
    json.dump(foods, f, indent=4)

# Save to Server for database seeding
with open(r"C:\Users\AMARNATH\OneDrive\Desktop\course\AI Fitness Tracker 1\fitness-ai\server\src\data\indian_foods.json", "w", encoding="utf-8") as f:
    json.dump(foods, f, indent=4)

print(f"Successfully processed {len(foods)} foods and exported JSON!")
