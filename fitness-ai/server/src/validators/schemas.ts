import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  gender: Joi.string().valid('male', 'female', 'other').default('male'),
  dateOfBirth: Joi.date().optional(),
  height: Joi.number().min(50).max(300).optional(),
  weight: Joi.number().min(20).max(500).optional(),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  height: Joi.number().min(50).max(300).optional(),
  weight: Joi.number().min(20).max(500).optional(),
  targetWeight: Joi.number().min(20).max(500).optional(),
  activityLevel: Joi.string()
    .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
    .optional(),
  fitnessGoal: Joi.string()
    .valid('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength')
    .optional(),
  dietPreference: Joi.string()
    .valid('vegetarian', 'non_vegetarian', 'vegan', 'keto', 'paleo')
    .optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  medicalConditions: Joi.array().items(Joi.string()).optional(),
  dailyCalorieGoal: Joi.number().min(500).max(10000).optional(),
  dailyWaterGoal: Joi.number().min(1).max(30).optional(),
  dailyStepsGoal: Joi.number().min(100).max(100000).optional(),
  dailySleepGoal: Joi.number().min(3).max(14).optional(),
});

export const foodSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  category: Joi.string().required(),
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).required(),
  carbs: Joi.number().min(0).required(),
  fat: Joi.number().min(0).required(),
  fiber: Joi.number().min(0).optional(),
  sugar: Joi.number().min(0).optional(),
  sodium: Joi.number().min(0).optional(),
  servingSize: Joi.string().optional(),
  servingWeight: Joi.number().optional(),
  mealType: Joi.array().items(Joi.string()).optional(),
  cuisine: Joi.string().optional(),
  dietType: Joi.array().items(Joi.string()).optional(),
  image: Joi.string().uri().allow('').optional(),
  barcode: Joi.string().allow('').optional(),
});

export const mealLogSchema = Joi.object({
  food: Joi.string().required(),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
  servings: Joi.number().min(0.1).default(1),
  date: Joi.date().optional(),
  notes: Joi.string().allow('').optional(),
});

export const workoutLogSchema = Joi.object({
  exercises: Joi.array()
    .items(
      Joi.object({
        exercise: Joi.string().required(),
        sets: Joi.array()
          .items(
            Joi.object({
              reps: Joi.number().min(0).default(0),
              weight: Joi.number().min(0).default(0),
              duration: Joi.number().min(0).default(0),
            })
          )
          .optional(),
        caloriesBurned: Joi.number().min(0).optional(),
        notes: Joi.string().allow('').optional(),
      })
    )
    .required(),
  type: Joi.string()
    .valid('strength', 'cardio', 'hiit', 'yoga', 'flexibility', 'sports', 'custom')
    .default('strength'),
  totalDuration: Joi.number().min(0).required(),
  totalCaloriesBurned: Joi.number().min(0).optional(),
  intensity: Joi.string().valid('low', 'moderate', 'high').default('moderate'),
  mood: Joi.string().valid('great', 'good', 'okay', 'tired', 'exhausted').optional(),
  notes: Joi.string().allow('').max(500).optional(),
  date: Joi.date().optional(),
});

export const waterLogSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  unit: Joi.string().valid('ml', 'glasses', 'liters').default('glasses'),
  date: Joi.date().optional(),
});

export const sleepLogSchema = Joi.object({
  sleepTime: Joi.date().required(),
  wakeTime: Joi.date().required(),
  quality: Joi.string()
    .valid('excellent', 'good', 'fair', 'poor', 'terrible')
    .default('good'),
  notes: Joi.string().allow('').optional(),
  date: Joi.date().optional(),
});

export const weightLogSchema = Joi.object({
  weight: Joi.number().min(20).max(500).required(),
  bodyFat: Joi.number().min(0).max(70).optional(),
  muscleMass: Joi.number().min(0).optional(),
  notes: Joi.string().allow('').optional(),
  date: Joi.date().optional(),
});

export const goalSchema = Joi.object({
  type: Joi.string()
    .valid('weight', 'calories', 'workout', 'water', 'sleep', 'steps', 'custom')
    .required(),
  title: Joi.string().max(200).required(),
  description: Joi.string().allow('').optional(),
  targetValue: Joi.number().required(),
  currentValue: Joi.number().optional(),
  unit: Joi.string().allow('').optional(),
  endDate: Joi.date().required(),
});

export const blogSchema = Joi.object({
  title: Joi.string().max(300).required(),
  content: Joi.string().required(),
  excerpt: Joi.string().max(500).optional(),
  category: Joi.string()
    .valid('nutrition', 'workout', 'wellness', 'motivation', 'recipes', 'tips')
    .required(),
  tags: Joi.array().items(Joi.string()).optional(),
  coverImage: Joi.string().allow('').optional(),
  isPublished: Joi.boolean().optional(),
});

export const communityPostSchema = Joi.object({
  content: Joi.string().max(1000).required(),
  type: Joi.string()
    .valid('progress', 'achievement', 'workout', 'meal', 'motivation', 'question')
    .default('progress'),
  image: Joi.string().allow('').optional(),
});
