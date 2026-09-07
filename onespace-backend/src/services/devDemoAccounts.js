const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { hashPassword } = require('../utils/hashPassword');

const PRIMARY_ACCOUNT = {
  name: 'Om',
  email: 'om@gmail.com',
  password: '654321',
  bio: 'Software Engineer · Bengaluru · Building a steady, well-balanced life',
  role: 'user'
};

/** Creates or refreshes the single local workspace profile in development. */
const ensureDevDemoAccounts = async () => {
  const passwordHash = await hashPassword(PRIMARY_ACCOUNT.password);
  const user = await User.findOneAndUpdate(
    { email: PRIMARY_ACCOUNT.email },
    {
      $set: {
        name: PRIMARY_ACCOUNT.name,
        passwordHash,
        bio: PRIMARY_ACCOUNT.bio,
        role: PRIMARY_ACCOUNT.role
      },
      $setOnInsert: { email: PRIMARY_ACCOUNT.email }
    },
    { new: true, upsert: true, runValidators: true }
  );

  await UserSettings.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { user: user._id, userId: user._id } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  // Remove the retired demo profile and its future reappearance on restart.
  await User.deleteMany({ email: 'demo@onespace.app' });
  console.log('[Auth] Primary workspace profile is ready: om@gmail.com');
};

module.exports = { ensureDevDemoAccounts };
