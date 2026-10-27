import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MealLog, WorkoutLog, WaterLog, SleepLog, WeightLog } from '../models/index';
import { logger } from '../utils/logger';
import axios from 'axios';
import { config } from '../config/env';

// Get dashboard data
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = { $gte: startOfDay, $lte: endOfDay };

    const [
      todayMeals,
      todayWorkouts,
      todayWater,
      todaySleep,
      latestWeight,
      weeklyWorkouts,
    ] = await Promise.all([
      // Today's nutrition
      MealLog.aggregate([
        { $match: { user: userId, date: dateFilter } },
        {
          $group: {
            _id: null,
            calories: { $sum: '$calories' },
            protein: { $sum: '$protein' },
            carbs: { $sum: '$carbs' },
            fat: { $sum: '$fat' },
          },
        },
      ]),
      // Today's workouts
      WorkoutLog.aggregate([
        { $match: { user: userId, date: dateFilter } },
        {
          $group: {
            _id: null,
            duration: { $sum: '$totalDuration' },
            caloriesBurned: { $sum: '$totalCaloriesBurned' },
            count: { $sum: 1 },
          },
        },
      ]),
      // Today's water
      WaterLog.aggregate([
        { $match: { user: userId, date: dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Latest sleep
      SleepLog.findOne({ user: userId }).sort({ date: -1 }),
      // Latest weight
      WeightLog.findOne({ user: userId }).sort({ date: -1 }),
      // Weekly workouts (last 7 days)
      WorkoutLog.aggregate([
        {
          $match: {
            user: userId,
            date: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            duration: { $sum: '$totalDuration' },
            calories: { $sum: '$totalCaloriesBurned' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const nutrition = todayMeals[0] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const workout = todayWorkouts[0] || { duration: 0, caloriesBurned: 0, count: 0 };
    const heightM = (req.user.height || 170) / 100;
    const currentWeight = latestWeight?.weight || req.user.weight || 70;
    const bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;

    // Calculate health score (0-100)
    const calorieScore = Math.min(nutrition.calories / (req.user.dailyCalorieGoal || 2000), 1) * 25;
    const waterScore = Math.min((todayWater[0]?.total || 0) / (req.user.dailyWaterGoal || 8), 1) * 25;
    const workoutScore = workout.count > 0 ? 25 : 0;
    const sleepScore = todaySleep
      ? Math.min(todaySleep.duration / (req.user.dailySleepGoal || 8), 1) * 25
      : 0;
    const healthScore = Math.round(calorieScore + waterScore + workoutScore + sleepScore);

    res.status(200).json({
      success: true,
      data: {
        nutrition: {
          calories: nutrition.calories,
          protein: Math.round(nutrition.protein * 10) / 10,
          carbs: Math.round(nutrition.carbs * 10) / 10,
          fat: Math.round(nutrition.fat * 10) / 10,
          goal: req.user.dailyCalorieGoal || 2000,
          remaining: (req.user.dailyCalorieGoal || 2000) - nutrition.calories,
        },
        workout: {
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          count: workout.count,
        },
        water: {
          total: todayWater[0]?.total || 0,
          goal: req.user.dailyWaterGoal || 8,
        },
        sleep: todaySleep
          ? {
              duration: todaySleep.duration,
              quality: todaySleep.quality,
              goal: req.user.dailySleepGoal || 8,
            }
          : null,
        weight: {
          current: currentWeight,
          target: req.user.targetWeight || 65,
          bmi,
          bodyFat: latestWeight?.bodyFat || 0,
        },
        streak: req.user.streak || 0,
        healthScore,
        weeklyWorkouts,
      },
    });
  } catch (error: any) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
};

// Get progress data
export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const userId = req.user._id;

    const [caloriesData, weightData, workoutData, waterData, sleepData] = await Promise.all([
      MealLog.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            calories: { $sum: '$calories' },
            protein: { $sum: '$protein' },
            carbs: { $sum: '$carbs' },
            fat: { $sum: '$fat' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      WeightLog.find({ user: userId, date: { $gte: startDate } })
        .sort({ date: 1 })
        .select('weight bmi bodyFat date'),
      WorkoutLog.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            duration: { $sum: '$totalDuration' },
            calories: { $sum: '$totalCaloriesBurned' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      WaterLog.aggregate([
        { $match: { user: userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      SleepLog.find({ user: userId, date: { $gte: startDate } })
        .sort({ date: 1 })
        .select('duration quality date'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        calories: caloriesData,
        weight: weightData,
        workout: workoutData,
        water: waterData,
        sleep: sleepData,
      },
    });
  } catch (error: any) {
    logger.error('Get progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress data' });
  }
};

// AI proxy endpoints
export const aiMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const response = await axios.post(`${config.aiServiceUrl}/api/recommend/meal`, {
      ...req.body,
      user: {
        age: req.user.dateOfBirth
          ? Math.floor((Date.now() - new Date(req.user.dateOfBirth).getTime()) / 31557600000)
          : 25,
        gender: req.user.gender,
        height: req.user.height,
        weight: req.user.weight,
        goal: req.user.fitnessGoal,
        dietPreference: req.user.dietPreference,
        allergies: req.user.allergies,
        medicalConditions: req.user.medicalConditions,
        dailyCalorieGoal: req.user.dailyCalorieGoal,
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    logger.error('AI meal plan error:', error.message);
    // Return mock data if AI service is down
    res.status(200).json({
      success: true,
      data: generateMockMealPlan(req.user),
      mock: true,
    });
  }
};

export const aiWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const response = await axios.post(`${config.aiServiceUrl}/api/recommend/workout`, {
      ...req.body,
      user: {
        age: req.user.dateOfBirth
          ? Math.floor((Date.now() - new Date(req.user.dateOfBirth).getTime()) / 31557600000)
          : 25,
        gender: req.user.gender,
        weight: req.user.weight,
        goal: req.user.fitnessGoal,
        activityLevel: req.user.activityLevel,
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    logger.error('AI workout plan error:', error.message);
    res.status(200).json({
      success: true,
      data: generateMockWorkoutPlan(req.user),
      mock: true,
    });
  }
};

export const aiChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const response = await axios.post(`${config.aiServiceUrl}/api/chatbot`, {
      message: req.body.message,
      history: req.body.history || [],
      user: {
        name: req.user.firstName,
        goal: req.user.fitnessGoal,
        weight: req.user.weight,
        height: req.user.height,
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    logger.error('AI chat error:', error.message);
    res.status(200).json({
      success: true,
      data: {
        response: generateMockChatResponse(req.body.message),
      },
      mock: true,
    });
  }
};

export const aiPredict = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const response = await axios.post(`${config.aiServiceUrl}/api/predict/${req.params.model}`, {
      ...req.body,
    });
    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    logger.error('AI predict error:', error.message);
    res.status(200).json({
      success: true,
      data: { prediction: 'AI service unavailable', mock: true },
    });
  }
};

// Mock data generators for when AI service is offline
function generateMockMealPlan(user: any) {
  const goal = user.fitnessGoal || 'maintenance';
  const calories = user.dailyCalorieGoal || 2000;
  const isVeg = user.dietPreference === 'vegetarian' || user.dietPreference === 'vegan';

  return {
    dailyCalories: calories,
    meals: {
      breakfast: {
        name: isVeg ? 'Oats with Banana & Almonds' : 'Egg White Omelette with Toast',
        calories: Math.round(calories * 0.25),
        protein: goal === 'muscle_gain' ? 30 : 20,
        carbs: 45,
        fat: 12,
        items: isVeg
          ? ['1 cup oats', '1 banana', '10 almonds', '1 cup milk']
          : ['4 egg whites', '2 whole wheat toast', '1 cup orange juice'],
      },
      lunch: {
        name: isVeg ? 'Dal Rice with Mixed Vegetables' : 'Grilled Chicken with Brown Rice',
        calories: Math.round(calories * 0.35),
        protein: goal === 'muscle_gain' ? 40 : 30,
        carbs: 60,
        fat: 15,
        items: isVeg
          ? ['1 cup dal', '1 cup brown rice', '1 cup mixed vegetables', '1 roti']
          : ['150g grilled chicken', '1 cup brown rice', '1 cup salad'],
      },
      dinner: {
        name: isVeg ? 'Paneer Tikka with Roti' : 'Fish Curry with Chapati',
        calories: Math.round(calories * 0.30),
        protein: 25,
        carbs: 40,
        fat: 15,
        items: isVeg
          ? ['100g paneer', '2 roti', '1 cup raita', 'green chutney']
          : ['150g fish', '2 chapati', '1 cup vegetables'],
      },
      snacks: {
        name: 'Protein Shake & Mixed Nuts',
        calories: Math.round(calories * 0.10),
        protein: 15,
        carbs: 10,
        fat: 8,
        items: ['1 scoop protein powder', '1 cup milk', '15g mixed nuts'],
      },
    },
    macros: {
      protein: goal === 'muscle_gain' ? '30%' : '25%',
      carbs: goal === 'weight_loss' ? '35%' : '45%',
      fat: goal === 'weight_loss' ? '35%' : '30%',
    },
    tips: [
      'Drink at least 8 glasses of water throughout the day',
      'Eat slowly and mindfully',
      'Include a variety of colorful vegetables',
      'Avoid processed foods and sugary drinks',
    ],
  };
}

function generateMockWorkoutPlan(user: any) {
  const goal = user.fitnessGoal || 'maintenance';

  const plans: Record<string, any> = {
    weight_loss: {
      name: 'Fat Burning Program',
      duration: '45-60 min',
      frequency: '5 days/week',
      split: [
        { day: 'Monday', focus: 'HIIT Cardio + Core', exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Plank', 'Bicycle Crunches'] },
        { day: 'Tuesday', focus: 'Upper Body', exercises: ['Push-ups', 'Dumbbell Rows', 'Shoulder Press', 'Tricep Dips', 'Bicep Curls'] },
        { day: 'Wednesday', focus: 'Cardio + Yoga', exercises: ['Running 30min', 'Sun Salutation', 'Warrior Poses', 'Cool Down Stretches'] },
        { day: 'Thursday', focus: 'Lower Body', exercises: ['Squats', 'Lunges', 'Deadlifts', 'Leg Press', 'Calf Raises'] },
        { day: 'Friday', focus: 'Full Body HIIT', exercises: ['Kettlebell Swings', 'Box Jumps', 'Renegade Rows', 'Thrusters', 'Plank Jacks'] },
        { day: 'Saturday', focus: 'Active Recovery', exercises: ['Light Walking', 'Stretching', 'Foam Rolling'] },
        { day: 'Sunday', focus: 'Rest', exercises: ['Rest & Recovery'] },
      ],
    },
    muscle_gain: {
      name: 'Muscle Building Program',
      duration: '60-75 min',
      frequency: '5 days/week',
      split: [
        { day: 'Monday', focus: 'Chest & Triceps', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flies', 'Skull Crushers', 'Tricep Pushdowns'] },
        { day: 'Tuesday', focus: 'Back & Biceps', exercises: ['Deadlifts', 'Pull-ups', 'Barbell Rows', 'Barbell Curls', 'Hammer Curls'] },
        { day: 'Wednesday', focus: 'Shoulders & Core', exercises: ['Military Press', 'Lateral Raises', 'Face Pulls', 'Hanging Leg Raises', 'Russian Twists'] },
        { day: 'Thursday', focus: 'Legs', exercises: ['Squats', 'Leg Press', 'Romanian Deadlifts', 'Leg Curls', 'Calf Raises'] },
        { day: 'Friday', focus: 'Upper Body Power', exercises: ['Weighted Pull-ups', 'Dips', 'Landmine Press', 'Farmers Walk', 'Cable Rows'] },
        { day: 'Saturday', focus: 'Active Recovery', exercises: ['Light Cardio', 'Stretching'] },
        { day: 'Sunday', focus: 'Rest', exercises: ['Rest & Recovery'] },
      ],
    },
    maintenance: {
      name: 'Balanced Fitness Program',
      duration: '45 min',
      frequency: '4 days/week',
      split: [
        { day: 'Monday', focus: 'Upper Body', exercises: ['Push-ups', 'Dumbbell Rows', 'Shoulder Press', 'Plank'] },
        { day: 'Tuesday', focus: 'Cardio', exercises: ['Running 30min', 'Jump Rope', 'Cycling'] },
        { day: 'Wednesday', focus: 'Rest', exercises: ['Rest & Recovery'] },
        { day: 'Thursday', focus: 'Lower Body', exercises: ['Squats', 'Lunges', 'Deadlifts', 'Core Work'] },
        { day: 'Friday', focus: 'Full Body', exercises: ['Circuit Training', 'Compound Movements'] },
        { day: 'Saturday', focus: 'Yoga / Flexibility', exercises: ['Yoga Flow', 'Stretching'] },
        { day: 'Sunday', focus: 'Rest', exercises: ['Rest & Recovery'] },
      ],
    },
  };

  return plans[goal] || plans.maintenance;
}

function generateMockChatResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('split') || lowerMsg.includes('plan') || lowerMsg.includes('routine')) {
    return "Here are the training splits recommended by Athrix:\n\n" +
           "1. Push-Pull-Legs (PPL) - 3 to 6 Days/Week (Intermediate/Advanced)\n" +
           "- Push Day: Focus on Chest, Shoulders, and Triceps (Bench Press 4x8, Overhead Press 3x10, Tricep Dips 3x12).\n" +
           "- Pull Day: Focus on Back and Biceps (Deadlifts 4x5, Barbell Rows 4x10, Pull-ups 3xMax, Bicep Curls 3x12).\n" +
           "- Legs Day: Focus on Quadriceps, Hamstrings, and Calves (Squats 4x10, Roman Deadlifts 3x12, Leg Press 3x15).\n\n" +
           "2. Upper-Lower Split - 4 Days/Week (Beginner/Intermediate)\n" +
           "- Upper Body: Exercises for chest, back, shoulders, arms (3 sets per movement, 8-12 reps).\n" +
           "- Lower Body: Focus on leg compounds, glute accessory, calves, and core (4 sets per movement, 10-15 reps).\n\n" +
           "3. Full Body Routine - 3 Days/Week\n" +
           "- Perform compound exercises (squat, bench press, rows, overhead press) in a single session. Rest 48 hours between workouts.";
  }
  if (lowerMsg.includes('form') || lowerMsg.includes('posture') || lowerMsg.includes('technique')) {
    return "Athrix Form and Safety Guidelines:\n\n" +
           "Barbell Squat Form:\n" +
           "1. Setup the bar on your upper traps. Keep chest up and feet slightly wider than shoulder-width.\n" +
           "2. Initiate the descent by pushing hips backward (like sitting in a chair), bending knees.\n" +
           "3. Go down until thighs are parallel to the floor. Keep knees aligned with toes.\n" +
           "4. Drive back up through the heels, keeping the spine straight. Squeeze glutes at lock.\n\n" +
           "Deadlift Form:\n" +
           "1. Stand with feet hip-width, barbell directly over your mid-foot.\n" +
           "2. Hinge forward, grip bar outside shins, flat back, chest up, shoulder blades retracted.\n" +
           "3. Take a deep breath, brace your core, and drive through the floor to lift the bar close to shins.\n" +
           "4. Push hips forward to lock out. Never round your lower back under weight load.";
  }
  if (lowerMsg.includes('indian') || lowerMsg.includes('paneer') || lowerMsg.includes('dal') || lowerMsg.includes('roti') || lowerMsg.includes('chawal')) {
    return "Athrix Indian Macro & Diet guideline:\n\n" +
           "High-Protein Vegetarian Sources:\n" +
           "- Paneer Tikka (100g): 260 kcal | 18g Protein | 8g Carbs | 18g Fat. Excellent for keto or low-carb diets.\n" +
           "- Dal Tadka (1 bowl): 120 kcal | 8g Protein | 16g Carbs | 3g Fat. Combine with brown rice or roti for complete proteins.\n" +
           "- Sattu Drink (2 tbsp in water): 150 kcal | 9g Protein. A highly effective natural post-workout option.\n\n" +
           "High-Protein Non-Vegetarian Sources:\n" +
           "- Chicken Tikka (100g): 165 kcal | 25g Protein | 5g Carbs | 6g Fat. Super clean macro balance.\n" +
           "- Boiled Eggs (2 pieces): 155 kcal | 13g Protein | 11g Fat. Great breakfast starter.\n\n" +
           "Tip: Prefer multigrain rotis or brown/basmati rice over white bread or parathas to optimize fiber and glycemic index.";
  }
  if (lowerMsg.includes('protein') || lowerMsg.includes('muscle')) {
    return "For muscle building, aim for 1.6-2.2g of protein per kg of body weight daily. Good sources include chicken breast, eggs, Greek yogurt, lentils, and whey protein. Spread your protein intake across 4-5 meals for optimal absorption.";
  }
  if (lowerMsg.includes('lose weight') || lowerMsg.includes('fat loss') || lowerMsg.includes('weight loss')) {
    return "For sustainable weight loss, create a moderate calorie deficit of 300-500 calories below your maintenance level. Combine strength training 3-4x/week with cardio 2-3x/week. Focus on whole foods, adequate protein (to preserve muscle), and stay hydrated. Aim for 0.5-1kg loss per week.";
  }
  if (lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
    return "I recommend a balanced workout routine: 3-4 days of strength training targeting different muscle groups, 2 days of cardio (mix of HIIT and steady-state), and 1-2 rest days. Always warm up before and cool down after each session. Progressive overload is key for results.";
  }
  if (lowerMsg.includes('sleep') || lowerMsg.includes('rest') || lowerMsg.includes('recovery')) {
    return "Sleep is crucial for fitness! Aim for 7-9 hours of quality sleep. Tips: maintain a consistent schedule, avoid screens 1 hour before bed, keep your room cool and dark, and avoid caffeine after 2 PM. Good sleep boosts recovery, hormone production, and performance.";
  }
  if (lowerMsg.includes('water') || lowerMsg.includes('hydration')) {
    return "Hydration is essential! Aim for at least 2.5-3.5 liters of water daily, more if you're active. Drink water before, during, and after workouts. A good rule: drink when thirsty and ensure your urine is light yellow. Consider adding electrolytes during intense exercise.";
  }
  if (lowerMsg.includes('supplement')) {
    return "Key supplements to consider: Whey Protein (for convenience), Creatine Monohydrate (5g/day for strength), Vitamin D3 (if deficient), Omega-3 Fish Oil (for recovery), and a good Multivitamin. Always prioritize whole foods first, and consult a doctor before starting supplements.";
  }

  return "Welcome to Athrix! I'm your certified AI fitness & nutrition coach. Ask me about custom workout routines, training splits (PPL/Full Body), exercise forms, Indian macros diet plans, or supplement guides. What are your fitness goals today?";
}


