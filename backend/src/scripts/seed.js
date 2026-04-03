require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../modules/users/user.model');
const FinancialRecord = require('../modules/records/record.model');

const CATEGORIES = ['salary', 'rent', 'food', 'utilities', 'transport', 'healthcare', 'entertainment', 'freelance'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('Password@123', 12);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' },
    { name: 'Analyst User', email: 'analyst@example.com', password: hashedPassword, role: 'ANALYST', status: 'ACTIVE' },
    { name: 'Viewer User', email: 'viewer@example.com', password: hashedPassword, role: 'VIEWER', status: 'ACTIVE' },
  ]);

  const admin = users[0];
  const records = [];

  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.4 ? 'INCOME' : 'EXPENSE';
    const amount = type === 'INCOME'
      ? randomInt(5000, 150000) * 100  // in paise
      : randomInt(1000, 50000) * 100;

    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 365));

    records.push({
      amount,
      type,
      category: randomFrom(type === 'INCOME' ? ['salary', 'freelance'] : CATEGORIES),
      date,
      notes: `Seeded record ${i + 1}`,
      createdBy: admin._id,
      isDeleted: false,
    });
  }

  await FinancialRecord.insertMany(records);

  console.log('Seeded:');
  console.log('  3 users (admin, analyst, viewer) — password: Password@123');
  console.log('  50 financial records');
  console.log('\nTest credentials:');
  console.log('  Admin:   admin@example.com / Password@123');
  console.log('  Analyst: analyst@example.com / Password@123');
  console.log('  Viewer:  viewer@example.com / Password@123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});