const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const DailyActivity = require('../models/DailyActivity');

async function seedExpenses() {
  await mongoose.connect(env.MONGODB_URI);
  const user = await User.findOne({ email: 'om@gmail.com' });
  if (!user) {
    console.log('User om@gmail.com not found');
    process.exit(1);
  }

  const sampleExpenses = [
    { description: 'Grocery & Fresh Produce', amount: 84.50, category: 'Food' },
    { description: 'Team Coffee & Lunch', amount: 26.00, category: 'Food' },
    { description: 'Metro & Train Pass', amount: 45.00, category: 'Transport' },
    { description: 'High-Speed Internet Bill', amount: 65.00, category: 'Bills' },
    { description: 'Electricity & Utilities', amount: 110.00, category: 'Bills' },
    { description: 'Gym & Fitness Membership', amount: 50.00, category: 'Health' },
    { description: 'Cloud Server & Domain Hosting', amount: 35.00, category: 'Bills' },
    { description: 'Technical Books on Architecture', amount: 48.00, category: 'Shopping' },
    { description: 'Weekend Cinema & Dinner', amount: 58.00, category: 'Entertainment' }
  ];

  const activities = await DailyActivity.find({
    $or: [{ user: user._id }, { userId: user._id }]
  });
  console.log('Found daily activities:', activities.length);

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    if (i % 2 === 0) {
      const exp1 = sampleExpenses[i % sampleExpenses.length];
      const exp2 = sampleExpenses[(i + 3) % sampleExpenses.length];
      act.expenses = [
        { description: exp1.description, amount: exp1.amount + (i % 15), category: exp1.category, date: act.date },
        { description: exp2.description, amount: exp2.amount + (i % 10), category: exp2.category, date: act.date }
      ];
      await act.save();
    }
  }

  console.log('Successfully seeded multi-month expenses for user om@gmail.com!');
  await mongoose.disconnect();
}

seedExpenses().catch(console.error);
