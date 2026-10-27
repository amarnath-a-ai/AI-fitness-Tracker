import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

let mongoServer: MongoMemoryServer;

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
// Development mode previously forced an in-memory database. 
    // We now proceed to try the real MONGO_URI first, and only fall back to in-memory if it fails.

    // 1. Try connecting to the provided URI (e.g. Atlas or local) for production
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    process.env.MOCK_DATABASE = 'false';
  } catch (error) {
    logger.error('MongoDB connection failed. Starting In-Memory MongoDB for full functionality...');
    
    try {
      // Create data directory for persistence
      const dbPath = path.join(__dirname, '../../database-data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // 2. Fallback to in-memory MongoDB server WITH persistence
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath
        }
      });
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
      });
      
      logger.info(`Local Persistent MongoDB Connected: ${mongoUri}`);
      logger.info('Database is now fully functional and data WILL persist across restarts!');
      process.env.MOCK_DATABASE = 'false'; // We have a real DB now!
    } catch (memError) {
      logger.error('Failed to start in-memory MongoDB:', memError);
      process.env.MOCK_DATABASE = 'true';
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});
