import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Food } from '../models/Food';
import { MealLog } from '../models/index';
import { getPagination, createPaginatedResponse } from '../utils/pagination';
import { logger } from '../utils/logger';

// Get all foods
export const getFoods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort, filter } = getPagination(req.query);

    // Additional filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.dietType) filter.dietType = { $in: [req.query.dietType] };
    if (req.query.mealType) filter.mealType = { $in: [req.query.mealType] };
    if (req.query.minCalories || req.query.maxCalories) {
      filter.calories = {};
      if (req.query.minCalories) filter.calories.$gte = Number(req.query.minCalories);
      if (req.query.maxCalories) filter.calories.$lte = Number(req.query.maxCalories);
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
      ];
      delete filter.$text;
    }

    const [foods, total] = await Promise.all([
      Food.find(filter).sort(sort).skip(skip).limit(limit),
      Food.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(foods, total, page, limit));
  } catch (error: any) {
    logger.error('Get foods error:', error);
    res.status(500).json({ success: false, message: 'Failed to get foods' });
  }
};

// Get single food
export const getFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      res.status(404).json({ success: false, message: 'Food not found' });
      return;
    }
    res.status(200).json({ success: true, data: food });
  } catch (error: any) {
    logger.error('Get food error:', error);
    res.status(500).json({ success: false, message: 'Failed to get food' });
  }
};

// Create food
export const createFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    req.body.createdBy = req.user._id;
    const food = await Food.create(req.body);
    res.status(201).json({ success: true, data: food, message: 'Food added' });
  } catch (error: any) {
    logger.error('Create food error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create food' });
  }
};

// Update food
export const updateFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) {
      res.status(404).json({ success: false, message: 'Food not found' });
      return;
    }
    res.status(200).json({ success: true, data: food, message: 'Food updated' });
  } catch (error: any) {
    logger.error('Update food error:', error);
    res.status(500).json({ success: false, message: 'Failed to update food' });
  }
};

// Delete food
export const deleteFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      res.status(404).json({ success: false, message: 'Food not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Food deleted' });
  } catch (error: any) {
    logger.error('Delete food error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete food' });
  }
};

// Log meal
export const logMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const food = await Food.findById(req.body.food);
    if (!food) {
      res.status(404).json({ success: false, message: 'Food not found' });
      return;
    }

    const servings = req.body.servings || 1;
    const mealLog = await MealLog.create({
      user: req.user._id,
      food: food._id,
      mealType: req.body.mealType,
      servings,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings * 10) / 10,
      carbs: Math.round(food.carbs * servings * 10) / 10,
      fat: Math.round(food.fat * servings * 10) / 10,
      date: req.body.date || new Date(),
      notes: req.body.notes || '',
    });

    const populated = await MealLog.findById(mealLog._id).populate('food');
    res.status(201).json({ success: true, data: populated, message: 'Meal logged' });
  } catch (error: any) {
    logger.error('Log meal error:', error);
    res.status(500).json({ success: false, message: 'Failed to log meal' });
  }
};

// Get meal logs
export const getMealLogs = async (req: AuthRequest, res: Response): Promise<void> => {
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
    if (req.query.mealType) filter.mealType = req.query.mealType;

    const [logs, total] = await Promise.all([
      MealLog.find(filter).populate('food').sort(sort).skip(skip).limit(limit),
      MealLog.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(logs, total, page, limit));
  } catch (error: any) {
    logger.error('Get meal logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get meal logs' });
  }
};

// Delete meal log
export const deleteMealLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const log = await MealLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) {
      res.status(404).json({ success: false, message: 'Meal log not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Meal log deleted' });
  } catch (error: any) {
    logger.error('Delete meal log error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete meal log' });
  }
};

// Get daily nutrition summary
export const getDailyNutrition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await MealLog.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          items: { $sum: 1 },
        },
      },
    ]);

    const totals = summary.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        meals: summary,
        totals,
        goal: req.user.dailyCalorieGoal || 2000,
        remaining: (req.user.dailyCalorieGoal || 2000) - totals.calories,
      },
    });
  } catch (error: any) {
    logger.error('Get daily nutrition error:', error);
    res.status(500).json({ success: false, message: 'Failed to get nutrition' });
  }
};
