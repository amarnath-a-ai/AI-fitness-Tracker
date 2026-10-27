import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Initialise Gemini client (lazy — only used when key is present)
const getGeminiModel = () => {
  if (!config.geminiApiKey) return null;
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// ─── Chat endpoint ────────────────────────────────────────────────────────────
export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, history } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // ── 1. Try Google Gemini ─────────────────────────────────────────────────
    const model = getGeminiModel();
    if (model) {
      try {
        const systemInstruction = `You are a professional certified fitness and nutrition coach at Athrix.
The user's name is ${user?.firstName || 'there'}, their fitness goal is ${user?.fitnessGoal || 'general fitness'}, and their activity level is ${user?.activityLevel || 'moderate'}.
Provide clear, motivating, science-backed fitness and nutrition advice tailored to Indian users.
Format responses with bullet points and **bold** text where helpful.
Keep responses concise and actionable. Avoid generic filler sentences.`;

        // Build chat history for multi-turn conversation
        const chatHistory = (history || []).map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          systemInstruction,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        logger.info(`Gemini AI responded for user: ${user?.email}`);
        return res.status(200).json({
          success: true,
          data: { response: responseText, provider: 'gemini' },
        });
      } catch (geminiError: any) {
        logger.warn(`Gemini API error: ${geminiError.message} — using offline fallback`);
      }
    } else {
      logger.warn('GEMINI_API_KEY not set — using offline fallback');
    }

    // ── 2. Offline fallback ──────────────────────────────────────────────────
    const fallbackResponse = getOfflineResponse(message);
    return res.status(200).json({
      success: true,
      data: { response: fallbackResponse, provider: 'offline' },
    });

  } catch (error: any) {
    logger.error(`AI Chat Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to process AI response' });
  }
};

// ─── Meal plan ────────────────────────────────────────────────────────────────
export const getMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { calories, goal, dietPreference } = req.body;

    const model = getGeminiModel();
    if (model) {
      try {
        const prompt = `Create a detailed 7-day Indian meal plan for a person with:
- Daily calorie target: ${calories || user?.dailyCalorieGoal || 2000} kcal
- Fitness goal: ${goal || user?.fitnessGoal || 'maintenance'}
- Diet preference: ${dietPreference || user?.dietPreference || 'non_vegetarian'}

Include breakfast, lunch, dinner, and 2 snacks per day with approximate calories and macros.
Focus on common Indian foods. Format as a structured day-by-day plan.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({
          success: true,
          data: { mealPlan: responseText, provider: 'gemini' },
        });
      } catch (geminiError: any) {
        logger.warn(`Gemini meal plan error: ${geminiError.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        mealPlan: 'Meal plan generation requires the Gemini API key to be configured.',
        provider: 'offline',
      },
    });
  } catch (error: any) {
    logger.error(`Meal Plan Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate meal plan' });
  }
};

// ─── Workout plan ─────────────────────────────────────────────────────────────
export const getWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { level, goal, daysPerWeek } = req.body;

    const model = getGeminiModel();
    if (model) {
      try {
        const prompt = `Create a detailed ${daysPerWeek || 5}-day workout plan for:
- Fitness level: ${level || 'intermediate'}
- Goal: ${goal || user?.fitnessGoal || 'muscle_gain'}
- Days per week: ${daysPerWeek || 5}

Include exercises, sets, reps, and rest times. Use a structured split (e.g., PPL or Upper/Lower).
Be specific with exercise names and coaching cues.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({
          success: true,
          data: { workoutPlan: responseText, provider: 'gemini' },
        });
      } catch (geminiError: any) {
        logger.warn(`Gemini workout plan error: ${geminiError.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        workoutPlan: 'Workout plan generation requires the Gemini API key to be configured.',
        provider: 'offline',
      },
    });
  } catch (error: any) {
    logger.error(`Workout Plan Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate workout plan' });
  }
};

// ─── Offline fallback responses ───────────────────────────────────────────────
function getOfflineResponse(message: string): string {
  const lower = message.toLowerCase();

  if (['split', 'plan', 'routine', 'program'].some(k => lower.includes(k))) {
    return "Here are recommended training splits:\n\n**Push-Pull-Legs (PPL)** - 3-6 days/week\n• Push: Chest, Shoulders, Triceps\n• Pull: Back, Biceps\n• Legs: Quads, Hamstrings, Calves\n\n**Upper-Lower** - 4 days/week\n• Upper: 3 sets per movement, 8-12 reps\n• Lower: 4 sets per movement, 10-15 reps\n\n**Full Body** - 3 days/week\n• Compound exercises per session, 48h rest between.";
  }

  if (['protein', 'muscle'].some(k => lower.includes(k))) {
    return "For muscle gain, aim for **1.6–2.2g of protein per kg** of body weight daily.\n\nGreat Indian sources:\n• Chicken breast — 31g protein/100g\n• Paneer — 18g protein/100g\n• Eggs — 13g protein per 2 eggs\n• Dal (lentils) — 9g protein per bowl\n• Greek yogurt (curd) — 10g protein per 100g";
  }

  if (['lose weight', 'fat loss', 'weight loss', 'belly fat'].some(k => lower.includes(k))) {
    return "**Science-backed fat loss strategy:**\n\n• Maintain a caloric deficit of 300–500 kcal/day\n• Prioritize protein (1.6–2g per kg) to preserve muscle\n• Combine resistance training (3-4x/week) with moderate cardio\n• Sleep 7–9 hours for optimal hormone regulation\n• Drink 3+ liters of water daily\n\nConsistency over intensity is key!";
  }

  if (['supplement'].some(k => lower.includes(k))) {
    return "**Evidence-based supplements:**\n\n• **Whey Protein** — 1 scoop post-workout for muscle recovery\n• **Creatine Monohydrate** — 5g/day for strength and power\n• **Multivitamins** — fill dietary gaps\n• **Fish Oil (Omega-3)** — 1000mg/day for joint health\n• **Vitamin D3** — 2000 IU/day if limited sun exposure\n\nConsult your doctor before starting any supplements.";
  }

  if (['indian', 'dal', 'paneer', 'roti', 'rice'].some(k => lower.includes(k))) {
    return "**Indian Macro Guide:**\n\n• Paneer Tikka (100g): 260 kcal | 18g P | 8g C | 18g F\n• Dal Tadka (1 bowl): 120 kcal | 8g P | 16g C | 3g F\n• Chicken Tikka (100g): 165 kcal | 25g P | 5g C | 6g F\n• Boiled Eggs (2): 155 kcal | 13g P | 0g C | 11g F\n• Brown Rice (1 cup): 215 kcal | 5g P | 45g C | 2g F\n\nTip: Prefer multigrain rotis over white bread for better fiber and glycemic control.";
  }

  return "I'm your **Athrix AI fitness coach**! I can help with:\n\n• Custom workout plans & training splits\n• Indian nutrition & macro tracking\n• Exercise form & technique\n• Supplement recommendations\n• Weight loss & muscle gain strategies\n\nTry asking something specific like *\"Give me a chest workout\"* or *\"What should I eat for muscle gain?\"*";
}
