import { Router } from 'express';
import { analyzeBMI, analyzeSleep } from '../controllers/health.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/predict/bmi', analyzeBMI);
router.post('/predict/sleep', analyzeSleep);

export default router;
