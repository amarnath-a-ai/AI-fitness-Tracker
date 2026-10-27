import app from './app';
import { config } from './config/env';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { User } from './models/User';
import { seedUsers, seedFoods, seedExercises, seedAchievements } from './scripts/seed';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Auto-seed if database is real and empty
    if (process.env.MOCK_DATABASE === 'false') {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Database is empty. Running auto-seed script...');
        await seedUsers();
        await seedFoods();
        await seedExercises();
        await seedAchievements();
        logger.info('Auto-seed completed!');
      }
    }

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`📍 API: http://localhost:${config.port}/api`);
      logger.info(`💊 Health: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
