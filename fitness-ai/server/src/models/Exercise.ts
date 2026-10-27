import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  caloriesBurnedPerMin: number;
  sets: number;
  reps: number;
  duration: number;
  equipment: string[];
  restTime: number;
  primaryMuscle: string;
  secondaryMuscles: string[];
  instructions: string[];
  safetyTips: string[];
  image: string;
  gifUrl: string;
  videoUrl: string;
  isCompound: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps',
        'core', 'hiit', 'yoga', 'cardio', 'pilates', 'stretching',
        'full_body', 'glutes', 'forearms',
      ],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    caloriesBurnedPerMin: {
      type: Number,
      required: true,
      min: 0,
    },
    sets: {
      type: Number,
      default: 3,
    },
    reps: {
      type: Number,
      default: 12,
    },
    duration: {
      type: Number,
      default: 0,
    },
    equipment: [{
      type: String,
      enum: [
        'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_band',
        'pull_up_bar', 'bench', 'cable_machine', 'smith_machine',
        'exercise_ball', 'foam_roller', 'jump_rope', 'treadmill',
        'stationary_bike', 'rowing_machine', 'yoga_mat', 'medicine_ball',
      ],
    }],
    restTime: {
      type: Number,
      default: 60,
    },
    primaryMuscle: {
      type: String,
      required: true,
    },
    secondaryMuscles: [{
      type: String,
    }],
    instructions: [{
      type: String,
    }],
    safetyTips: [{
      type: String,
    }],
    image: {
      type: String,
      default: '',
    },
    gifUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    isCompound: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ primaryMuscle: 1 });

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);
