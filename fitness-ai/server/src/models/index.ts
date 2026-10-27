import mongoose, { Document, Schema } from 'mongoose';

// Workout Log - tracks user workout sessions
export interface IWorkoutLog extends Document {
  user: mongoose.Types.ObjectId;
  exercises: {
    exercise: mongoose.Types.ObjectId;
    sets: { reps: number; weight: number; duration: number }[];
    caloriesBurned: number;
    notes: string;
  }[];
  type: string;
  totalDuration: number;
  totalCaloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high';
  mood: 'great' | 'good' | 'okay' | 'tired' | 'exhausted';
  notes: string;
  date: Date;
  createdAt: Date;
}

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exercises: [
      {
        exercise: {
          type: Schema.Types.ObjectId,
          ref: 'Exercise',
          required: true,
        },
        sets: [
          {
            reps: { type: Number, default: 0 },
            weight: { type: Number, default: 0 },
            duration: { type: Number, default: 0 },
          },
        ],
        caloriesBurned: { type: Number, default: 0 },
        notes: { type: String, default: '' },
      },
    ],
    type: {
      type: String,
      enum: ['strength', 'cardio', 'hiit', 'yoga', 'flexibility', 'sports', 'custom'],
      default: 'strength',
    },
    totalDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0,
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate',
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'tired', 'exhausted'],
      default: 'good',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workoutLogSchema.index({ user: 1, date: -1 });

// Meal Log - tracks user food intake
export interface IMealLog extends Document {
  user: mongoose.Types.ObjectId;
  food: mongoose.Types.ObjectId;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
  notes: string;
  createdAt: Date;
}

const mealLogSchema = new Schema<IMealLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    servings: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

mealLogSchema.index({ user: 1, date: -1 });
mealLogSchema.index({ user: 1, mealType: 1 });

// Water Log
export interface IWaterLog extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  unit: 'ml' | 'glasses' | 'liters';
  date: Date;
  createdAt: Date;
}

const waterLogSchema = new Schema<IWaterLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['ml', 'glasses', 'liters'],
      default: 'glasses',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

waterLogSchema.index({ user: 1, date: -1 });

// Sleep Log
export interface ISleepLog extends Document {
  user: mongoose.Types.ObjectId;
  sleepTime: Date;
  wakeTime: Date;
  duration: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
  notes: string;
  date: Date;
  createdAt: Date;
}

const sleepLogSchema = new Schema<ISleepLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sleepTime: {
      type: Date,
      required: true,
    },
    wakeTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'terrible'],
      default: 'good',
    },
    notes: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sleepLogSchema.index({ user: 1, date: -1 });

// Weight Log
export interface IWeightLog extends Document {
  user: mongoose.Types.ObjectId;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number;
  notes: string;
  date: Date;
  createdAt: Date;
}

const weightLogSchema = new Schema<IWeightLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 500,
    },
    bodyFat: {
      type: Number,
      default: 0,
      min: 0,
      max: 70,
    },
    muscleMass: {
      type: Number,
      default: 0,
    },
    bmi: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

weightLogSchema.index({ user: 1, date: -1 });

// Goal
export interface IGoal extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'paused';
  createdAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['weight', 'calories', 'workout', 'water', 'sleep', 'steps', 'custom'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, status: 1 });

// Achievement
export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
}

const achievementSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      enum: ['workout', 'nutrition', 'streak', 'weight', 'social', 'milestone'],
      required: true,
    },
    requirement: {
      type: Number,
      required: true,
    },
    points: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// User Achievement
export interface IUserAchievement extends Document {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  unlockedAt: Date;
}

const userAchievementSchema = new Schema<IUserAchievement>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index({ user: 1 });

// Notification
export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['workout', 'nutrition', 'water', 'sleep', 'achievement', 'system', 'reminder'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1 });

// Blog
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 300,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['nutrition', 'workout', 'wellness', 'motivation', 'recipes', 'tips'],
      required: true,
    },
    tags: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ title: 'text', content: 'text' });

// Community Post
export interface ICommunityPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image: string;
  type: string;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['progress', 'achievement', 'workout', 'meal', 'motivation', 'question'],
      default: 'progress',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ user: 1 });

// Export all models
export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', workoutLogSchema);
export const MealLog = mongoose.model<IMealLog>('MealLog', mealLogSchema);
export const WaterLog = mongoose.model<IWaterLog>('WaterLog', waterLogSchema);
export const SleepLog = mongoose.model<ISleepLog>('SleepLog', sleepLogSchema);
export const WeightLog = mongoose.model<IWeightLog>('WeightLog', weightLogSchema);
export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);
export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
