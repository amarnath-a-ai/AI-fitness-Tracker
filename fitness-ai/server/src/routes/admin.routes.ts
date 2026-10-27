import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import { User } from '../models/User';
import { Food } from '../models/Food';
import { Exercise } from '../models/Exercise';
import { WorkoutLog, MealLog, WaterLog, SleepLog, WeightLog, Blog, CommunityPost } from '../models/index';
import { getPagination, createPaginatedResponse } from '../utils/pagination';
import { logger } from '../utils/logger';

const router = Router();

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// Admin Dashboard Stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers, totalFoods, totalExercises,
      totalWorkouts, totalMeals, newUsersToday,
    ] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
      Exercise.countDocuments(),
      WorkoutLog.countDocuments(),
      MealLog.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Recent registrations (last 7 days)
    const recentRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFoods,
        totalExercises,
        totalWorkouts,
        totalMeals,
        newUsersToday,
        usersByRole,
        recentRegistrations,
      },
    });
  } catch (error: any) {
    logger.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
});

// Manage Users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json(createPaginatedResponse(users, total, page, limit));
  } catch (error: any) {
    logger.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    logger.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Manage Blogs
router.get('/blogs', async (req: AuthRequest, res: Response) => {
  try {
    const blogs = await Blog.find().populate('author', 'firstName lastName').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get blogs' });
  }
});

router.post('/blogs', async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const blog = await Blog.create({
      ...req.body,
      slug,
      author: req.user._id,
    });
    res.status(201).json({ success: true, data: blog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create blog' });
  }
});

router.put('/blogs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: blog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update blog' });
  }
});

router.delete('/blogs/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

export default router;
