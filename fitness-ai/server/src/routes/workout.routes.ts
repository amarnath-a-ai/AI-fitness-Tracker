import { Router } from 'express';
import {
  getExercises, getExercise, createExercise, updateExercise, deleteExercise,
  logWorkout, getWorkoutLogs, deleteWorkoutLog, getWorkoutSummary,
} from '../controllers/workout.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { workoutLogSchema } from '../validators/schemas';

const router = Router();

// Exercise database
router.get('/exercises', protect, getExercises);
router.get('/exercises/:id', protect, getExercise);
router.post('/exercises', protect, authorize('admin', 'trainer'), createExercise);
router.put('/exercises/:id', protect, authorize('admin', 'trainer'), updateExercise);
router.delete('/exercises/:id', protect, authorize('admin'), deleteExercise);

// Workout logging
router.post('/log', protect, validate(workoutLogSchema), logWorkout);
router.get('/logs', protect, getWorkoutLogs);
router.get('/summary', protect, getWorkoutSummary);
router.delete('/logs/:id', protect, deleteWorkoutLog);

export default router;
