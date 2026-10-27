import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WaterLog, SleepLog, WeightLog, Goal } from '../models/index';
import { User } from '../models/User';
import { getPagination, createPaginatedResponse } from '../utils/pagination';
import { logger } from '../utils/logger';

// ==================== WATER ====================

export const addWater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const log = await WaterLog.create({
      ...req.body,
      user: req.user._id,
      date: req.body.date || new Date(),
    });
    res.status(201).json({ success: true, data: log, message: 'Water intake logged' });
  } catch (error: any) {
    logger.error('Add water error:', error);
    res.status(500).json({ success: false, message: 'Failed to log water' });
  }
};

export const getWaterLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter: any = { user: req.user._id };

    if (req.query.date) {
      const date = new Date(req.query.date as string);
      filter.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const [logs, total] = await Promise.all([
      WaterLog.find(filter).sort(sort).skip(skip).limit(limit),
      WaterLog.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(logs, total, page, limit));
  } catch (error: any) {
    logger.error('Get water logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get water logs' });
  }
};

export const getDailyWater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await WaterLog.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          entries: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: result[0]?.total || 0,
        entries: result[0]?.entries || 0,
        goal: req.user.dailyWaterGoal || 8,
      },
    });
  } catch (error: any) {
    logger.error('Get daily water error:', error);
    res.status(500).json({ success: false, message: 'Failed to get daily water' });
  }
};

export const deleteWaterLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await WaterLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Water log deleted' });
  } catch (error: any) {
    logger.error('Delete water log error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete water log' });
  }
};

// ==================== SLEEP ====================

export const addSleep = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sleepTime = new Date(req.body.sleepTime);
    const wakeTime = new Date(req.body.wakeTime);
    const duration = (wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60 * 60);

    const log = await SleepLog.create({
      ...req.body,
      user: req.user._id,
      duration: Math.round(duration * 10) / 10,
      date: req.body.date || new Date(),
    });

    res.status(201).json({ success: true, data: log, message: 'Sleep logged' });
  } catch (error: any) {
    logger.error('Add sleep error:', error);
    res.status(500).json({ success: false, message: 'Failed to log sleep' });
  }
};

export const getSleepLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter: any = { user: req.user._id };

    const [logs, total] = await Promise.all([
      SleepLog.find(filter).sort(sort).skip(skip).limit(limit),
      SleepLog.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(logs, total, page, limit));
  } catch (error: any) {
    logger.error('Get sleep logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sleep logs' });
  }
};

export const deleteSleepLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await SleepLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Sleep log deleted' });
  } catch (error: any) {
    logger.error('Delete sleep log error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sleep log' });
  }
};

// ==================== WEIGHT ====================

export const addWeight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Calculate BMI
    const heightM = (req.user.height || 170) / 100;
    const bmi = Math.round((req.body.weight / (heightM * heightM)) * 10) / 10;

    const log = await WeightLog.create({
      ...req.body,
      user: req.user._id,
      bmi,
      date: req.body.date || new Date(),
    });

    // Update user's current weight
    await User.findByIdAndUpdate(req.user._id, { weight: req.body.weight });

    res.status(201).json({ success: true, data: log, message: 'Weight logged' });
  } catch (error: any) {
    logger.error('Add weight error:', error);
    res.status(500).json({ success: false, message: 'Failed to log weight' });
  }
};

export const getWeightLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter: any = { user: req.user._id };

    const [logs, total] = await Promise.all([
      WeightLog.find(filter).sort(sort).skip(skip).limit(limit),
      WeightLog.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(logs, total, page, limit));
  } catch (error: any) {
    logger.error('Get weight logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get weight logs' });
  }
};

export const deleteWeightLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Weight log deleted' });
  } catch (error: any) {
    logger.error('Delete weight log error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete weight log' });
  }
};

// ==================== GOALS ====================

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json({ success: true, data: goal, message: 'Goal created' });
  } catch (error: any) {
    logger.error('Create goal error:', error);
    res.status(500).json({ success: false, message: 'Failed to create goal' });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: goals });
  } catch (error: any) {
    logger.error('Get goals error:', error);
    res.status(500).json({ success: false, message: 'Failed to get goals' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }
    res.status(200).json({ success: true, data: goal, message: 'Goal updated' });
  } catch (error: any) {
    logger.error('Update goal error:', error);
    res.status(500).json({ success: false, message: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error: any) {
    logger.error('Delete goal error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete goal' });
  }
};
