const { seedDatabase } = require('./src/seeds/seed');

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  });
