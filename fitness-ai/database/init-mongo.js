db = db.getSiblingDB('fitness_tracker');

db.createUser({
  user: 'fitai_admin',
  pwd: 'fitai_secret_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'fitness_tracker',
    },
  ],
});

db.createCollection('users');
db.createCollection('foods');
db.createCollection('exercises');
db.createCollection('achievements');

// Create indices
db.users.createIndex({ email: 1 }, { unique: true });
db.foods.createIndex({ name: "text" });
db.exercises.createIndex({ name: "text", description: "text" });
