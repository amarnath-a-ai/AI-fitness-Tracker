import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'trainer';
  avatar: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'strength';
  dietPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'keto' | 'paleo';
  allergies: string[];
  medicalConditions: string[];
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dailyStepsGoal: number;
  dailySleepGoal: number;
  streak: number;
  lastActiveDate: Date;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  isEmailVerified: boolean;
  otp: string;
  otpExpiry: Date;
  refreshToken: string;
  resetPasswordToken: string;
  resetPasswordExpiry: Date;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'trainer'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    height: {
      type: Number,
      default: 170,
      min: 50,
      max: 300,
    },
    weight: {
      type: Number,
      default: 70,
      min: 20,
      max: 500,
    },
    targetWeight: {
      type: Number,
      default: 65,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength'],
      default: 'maintenance',
    },
    dietPreference: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'keto', 'paleo'],
      default: 'non_vegetarian',
    },
    allergies: [{
      type: String,
    }],
    medicalConditions: [{
      type: String,
    }],
    dailyCalorieGoal: {
      type: Number,
      default: 2000,
    },
    dailyWaterGoal: {
      type: Number,
      default: 8,
    },
    dailyStepsGoal: {
      type: Number,
      default: 10000,
    },
    dailySleepGoal: {
      type: Number,
      default: 8,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    totalWorkouts: {
      type: Number,
      default: 0,
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for age
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return undefined;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export const User = mongoose.model<IUser>('User', userSchema);
