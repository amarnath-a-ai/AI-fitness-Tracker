import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Food } from '../models/Food';
import indianFoods from '../data/indian_foods.json';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedFoods = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitai';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');

    // Optionally clear existing indian foods
    await Food.deleteMany({ category: 'indian' });
    console.log('Cleared existing indian foods from database...');

    console.log(`Preparing to insert ${indianFoods.length} Indian foods...`);
    
    // Batch insert for better performance
    const batchSize = 100;
    for (let i = 0; i < indianFoods.length; i += batchSize) {
      const batch = indianFoods.slice(i, i + batchSize);
      await Food.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1}...`);
    }

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedFoods();
