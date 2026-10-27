import { Router } from 'express';
import {
  addWater, getWaterLogs, getDailyWater, deleteWaterLog,
  addSleep, getSleepLogs, deleteSleepLog,
  addWeight, getWeightLogs, deleteWeightLog,
  createGoal, getGoals, updateGoal, deleteGoal,
} from '../controllers/tracker.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { waterLogSchema, sleepLogSchema, weightLogSchema, goalSchema } from '../validators/schemas';

const router = Router();

// Water
router.post('/water', protect, validate(waterLogSchema), addWater);
router.get('/water', protect, getWaterLogs);
router.get('/water/daily', protect, getDailyWater);
router.delete('/water/:id', protect, deleteWaterLog);

// Sleep
router.post('/sleep', protect, validate(sleepLogSchema), addSleep);
router.get('/sleep', protect, getSleepLogs);
router.delete('/sleep/:id', protect, deleteSleepLog);

// Weight
router.post('/weight', protect, validate(weightLogSchema), addWeight);
router.get('/weight', protect, getWeightLogs);
router.delete('/weight/:id', protect, deleteWeightLog);

// Goals
router.post('/goals', protect, validate(goalSchema), createGoal);
router.get('/goals', protect, getGoals);
router.put('/goals/:id', protect, updateGoal);
router.delete('/goals/:id', protect, deleteGoal);

export default router;
