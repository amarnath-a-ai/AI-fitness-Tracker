import { Router } from 'express';
import {
  getFoods, getFood, createFood, updateFood, deleteFood,
  logMeal, getMealLogs, deleteMealLog, getDailyNutrition,
} from '../controllers/food.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { foodSchema, mealLogSchema } from '../validators/schemas';

const router = Router();

// Food database
router.get('/', protect, getFoods);
router.get('/:id', protect, getFood);
router.post('/', protect, validate(foodSchema), createFood);
router.put('/:id', protect, validate(foodSchema), updateFood);
router.delete('/:id', protect, deleteFood);

// Meal logging
router.post('/meals/log', protect, validate(mealLogSchema), logMeal);
router.get('/meals/logs', protect, getMealLogs);
router.get('/meals/daily', protect, getDailyNutrition);
router.delete('/meals/:id', protect, deleteMealLog);

export default router;
