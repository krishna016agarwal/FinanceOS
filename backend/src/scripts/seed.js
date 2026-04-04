require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User             = require('../modules/users/user.model');
const FinancialRecord  = require('../modules/records/record.model');

const randomInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const INCOME_CATEGORIES  = ['salary', 'freelance', 'investment', 'bonus', 'rental-income'];
const EXPENSE_CATEGORIES = ['rent', 'food', 'utilities', 'transport', 'healthcare',
                            'entertainment', 'shopping', 'education', 'insurance'];
const SUPER_ADMIN_USER = {
  name:  'Super Admin',
  email: 'superadmin@finance.com',
};
const ADMIN_USERS = [
  { name: 'Arjun Sharma',    email: 'arjun.sharma@finance.com'    },
  { name: 'Priya Mehta',     email: 'priya.mehta@finance.com'     },
  { name: 'Rohan Verma',     email: 'rohan.verma@finance.com'     },
  { name: 'Sneha Kapoor',    email: 'sneha.kapoor@finance.com'    },
  { name: 'Vikram Nair',     email: 'vikram.nair@finance.com'     },
  { name: 'Anjali Singh',    email: 'anjali.singh@finance.com'    },
  { name: 'Rahul Gupta',     email: 'rahul.gupta@finance.com'     },
];

const ANALYST_USERS = [
  { name: 'Amit Patel',      email: 'amit.patel@finance.com'      },
  { name: 'Kavya Reddy',     email: 'kavya.reddy@finance.com'     },
  { name: 'Suresh Kumar',    email: 'suresh.kumar@finance.com'    },
  { name: 'Neha Joshi',      email: 'neha.joshi@finance.com'      },
  { name: 'Karan Malhotra',  email: 'karan.malhotra@finance.com'  },
  { name: 'Divya Iyer',      email: 'divya.iyer@finance.com'      },
  { name: 'Manish Tiwari',   email: 'manish.tiwari@finance.com'   },
  { name: 'Pooja Desai',     email: 'pooja.desai@finance.com'     },
  { name: 'Arun Pillai',     email: 'arun.pillai@finance.com'     },
  { name: 'Simran Kaur',     email: 'simran.kaur@finance.com'     },
  { name: 'Deepak Rao',      email: 'deepak.rao@finance.com'      },
];

const VIEWER_USERS = [
  { name: 'Ravi Shankar',    email: 'ravi.shankar@finance.com'    },
  { name: 'Meena Choudhary', email: 'meena.choudhary@finance.com' },
  { name: 'Tarun Bajaj',     email: 'tarun.bajaj@finance.com'     },
  { name: 'Anita Mishra',    email: 'anita.mishra@finance.com'    },
  { name: 'Nikhil Pandey',   email: 'nikhil.pandey@finance.com'   },
];

const NOTES = [
  'Monthly payment processed',
  'Quarterly settlement',
  'Regular expense',
  'One-time payment',
  'Recurring transaction',
  'Budget allocation',
  'Emergency expense',
  'Planned investment',
  'Vendor payment',
  'Client payment received',
  'Annual subscription',
  'Project reimbursement',
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
  console.log('Cleared existing data');

  // Hash once — reuse for all users
  const hashedPassword = await bcrypt.hash('Password@123', 12);

  // Build all user documents
  const superAdminDoc = {
  ...SUPER_ADMIN_USER,
  password:    await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12),
  role:        'SUPER_ADMIN',
  status:      'ACTIVE',
  lastLoginAt: new Date(),
};
  const adminDocs = ADMIN_USERS.map((u) => ({
    ...u,
    password: hashedPassword,
    role:     'ADMIN',
    status:   'ACTIVE',
    lastLoginAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
  }));

  const analystDocs = ANALYST_USERS.map((u, i) => ({
    ...u,
    password: hashedPassword,
    role:     'ANALYST',
    // Make one analyst inactive to show that feature works
    status:   i === ANALYST_USERS.length - 1 ? 'INACTIVE' : 'ACTIVE',
    lastLoginAt: new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000),
  }));

  const viewerDocs = VIEWER_USERS.map((u, i) => ({
    ...u,
    password: hashedPassword,
    role:     'VIEWER',
    // Make one viewer inactive
    status:   i === VIEWER_USERS.length - 1 ? 'INACTIVE' : 'ACTIVE',
    lastLoginAt: i === 0 ? new Date() : null, // one viewer has logged in, rest haven't
  }));

  const allUserDocs = [superAdminDoc,...adminDocs, ...analystDocs, ...viewerDocs];
  const users = await User.insertMany(allUserDocs);

  console.log(`Created ${users.length} users`);

  // Split inserted users back by role for record creation
  const admins   = users.filter((u) => u.role === 'ADMIN');
  const analysts = users.filter((u) => u.role === 'ANALYST');

  // Generate 150 records spread across admins and analysts as creators
  const creators = [...admins, ...analysts]; // only these roles create records
  const records  = [];

  for (let i = 0; i < 150; i++) {
    const type = Math.random() > 0.4 ? 'INCOME' : 'EXPENSE';

    // Vary amounts realistically
    const amount = type === 'INCOME'
      ? randomInt(5000, 200000) * 100   // ₹50 to ₹2000 in paise
      : randomInt(500,  80000)  * 100;  // ₹5 to ₹800 in paise

    // Spread dates across last 12 months
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 365));

    // Assign random creator from admins and analysts
    const creator = randomFrom(creators);

    records.push({
      amount,
      type,
      category: randomFrom(
        type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
      ),
      date,
      notes:     randomFrom(NOTES) + ` (record ${i + 1})`,
      createdBy: creator._id,
      isDeleted: false,
    });
  }

  // Make 5 records soft-deleted to show that feature works
  records.slice(0, 5).forEach((r) => {
    r.isDeleted  = true;
    r.deletedAt  = new Date();
    r.deletedBy  = admins[0]._id;
  });

  await FinancialRecord.insertMany(records);
  console.log(`Created 150 records (145 active, 5 soft-deleted)`);

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total users    : ${users.length}`);
  console.log(`  Admins         : ${admins.length}`);
  console.log(`  Analysts       : ${analysts.length} (1 inactive)`);
  console.log(`  Viewers        : ${users.filter(u => u.role === 'VIEWER').length} (1 inactive)`);
  console.log(`  Total records  : 150 (145 active, 5 soft-deleted)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  All users password: Password@123');
  console.log('\n  Quick test credentials:');
  console.log(`  Admin:   ${adminDocs[0].email} / Password@123`);
  console.log(`  Analyst: ${analystDocs[0].email} / Password@123`);
  console.log(`  Viewer:  ${viewerDocs[0].email} / Password@123`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});