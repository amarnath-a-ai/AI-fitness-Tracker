import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { predictBMI, predictSleepQuality } from '../services/ml.service';

export const analyzeBMI = async (req: AuthRequest, res: Response) => {
  try {
    const { weight, height } = req.body;

    if (!weight || !height) {
      return res.status(400).json({ success: false, message: 'Weight and height are required' });
    }

    try {
      // Try Python ML service first
      const aiRes = await axios.post(`${config.aiServiceUrl}/api/predict/bmi`, { weight, height }, { timeout: 5000 });
      return res.status(200).json({ success: true, data: aiRes.data });
    } catch {
      // Fallback to local JS prediction
      const prediction = predictBMI(weight, height);
      return res.status(200).json({ success: true, data: prediction });
    }
  } catch (error: any) {
    logger.error(`BMI Analysis Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const analyzeSleep = async (req: AuthRequest, res: Response) => {
  try {
    const { duration, deepSleepHours, remSleepHours, stressLevel, caffeine, screenTime } = req.body;

    if (duration === undefined) {
      return res.status(400).json({ success: false, message: 'Missing sleep data' });
    }

    try {
      // Try Python ML service first
      const aiRes = await axios.post(`${config.aiServiceUrl}/api/predict/sleep`, {
        duration,
        stress_level: stressLevel || 5,
        caffeine: caffeine || 0,
        screen_time: screenTime || 2,
      }, { timeout: 5000 });
      return res.status(200).json({ success: true, data: aiRes.data });
    } catch {
      // Fallback to local JS prediction
      const quality = predictSleepQuality(duration, deepSleepHours || 1.5, remSleepHours || 2);
      return res.status(200).json({ success: true, data: { quality } });
    }
  } catch (error: any) {
    logger.error(`Sleep Analysis Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
