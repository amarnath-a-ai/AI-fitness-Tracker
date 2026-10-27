import { Router } from 'express';
import { getDashboard, getProgress, aiMealPlan, aiWorkoutPlan, aiChat, aiPredict } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, getDashboard);
router.get('/progress', protect, getProgress);
router.post('/ai/meal-plan', protect, aiMealPlan);
router.post('/ai/workout-plan', protect, aiWorkoutPlan);
router.post('/ai/chat', protect, aiChat);
router.post('/ai/predict/:model', protect, aiPredict);

export default router;
