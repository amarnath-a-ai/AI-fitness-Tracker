import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { User } from '../models/User';
import { Food } from '../models/Food';
import { Exercise } from '../models/Exercise';
import { Achievement } from '../models/index';
import { logger } from '../utils/logger';

export const seedUsers = async () => {
  const salt = await bcrypt.genSalt(12);

  const users = [
    {
      username: 'admin',
      firstName: 'Admin',
      lastName: 'FitAI',
      email: 'admin@fitai.com',
      password: await bcrypt.hash('Admin@123', salt),
      role: 'admin',
      gender: 'male',
      height: 175,
      weight: 78,
      targetWeight: 75,
      activityLevel: 'active',
      fitnessGoal: 'maintenance',
      dietPreference: 'non_vegetarian',
      dailyCalorieGoal: 2200,
      isEmailVerified: true,
      streak: 15,
    },
    {
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: await bcrypt.hash('Password123', salt),
      role: 'user',
      gender: 'male',
      height: 180,
      weight: 85,
      targetWeight: 75,
      activityLevel: 'moderate',
      fitnessGoal: 'weight_loss',
      dietPreference: 'non_vegetarian',
      dailyCalorieGoal: 1800,
      isEmailVerified: true,
      streak: 7,
    },
    {
      username: 'trainer',
      firstName: 'Sarah',
      lastName: 'Trainer',
      email: 'trainer@fitai.com',
      password: await bcrypt.hash('Trainer@123', salt),
      role: 'trainer',
      gender: 'female',
      height: 165,
      weight: 58,
      targetWeight: 58,
      activityLevel: 'very_active',
      fitnessGoal: 'maintenance',
      dietPreference: 'vegetarian',
      dailyCalorieGoal: 2000,
      isEmailVerified: true,
      streak: 30,
    },
    {
      username: 'priya',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@fitai.com',
      password: await bcrypt.hash('User@123', salt),
      role: 'user',
      gender: 'female',
      height: 160,
      weight: 65,
      targetWeight: 55,
      activityLevel: 'light',
      fitnessGoal: 'weight_loss',
      dietPreference: 'vegetarian',
      dailyCalorieGoal: 1500,
      isEmailVerified: true,
      streak: 3,
    },
    {
      username: 'rahul',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul@fitai.com',
      password: await bcrypt.hash('User@123', salt),
      role: 'user',
      gender: 'male',
      height: 172,
      weight: 68,
      targetWeight: 75,
      activityLevel: 'active',
      fitnessGoal: 'muscle_gain',
      dietPreference: 'non_vegetarian',
      dailyCalorieGoal: 2800,
      isEmailVerified: true,
      streak: 12,
    },
  ];

  await User.insertMany(users);
  logger.info(`✅ ${users.length} users seeded`);
};

export const seedFoods = async () => {
  const baseFoods = [
    { name: 'Chicken Tikka', category: 'indian', calories: 165, protein: 25, carbs: 5, fat: 6, fiber: 1, servingSize: '100g', mealType: ['lunch', 'dinner'], cuisine: 'indian', dietType: ['non_vegetarian', 'high_protein'], image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Dal Tadka', category: 'indian', calories: 120, protein: 8, carbs: 16, fat: 3, fiber: 4, servingSize: '1 bowl', mealType: ['lunch', 'dinner'], cuisine: 'indian', dietType: ['vegetarian', 'vegan'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Paneer Tikka', category: 'indian', calories: 260, protein: 18, carbs: 8, fat: 18, fiber: 1, servingSize: '100g', mealType: ['lunch', 'dinner'], cuisine: 'indian', dietType: ['vegetarian', 'high_protein'], image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Roti / Chapati', category: 'grains', calories: 104, protein: 3, carbs: 21, fat: 1, fiber: 2, servingSize: '1 piece', mealType: ['lunch', 'dinner'], cuisine: 'indian', dietType: ['vegetarian', 'vegan'], image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Steamed Rice', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, servingSize: '1 cup', mealType: ['lunch', 'dinner'], cuisine: 'indian', dietType: ['vegetarian', 'vegan'], image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Caesar Salad', category: 'vegetables', calories: 180, protein: 8, carbs: 10, fat: 12, fiber: 2, servingSize: '1 bowl', mealType: ['lunch'], cuisine: 'italian', dietType: ['vegetarian'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Avocado Toast', category: 'breakfast', calories: 240, protein: 6, carbs: 22, fat: 15, fiber: 7, servingSize: '1 slice', mealType: ['breakfast'], cuisine: 'general', dietType: ['vegetarian', 'vegan'], image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Grilled Salmon', category: 'seafood', calories: 350, protein: 40, carbs: 0, fat: 20, fiber: 0, servingSize: '1 fillet', mealType: ['lunch', 'dinner'], cuisine: 'general', dietType: ['non_vegetarian', 'keto'], image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Greek Yogurt Bowl', category: 'breakfast', calories: 150, protein: 15, carbs: 20, fat: 2, fiber: 3, servingSize: '1 bowl', mealType: ['breakfast', 'snack'], cuisine: 'greek', dietType: ['vegetarian'], image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Quinoa Bowl', category: 'grains', calories: 220, protein: 8, carbs: 39, fat: 4, fiber: 5, servingSize: '1 cup', mealType: ['lunch', 'dinner'], cuisine: 'general', dietType: ['vegan', 'vegetarian'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Protein Smoothie', category: 'drinks', calories: 300, protein: 30, carbs: 25, fat: 5, fiber: 4, servingSize: '1 glass', mealType: ['breakfast', 'snack'], cuisine: 'general', dietType: ['vegetarian', 'high_protein'], image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Beef Steak', category: 'meat', calories: 600, protein: 50, carbs: 0, fat: 40, fiber: 0, servingSize: '250g', mealType: ['dinner'], cuisine: 'american', dietType: ['non_vegetarian', 'keto'], image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Overnight Oats', category: 'breakfast', calories: 250, protein: 10, carbs: 45, fat: 5, fiber: 6, servingSize: '1 jar', mealType: ['breakfast'], cuisine: 'general', dietType: ['vegan', 'vegetarian'], image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&h=400&q=80' }
  ];

  const cuisines = ['Punjabi', 'South Indian', 'Italian', 'Mexican', 'American', 'Chinese', 'Japanese', 'Thai', 'French', 'Lebanese', 'Spanish', 'Greek', 'Turkish', 'Mughlai', 'Bengali', 'Gujarati', 'Kerala', 'Maharashtrian', 'Goan', 'Chettinad'];
  const preparationStyles = ['Grilled', 'Roasted', 'Fried', 'Steamed', 'Baked', 'Curried', 'Tandoori', 'Sautéed', 'Butter', 'Kadhai', 'Spicy', 'Crispy', 'Tangy', 'Stir-fried', 'Poached', 'Smoked', 'Glazed', 'Stuffed', 'Pickled', 'Simmered'];
  const additions = ['with Butter', 'with Garlic', 'with Cheese', 'with Coriander', 'with Ginger', 'with Spinach', 'with Mint', 'with Cream', 'with Mushrooms', 'with Broccoli', 'with Lemon', 'with Herbs', 'with Almonds', 'with Cashews', 'with Peppers'];

  const foods: any[] = [];

  baseFoods.forEach(bf => {
    foods.push({ ...bf, isVerified: true });
  });

  for (const cuisine of cuisines) {
    for (const prep of preparationStyles) {
      for (const add of additions) {
        for (const base of baseFoods) {
          if (foods.length >= 10100) break;
          const foodName = `${prep} ${base.name} ${add} (${cuisine} Style)`;
          
          let calOffset = 0;
          let fatOffset = 0;
          let proteinOffset = 0;
          
          if (add.includes('Butter') || add.includes('Ghee')) { calOffset += 80; fatOffset += 9; }
          if (add.includes('Cheese')) { calOffset += 90; fatOffset += 7; proteinOffset += 6; }
          if (add.includes('Cream') || add.includes('Cashews')) { calOffset += 60; fatOffset += 5; }
          if (prep.includes('Fried') || prep.includes('Crispy')) { calOffset += 110; fatOffset += 12; }
          if (prep.includes('Steamed') || prep.includes('Poached')) { calOffset -= 20; fatOffset -= 2; }

          const calories = Math.max(20, Math.round(base.calories + calOffset));
          const protein = Math.max(0.5, Math.round((base.protein + proteinOffset) * 10) / 10);
          const fat = Math.max(0.1, Math.round((base.fat + fatOffset) * 10) / 10);
          const carbs = Math.max(0.5, Math.round((base.carbs + (calOffset > 0 ? 2 : 0)) * 10) / 10);

            foods.push({
              name: foodName,
              category: base.category,
              calories,
              protein,
              carbs,
              fat,
              fiber: base.fiber,
              servingSize: base.servingSize,
              mealType: base.mealType,
              cuisine: cuisine.toLowerCase(),
              dietType: base.dietType,
              image: base.image, // Pass through the base image!
              isVerified: true
            });
        }
      }
    }
  }

  const batchSize = 1000;
  for (let i = 0; i < foods.length; i += batchSize) {
    const batch = foods.slice(i, i + batchSize);
    await Food.insertMany(batch);
  }
  logger.info(`✅ Generated & Seeded ${foods.length} foods successfully`);
};

export const seedExercises = async () => {
  const baseExercises = [
    // Chest
    { name: 'Push-ups', category: 'chest', difficulty: 'beginner', caloriesBurnedPerMin: 7, sets: 3, reps: 15, equipment: ['none'], restTime: 60, primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'], isCompound: true, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Bench Press', category: 'chest', difficulty: 'intermediate', caloriesBurnedPerMin: 8, sets: 4, reps: 10, equipment: ['barbell', 'bench'], restTime: 90, primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'], isCompound: true, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Flyes', category: 'chest', difficulty: 'intermediate', caloriesBurnedPerMin: 6, sets: 3, reps: 12, equipment: ['dumbbells', 'bench'], restTime: 60, primaryMuscle: 'Chest', secondaryMuscles: ['Shoulders'], isCompound: false, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&h=400&q=80' },
    
    // Back
    { name: 'Pull-ups', category: 'back', difficulty: 'intermediate', caloriesBurnedPerMin: 8, sets: 3, reps: 10, equipment: ['pull_up_bar'], restTime: 90, primaryMuscle: 'Back (Lats)', secondaryMuscles: ['Biceps'], isCompound: true, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Rows', category: 'back', difficulty: 'intermediate', caloriesBurnedPerMin: 7, sets: 4, reps: 10, equipment: ['barbell'], restTime: 90, primaryMuscle: 'Back (Lats)', secondaryMuscles: ['Biceps', 'Rear Delts'], isCompound: true, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Deadlifts', category: 'back', difficulty: 'advanced', caloriesBurnedPerMin: 10, sets: 4, reps: 8, equipment: ['barbell'], restTime: 120, primaryMuscle: 'Back (Lower)', secondaryMuscles: ['Hamstrings', 'Glutes'], isCompound: true, image: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Pulldowns', category: 'back', difficulty: 'beginner', caloriesBurnedPerMin: 6, sets: 3, reps: 12, equipment: ['cable_machine'], restTime: 60, primaryMuscle: 'Back (Lats)', secondaryMuscles: ['Biceps'], isCompound: true, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&h=400&q=80' },

    // Shoulders
    { name: 'Overhead Press', category: 'shoulders', difficulty: 'intermediate', caloriesBurnedPerMin: 7, sets: 4, reps: 10, equipment: ['barbell'], restTime: 90, primaryMuscle: 'Shoulders', secondaryMuscles: ['Triceps'], isCompound: true, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', caloriesBurnedPerMin: 5, sets: 3, reps: 15, equipment: ['dumbbells'], restTime: 45, primaryMuscle: 'Side Delts', secondaryMuscles: ['Traps'], isCompound: false, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=400&q=80' },
    
    // Legs
    { name: 'Squats', category: 'legs', difficulty: 'intermediate', caloriesBurnedPerMin: 9, sets: 4, reps: 10, equipment: ['barbell'], restTime: 120, primaryMuscle: 'Quadriceps', secondaryMuscles: ['Glutes', 'Hamstrings'], isCompound: true, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Lunges', category: 'legs', difficulty: 'beginner', caloriesBurnedPerMin: 7, sets: 3, reps: 12, equipment: ['dumbbells'], restTime: 60, primaryMuscle: 'Quadriceps', secondaryMuscles: ['Glutes'], isCompound: true, image: 'https://images.unsplash.com/photo-1574680178050-55c6f69de7d6?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Leg Press', category: 'legs', difficulty: 'beginner', caloriesBurnedPerMin: 8, sets: 4, reps: 12, equipment: ['cable_machine'], restTime: 90, primaryMuscle: 'Quadriceps', secondaryMuscles: ['Glutes'], isCompound: true, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&h=400&q=80' },
    
    // Arms
    { name: 'Bicep Curls', category: 'biceps', difficulty: 'beginner', caloriesBurnedPerMin: 5, sets: 3, reps: 12, equipment: ['dumbbells'], restTime: 60, primaryMuscle: 'Biceps', secondaryMuscles: [], isCompound: false, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Tricep Extensions', category: 'triceps', difficulty: 'beginner', caloriesBurnedPerMin: 5, sets: 3, reps: 12, equipment: ['cable_machine'], restTime: 60, primaryMuscle: 'Triceps', secondaryMuscles: [], isCompound: false, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=400&q=80' },

    // Core
    { name: 'Plank', category: 'core', difficulty: 'beginner', caloriesBurnedPerMin: 5, sets: 3, reps: 1, equipment: ['yoga_mat'], restTime: 45, primaryMuscle: 'Core', secondaryMuscles: [], isCompound: false, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Crunches', category: 'core', difficulty: 'beginner', caloriesBurnedPerMin: 6, sets: 3, reps: 20, equipment: ['yoga_mat'], restTime: 45, primaryMuscle: 'Rectus Abdominis', secondaryMuscles: [], isCompound: false, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&h=400&q=80' },
    
    // Cardio
    { name: 'Sprint', category: 'cardio', difficulty: 'advanced', caloriesBurnedPerMin: 15, sets: 5, reps: 1, equipment: ['none'], restTime: 60, primaryMuscle: 'Full Body', secondaryMuscles: ['Legs'], isCompound: true, image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&h=400&q=80' },
    { name: 'Jump Rope', category: 'cardio', difficulty: 'intermediate', caloriesBurnedPerMin: 12, sets: 3, reps: 1, equipment: ['jump_rope'], restTime: 60, primaryMuscle: 'Full Body', secondaryMuscles: ['Calves'], isCompound: true, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&h=400&q=80' }
  ];

  const variations = [
    'Incline', 'Decline', 'Weighted', 'Banded', 'One-Arm', 'Tempo', 'Pause', 'Explosive', 
    'Deficit', 'Alternating', 'Seated', 'Standing', 'Cable', 'Dumbbell', 'Barbell', 
    'Smith Machine', 'Kettlebell', 'Reverse Grip', 'Close Grip', 'Wide Grip', 'Isometric',
    'Plyometric', 'Assisted', 'Negative', 'Drop Set', 'Superset', 'AMRAP', 'EMOM',
    'Unilateral', 'Bilateral', 'Staggered Stance', 'Sumo', 'Bulgarian', 'Zercher'
  ];

  const intensities = [
    { prefix: 'Light', calOffset: -2, repOffset: +5 },
    { prefix: 'Heavy', calOffset: +3, repOffset: -4 },
    { prefix: 'Intense', calOffset: +5, repOffset: -2 }
  ];

  const generatedExercises: any[] = [];
  
  // Keep base exercises
  baseExercises.forEach(be => {
    generatedExercises.push({
      ...be,
      description: `A fundamental ${be.category} exercise targeting the ${be.primaryMuscle}.`,
      instructions: ['Warm up properly', 'Execute with controlled form', 'Breathe out on exertion'],
      safetyTips: ['Keep core engaged', 'Do not push through joint pain']
    });
  });

  // Procedurally generate variants
  for (const variant of variations) {
    for (const intensity of intensities) {
      for (const base of baseExercises) {
        if (generatedExercises.length >= 1050) break;
        
        // Don't apply 'Barbell' to something that is inherently 'Cable'
        if (base.equipment.includes('cable_machine') && ['Barbell', 'Dumbbell', 'Kettlebell'].includes(variant)) continue;
        
        const newName = `${intensity.prefix} ${variant} ${base.name}`;
        
        generatedExercises.push({
          name: newName,
          description: `A ${intensity.prefix.toLowerCase()} ${variant.toLowerCase()} variation of ${base.name} for enhanced ${base.primaryMuscle} engagement.`,
          category: base.category,
          difficulty: intensity.prefix === 'Light' ? 'beginner' : (intensity.prefix === 'Heavy' ? 'advanced' : base.difficulty),
          caloriesBurnedPerMin: Math.max(3, base.caloriesBurnedPerMin + intensity.calOffset),
          sets: base.sets,
          reps: Math.max(1, base.reps + intensity.repOffset),
          equipment: variant === 'Dumbbell' ? ['dumbbells'] : (variant === 'Barbell' ? ['barbell'] : base.equipment),
          restTime: base.restTime,
          primaryMuscle: base.primaryMuscle,
          secondaryMuscles: base.secondaryMuscles,
          instructions: ['Warm up properly', 'Execute with controlled form', 'Focus on mind-muscle connection'],
          safetyTips: ['Maintain proper posture', 'Ensure stable footing'],
          isCompound: base.isCompound,
          image: base.image
        });
      }
    }
  }

  // Insert in chunks
  const batchSize = 250;
  for (let i = 0; i < generatedExercises.length; i += batchSize) {
    const batch = generatedExercises.slice(i, i + batchSize);
    await Exercise.insertMany(batch);
  }
  
  logger.info(`✅ Generated & Seeded ${generatedExercises.length} exercises successfully`);
};

export const seedAchievements = async () => {
  const achievements = [
    { name: 'First Steps', description: 'Complete your first workout', icon: '🏃', category: 'workout', requirement: 1, points: 10 },
    { name: 'Week Warrior', description: 'Complete 7 workouts', icon: '⚔️', category: 'workout', requirement: 7, points: 25 },
    { name: 'Iron Will', description: 'Complete 30 workouts', icon: '💪', category: 'workout', requirement: 30, points: 50 },
    { name: 'Century Club', description: 'Complete 100 workouts', icon: '🏆', category: 'workout', requirement: 100, points: 100 },
    { name: 'Calorie Counter', description: 'Log 7 days of meals', icon: '📊', category: 'nutrition', requirement: 7, points: 15 },
    { name: 'Nutrition Master', description: 'Log 30 days of meals', icon: '🥗', category: 'nutrition', requirement: 30, points: 50 },
    { name: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', requirement: 3, points: 10 },
    { name: 'On Fire', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', requirement: 7, points: 25 },
    { name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '⚡', category: 'streak', requirement: 30, points: 75 },
    { name: 'Legend', description: 'Maintain a 100-day streak', icon: '👑', category: 'streak', requirement: 100, points: 200 },
    { name: 'Weight Watcher', description: 'Log weight for 7 consecutive days', icon: '⚖️', category: 'weight', requirement: 7, points: 15 },
    { name: 'Transformation', description: 'Reach your target weight', icon: '🦋', category: 'weight', requirement: 1, points: 100 },
    { name: 'Hydration Hero', description: 'Meet water goal for 7 days', icon: '💧', category: 'milestone', requirement: 7, points: 20 },
    { name: 'Early Bird', description: 'Complete 10 morning workouts', icon: '🌅', category: 'workout', requirement: 10, points: 30 },
    { name: 'Social Butterfly', description: 'Share 5 progress updates', icon: '🦋', category: 'social', requirement: 5, points: 15 },
  ];

  await Achievement.insertMany(achievements);
  logger.info(`✅ ${achievements.length} achievements seeded`);
};

import { connectDB } from '../config/database';

export const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Food.deleteMany({}),
      Exercise.deleteMany({}),
      Achievement.deleteMany({}),
    ]);
    logger.info('🗑️ Cleared existing data');

    // Seed data
    await seedUsers();
    await seedFoods();
    await seedExercises();
    await seedAchievements();

    logger.info('🎉 Database seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
};

// DO NOT AUTO-RUN WHEN IMPORTED
if (require.main === module) {
  seedDatabase();
}
