import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Exercise } from '../models/Exercise';
import { WorkoutLog } from '../models/index';
import { User } from '../models/User';
import { getPagination, createPaginatedResponse } from '../utils/pagination';
import { logger } from '../utils/logger';

// Get exercises
export const getExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort, filter } = getPagination(req.query);

    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.primaryMuscle) filter.primaryMuscle = req.query.primaryMuscle;
    if (req.query.equipment) filter.equipment = { $in: [req.query.equipment] };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
      delete filter.$text;
    }

    const [exercises, total] = await Promise.all([
      Exercise.find(filter).sort(sort).skip(skip).limit(limit),
      Exercise.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(exercises, total, page, limit));
  } catch (error: any) {
    logger.error('Get exercises error:', error);
    res.status(500).json({ success: false, message: 'Failed to get exercises' });
  }
};

// Get single exercise
export const getExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }
    res.status(200).json({ success: true, data: exercise });
  } catch (error: any) {
    logger.error('Get exercise error:', error);
    res.status(500).json({ success: false, message: 'Failed to get exercise' });
  }
};

// Create exercise (admin)
export const createExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, data: exercise, message: 'Exercise created' });
  } catch (error: any) {
    logger.error('Create exercise error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create exercise' });
  }
};

// Update exercise (admin)
export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }
    res.status(200).json({ success: true, data: exercise, message: 'Exercise updated' });
  } catch (error: any) {
    logger.error('Update exercise error:', error);
    res.status(500).json({ success: false, message: 'Failed to update exercise' });
  }
};

// Delete exercise (admin)
export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Exercise deleted' });
  } catch (error: any) {
    logger.error('Delete exercise error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete exercise' });
  }
};

// Log workout
export const logWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workoutLog = await WorkoutLog.create({
      ...req.body,
      user: req.user._id,
      date: req.body.date || new Date(),
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalWorkouts: 1,
        totalCaloriesBurned: workoutLog.totalCaloriesBurned || 0,
      },
    });

    const populated = await WorkoutLog.findById(workoutLog._id).populate(
      'exercises.exercise'
    );

    res.status(201).json({ success: true, data: populated, message: 'Workout logged' });
  } catch (error: any) {
    logger.error('Log workout error:', error);
    res.status(500).json({ success: false, message: 'Failed to log workout' });
  }
};

// Get workout logs
export const getWorkoutLogs = async (req: AuthRequest, res: Response): Promise<void> => {
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
    if (req.query.type) filter.type = req.query.type;

    const [logs, total] = await Promise.all([
      WorkoutLog.find(filter)
        .populate('exercises.exercise')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      WorkoutLog.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(logs, total, page, limit));
  } catch (error: any) {
    logger.error('Get workout logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get workout logs' });
  }
};

// Delete workout log
export const deleteWorkoutLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const log = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) {
      res.status(404).json({ success: false, message: 'Workout log not found' });
      return;
    }

    // Decrement user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalWorkouts: -1,
        totalCaloriesBurned: -(log.totalCaloriesBurned || 0),
      },
    });

    res.status(200).json({ success: true, message: 'Workout log deleted' });
  } catch (error: any) {
    logger.error('Delete workout log error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete workout log' });
  }
};

// Get workout summary
export const getWorkoutSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await WorkoutLog.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalDuration: { $sum: '$totalDuration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          workouts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    logger.error('Get workout summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get workout summary' });
  }
};
