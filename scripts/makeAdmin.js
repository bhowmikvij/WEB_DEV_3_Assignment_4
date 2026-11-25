// Usage: npm run make-admin -- someone@example.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { role: 'admin' }, { new: true });
  console.log(user ? `${user.username} is now an admin` : 'User not found');
  await mongoose.disconnect();
})();
