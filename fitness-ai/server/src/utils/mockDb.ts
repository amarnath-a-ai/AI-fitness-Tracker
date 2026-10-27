import { IUser } from '../models/User';

export const mockUsersDb: any[] = [
  {
    _id: 'mock_admin_id',
    username: 'admin',
    firstName: 'Pramuditya',
    lastName: 'Uzumaki',
    email: 'admin@athrix.com',
    password: 'Admin@123', // Raw password for simple comparison in mock mode
    role: 'admin',
    gender: 'male',
    height: 175,
    weight: 78,
    targetWeight: 75,
    activityLevel: 'active',
    fitnessGoal: 'maintenance',
    dietPreference: 'non_vegetarian',
    dailyCalorieGoal: 2200,
    dailyWaterGoal: 8,
    dailyStepsGoal: 10000,
    dailySleepGoal: 8,
    streak: 15,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock_user_id',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@athrix.com',

    password: 'User@123',
    role: 'user',
    gender: 'male',
    height: 180,
    weight: 85,
    targetWeight: 75,
    activityLevel: 'moderate',
    fitnessGoal: 'weight_loss',
    dietPreference: 'non_vegetarian',
    dailyCalorieGoal: 1800,
    dailyWaterGoal: 8,
    dailyStepsGoal: 10000,
    dailySleepGoal: 8,
    streak: 7,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const isMockMode = () => process.env.MOCK_DATABASE === 'true';
