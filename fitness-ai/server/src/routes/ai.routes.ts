import { Router } from 'express';
import { chat, getMealPlan, getWorkoutPlan } from '../controllers/ai.controller';
import { protect } from '../middleware/auth';

const router = Router();

// All AI routes require authentication
router.use(protect);

router.post('/chat', chat);
router.post('/meal-plan', getMealPlan);
router.post('/workout-plan', getWorkoutPlan);

export default router;
