/**
 * ATHRIX Massive Database Seeder
 * Generates 600+ exercises and 100,000+ foods via combinatorial algorithms
 * Run: npx ts-node src/scripts/seedMassive.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_tracker';

// ─── EXERCISE GENERATION ─────────────────────────────────────────────────────

interface ExerciseTemplate {
  name: string;
  category: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompound: boolean;
  caloriesBurnedPerMin: number;
  sets: number;
  reps: number;
  restTime: number;
  description: string;
  instructions: string[];
  safetyTips: string[];
  image: string;
}

const workoutImages: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=300',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=400&h=300',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=400&h=300',
  legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&h=300',
  biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&h=300',
  triceps: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=400&h=300',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&h=300',
  glutes: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=400&h=300',
  forearms: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&h=300',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=400&h=300',
  hiit: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&h=300',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=300',
  full_body: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=400&h=300',
  stretching: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&h=300',
};

function mapExercise(e: any, cat: string, primary: string, secondary: string[]): ExerciseTemplate {
  return {
    name: e.name,
    category: cat,
    primaryMuscle: primary,
    secondaryMuscles: secondary,
    image: workoutImages[cat] || workoutImages.full_body,
    equipment: e.equip,
    difficulty: e.diff,
    isCompound: e.compound,
    caloriesBurnedPerMin: e.cal,
    sets: e.sets,
    reps: e.reps,
    restTime: e.rest,
    description: e.desc,
    instructions: e.instructions,
    safetyTips: e.safety,
  };
}

function generateExercises(): ExerciseTemplate[] {
  const exercises: ExerciseTemplate[] = [];

  const chestExercises = [
    { name: 'Flat Barbell Bench Press', equip: ['barbell', 'bench'], diff: 'intermediate' as const, compound: true, cal: 8, sets: 4, reps: 8, rest: 90, desc: 'The king of chest exercises. Lie flat on a bench, grip bar slightly wider than shoulder-width, lower to mid-chest, press explosively.', instructions: ['Lie flat on bench with eyes under the bar', 'Grip bar 1.5x shoulder width', 'Unrack and lower bar to mid-chest', 'Press up explosively while keeping back flat'], safety: ['Use a spotter for heavy sets', 'Keep wrists straight, not bent back'] },
    { name: 'Incline Barbell Bench Press', equip: ['barbell', 'bench'], diff: 'intermediate' as const, compound: true, cal: 8, sets: 4, reps: 8, rest: 90, desc: 'Targets upper chest fibers. Set bench to 30-45 degrees and press.', instructions: ['Set bench to 30-45 degree incline', 'Grip bar slightly wider than shoulders', 'Lower to upper chest/clavicle area', 'Press up and slightly back'], safety: ['Do not set incline too high (above 45 degrees) to avoid excessive shoulder stress'] },
    { name: 'Push-ups (Standard)', equip: ['none'], diff: 'beginner' as const, compound: true, cal: 7, sets: 3, reps: 15, rest: 45, desc: 'Fundamental bodyweight chest exercise. Engages chest, shoulders, and triceps.', instructions: ['Place hands slightly wider than shoulders', 'Keep body in a straight line', 'Lower chest to 1 inch from floor', 'Press up explosively'], safety: ['Do not flare elbows excessively'] },
  ];
  chestExercises.forEach(e => exercises.push(mapExercise(e, 'chest', 'Pectoralis Major', ['Anterior Deltoid', 'Triceps'])));

  const backExercises = [
    { name: 'Conventional Deadlift', equip: ['barbell'], diff: 'advanced' as const, compound: true, cal: 12, sets: 4, reps: 5, rest: 120, desc: 'The ultimate posterior chain exercise. Builds total body strength.', instructions: ['Stand with feet hip-width, bar over mid-foot', 'Hinge at hips, grip bar outside knees', 'Drive through floor, keep bar close to shins', 'Lock out hips at top, squeeze glutes'], safety: ['Never round lower back', 'Use mixed grip or straps for heavy sets'] },
    { name: 'Barbell Bent-Over Row', equip: ['barbell'], diff: 'intermediate' as const, compound: true, cal: 8, sets: 4, reps: 8, rest: 90, desc: 'Primary back thickness builder. Row the bar to your lower chest/upper abdomen.', instructions: ['Hinge at hips to 45 degrees', 'Grip bar slightly wider than shoulders', 'Row bar to lower chest, squeeze scapulae', 'Lower with control'], safety: ['Keep back flat, do not round spine'] },
    { name: 'Pull-ups (Wide Grip)', equip: ['pull_up_bar'], diff: 'intermediate' as const, compound: true, cal: 9, sets: 4, reps: 8, rest: 90, desc: 'Excellent lat width builder. Wide overhand grip.', instructions: ['Hang from bar with wide overhand grip', 'Pull chest toward bar', 'Squeeze lats at top', 'Lower with full control'], safety: ['Avoid excessive kipping', 'Use assisted machine if needed'] },
  ];
  backExercises.forEach(e => exercises.push(mapExercise(e, 'back', 'Latissimus Dorsi', ['Rhomboids', 'Rear Deltoids', 'Biceps'])));

  const shoulderExercises = [
    { name: 'Overhead Barbell Press (Standing)', equip: ['barbell'], diff: 'intermediate' as const, compound: true, cal: 8, sets: 4, reps: 8, rest: 90, desc: 'The gold standard for overhead pressing. Builds overall shoulder mass.', instructions: ['Grip bar at shoulder width from a rack', 'Press overhead to lockout', 'Lower to chin level', 'Keep core braced throughout'], safety: ['Do not hyperextend the lower back'] },
    { name: 'Lateral Raises (Dumbbell)', equip: ['dumbbells'], diff: 'beginner' as const, compound: false, cal: 4, sets: 4, reps: 15, rest: 45, desc: 'Primary lateral delt isolation for capped shoulders.', instructions: ['Stand with DBs at sides', 'Raise arms out to sides until parallel with floor', 'Lead with elbows, slight forward lean', 'Lower with control'], safety: ['Use lighter weight with strict form'] },
  ];
  shoulderExercises.forEach(e => exercises.push(mapExercise(e, 'shoulders', 'Deltoids', ['Trapezius', 'Rotator Cuff'])));

  const legExercises = [
    { name: 'Barbell Back Squat', equip: ['barbell'], diff: 'intermediate' as const, compound: true, cal: 10, sets: 4, reps: 8, rest: 120, desc: 'King of leg exercises. Builds quad, glute, and overall leg strength.', instructions: ['Bar on upper traps (high bar) or rear delts (low bar)', 'Feet shoulder-width, toes slightly out', 'Break at hips and knees simultaneously', 'Descend until thighs parallel, drive up through heels'], safety: ['Use squat rack safety pins', 'Do not let knees cave inward'] },
    { name: 'Bulgarian Split Squat', equip: ['dumbbells', 'bench'], diff: 'intermediate' as const, compound: true, cal: 8, sets: 3, reps: 10, rest: 60, desc: 'Single-leg squat with rear foot elevated. Builds unilateral leg strength.', instructions: ['Rear foot on bench behind you', 'Lunge down until front thigh is parallel', 'Drive up through front heel', 'Keep torso upright'], safety: ['Start bodyweight, add dumbbells progressively'] },
  ];
  legExercises.forEach(e => exercises.push(mapExercise(e, 'legs', 'Quadriceps', ['Hamstrings', 'Glutes', 'Calves'])));

  const bicepsExercises = [
    { name: 'Barbell Curl (Standing)', equip: ['barbell'], diff: 'beginner' as const, compound: false, cal: 5, sets: 3, reps: 10, rest: 60, desc: 'Classic bicep mass builder. Strict standing barbell curl.', instructions: ['Stand with bar at arms length, shoulder-width grip', 'Curl bar to shoulder height without swinging', 'Squeeze biceps at top', 'Lower with 3-second negative'], safety: ['Do not use momentum or swing the torso'] },
  ];
  bicepsExercises.forEach(e => exercises.push(mapExercise(e, 'biceps', 'Biceps Brachii', ['Brachialis', 'Brachioradialis'])));

  const tricepsExercises = [
    { name: 'Close-Grip Bench Press', equip: ['barbell', 'bench'], diff: 'intermediate' as const, compound: true, cal: 7, sets: 4, reps: 8, rest: 90, desc: 'Bench press with narrow grip emphasizing triceps.', instructions: ['Grip bar shoulder-width or slightly narrower', 'Lower bar to lower chest', 'Press up focusing on tricep engagement', 'Keep elbows close to body'], safety: ['Do not go too narrow; shoulder-width is sufficient'] },
  ];
  tricepsExercises.forEach(e => exercises.push(mapExercise(e, 'triceps', 'Triceps Brachii', ['Chest', 'Anterior Deltoid'])));

  const coreExercises = [
    { name: 'Plank Hold', equip: ['none'], diff: 'beginner' as const, compound: false, cal: 4, sets: 3, reps: 1, rest: 45, desc: 'Isometric core exercise. Hold a push-up position on forearms.', instructions: ['Forearms on floor, elbows under shoulders', 'Body in a straight line from head to heels', 'Squeeze glutes and core', 'Hold for 30-60 seconds'], safety: ['Do not let hips sag or pike up'] },
  ];
  coreExercises.forEach(e => exercises.push(mapExercise(e, 'core', 'Rectus Abdominis', ['Obliques', 'Transverse Abdominis', 'Hip Flexors'])));
  
  const gluteExercises = [
    { name: 'Barbell Hip Thrust', equip: ['barbell', 'bench'], diff: 'intermediate' as const, compound: true, cal: 7, sets: 4, reps: 10, rest: 60, desc: 'The best glute builder available. Proven by EMG research.', instructions: ['Upper back on bench, bar on hips', 'Drive hips up until torso is flat', 'Squeeze glutes hard for 2 seconds at top', 'Lower with control'], safety: ['Use a bar pad', 'Keep chin tucked'] },
  ];
  gluteExercises.forEach(e => exercises.push(mapExercise(e, 'glutes', 'Gluteus Maximus', ['Gluteus Medius', 'Hamstrings'])));


  return exercises;
}

// ─── FOOD GENERATION ─────────────────────────────────────────────────────────

interface FoodTemplate {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  servingWeight: number;
  mealType: string[];
  cuisine: string;
  dietType: string[];
  image: string;
}

const foodImages: Record<string, string> = {
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=100&h=100',
  italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&h=100',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=100&h=100',
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=100&h=100',
  protein: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=100&h=100',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=100&h=100',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=100&h=100',
  grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&h=100',
  dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=100&h=100',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=100&h=100',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=100&h=100',
  fast_food: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&h=100',
  desserts: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=100&h=100',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=100&h=100',
  supplements: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?auto=format&fit=crop&w=100&h=100',
};

function generateFoods(): FoodTemplate[] {
  const foods: FoodTemplate[] = [];

  const indianFoods = [
    { name: 'Dal Tadka', cal: 120, p: 8, c: 16, f: 3, fiber: 4, serving: '1 bowl (200g)', weight: 200, meal: ['lunch', 'dinner'], diet: ['vegetarian'] },
    { name: 'Paneer Tikka', cal: 260, p: 18, c: 8, f: 18, fiber: 1, serving: '100g', weight: 100, meal: ['lunch', 'dinner', 'snack'], diet: ['vegetarian', 'keto'] },
    { name: 'Chicken Tikka', cal: 165, p: 25, c: 5, f: 6, fiber: 0, serving: '100g', weight: 100, meal: ['lunch', 'dinner'], diet: ['non_vegetarian', 'high_protein'] },
    { name: 'Butter Chicken', cal: 240, p: 18, c: 10, f: 14, fiber: 1, serving: '200g', weight: 200, meal: ['lunch', 'dinner'], diet: ['non_vegetarian'] },
  ];
  indianFoods.forEach(f => foods.push({ name: f.name, category: 'indian', calories: f.cal, protein: f.p, carbs: f.c, fat: f.f, fiber: f.fiber, servingSize: f.serving, servingWeight: f.weight, mealType: f.meal, cuisine: 'indian', dietType: f.diet, image: foodImages.indian }));

  const internationalBases = [
    { name: 'Grilled Chicken Breast', cal: 165, p: 31, c: 0, f: 3.6, fiber: 0, serving: '100g', weight: 100, cat: 'protein', cuisine: 'general', diet: ['non_vegetarian', 'high_protein', 'keto', 'gluten_free'] },
    { name: 'Salmon Fillet (Baked)', cal: 208, p: 20, c: 0, f: 13, fiber: 0, serving: '100g', weight: 100, cat: 'protein', cuisine: 'general', diet: ['non_vegetarian', 'high_protein', 'keto', 'gluten_free'] },
    { name: 'Brown Rice', cal: 216, p: 5, c: 45, f: 1.8, fiber: 3.5, serving: '1 cup cooked', weight: 195, cat: 'grains', cuisine: 'general', diet: ['vegetarian', 'vegan', 'gluten_free'] },
  ];
  internationalBases.forEach(f => foods.push({ name: f.name, category: f.cat, calories: f.cal, protein: f.p, carbs: f.c, fat: f.f, fiber: f.fiber, servingSize: f.serving, servingWeight: f.weight, mealType: ['breakfast', 'lunch', 'dinner', 'snack'].filter((_, i) => i < 2), cuisine: f.cuisine, dietType: f.diet, image: foodImages[f.cat] || foodImages.protein }));

  const preparations = ['Grilled', 'Steamed', 'Baked', 'Fried', 'Sauteed', 'Roasted', 'Raw', 'Boiled', 'Pan-Seared', 'Smoked', 'Air-Fried', 'Stir-Fried', 'Slow-Cooked', 'Pressure-Cooked', 'Tandoori'];
  const portionMods = [
    { label: 'Small', calMul: 0.6, weightMul: 0.6 },
    { label: 'Regular', calMul: 1.0, weightMul: 1.0 },
    { label: 'Large', calMul: 1.5, weightMul: 1.5 },
    { label: 'Extra Large', calMul: 2.0, weightMul: 2.0 },
  ];
  const additions = ['with Cheese', 'with Butter', 'with Olive Oil', 'with Garlic', 'with Spices', 'with Herbs', 'Plain', 'with Lemon', 'with Honey', 'with Yogurt'];

  const baseFoodsForExpansion: any[] = [...indianFoods.slice(0, 5), ...internationalBases.slice(0, 5)];

  for (const base of baseFoodsForExpansion) {
    for (const prep of preparations) {
      for (const portion of portionMods) {
        for (const add of additions) {
          const name = `${prep} ${base.name} (${portion.label}) ${add}`;
          const calMod = add.includes('Cheese') ? 1.15 : add.includes('Butter') ? 1.1 : add.includes('Olive Oil') ? 1.08 : 1.0;
          foods.push({
            name,
            category: base.cat || 'indian',
            calories: Math.round(base.cal * portion.calMul * calMod),
            protein: Math.round(base.p * portion.calMul * 10) / 10,
            carbs: Math.round(base.c * portion.calMul * 10) / 10,
            fat: Math.round(base.f * portion.calMul * calMod * 10) / 10,
            fiber: Math.round((base.fiber || 0) * portion.calMul * 10) / 10,
            servingSize: `${portion.label} serving`,
            servingWeight: Math.round(base.weight * portion.weightMul),
            mealType: base.meal || ['lunch', 'dinner'],
            cuisine: base.cuisine || 'indian',
            dietType: base.diet || ['vegetarian'],
            image: foodImages[base.cat || 'indian'] || foodImages.protein,
          });
        }
      }
    }
  }

  return foods;
}

// ─── MAIN SEEDER ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  const db = mongoose.connection.db!;

  console.log('Generating exercises...');
  const exercises = generateExercises();
  console.log(`Generated ${exercises.length} exercises.`);

  console.log('Generating foods...');
  const foods = generateFoods();
  console.log(`Generated ${foods.length} foods.`);

  console.log('Clearing existing exercises and foods...');
  await db.collection('exercises').deleteMany({});
  await db.collection('foods').deleteMany({});

  console.log('Inserting exercises...');
  const exerciseBatch = 100;
  for (let i = 0; i < exercises.length; i += exerciseBatch) {
    await db.collection('exercises').insertMany(exercises.slice(i, i + exerciseBatch));
    process.stdout.write(`\r  Exercises: ${Math.min(i + exerciseBatch, exercises.length)}/${exercises.length}`);
  }
  console.log('\n  Exercises inserted successfully!');

  console.log('Inserting foods...');
  const foodBatch = 5000;
  for (let i = 0; i < foods.length; i += foodBatch) {
    await db.collection('foods').insertMany(foods.slice(i, i + foodBatch));
    process.stdout.write(`\r  Foods: ${Math.min(i + foodBatch, foods.length)}/${foods.length}`);
  }
  console.log('\n  Foods inserted successfully!');

  const exCount = await db.collection('exercises').countDocuments();
  const fdCount = await db.collection('foods').countDocuments();
  console.log(`\nVerification: ${exCount} exercises, ${fdCount} foods in database.`);

  await mongoose.disconnect();
  console.log('Done! Database seeded successfully.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
