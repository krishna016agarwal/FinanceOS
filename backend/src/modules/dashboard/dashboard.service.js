const FinancialRecord = require('../records/record.model');

const fromPaise = (val) => (val || 0) / 100;

const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);

  const income = result.find((r) => r._id === 'INCOME') || { total: 0, count: 0, avgAmount: 0 };
  const expense = result.find((r) => r._id === 'EXPENSE') || { total: 0, count: 0, avgAmount: 0 };

  return {
    income: {
      total: fromPaise(income.total),
      count: income.count,
      average: fromPaise(income.avgAmount),
    },
    expense: {
      total: fromPaise(expense.total),
      count: expense.count,
      average: fromPaise(expense.avgAmount),
    },
    netBalance: fromPaise(income.total - expense.total),
    totalTransactions: income.count + expense.count,
  };
};

const getByCategory = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
        categoryTotal: { $sum: '$total' },
      },
    },
    { $sort: { categoryTotal: -1 } },
  ]);

  return result.map((cat) => ({
    category: cat._id,
    total: fromPaise(cat.categoryTotal),
    breakdown: cat.breakdown.map((b) => ({
      type: b.type,
      total: fromPaise(b.total),
      count: b.count,
    })),
  }));
};

const getTrends = async (period = 'monthly') => {
  const groupFormat = period === 'weekly'
    ? { year: { $year: '$date' }, week: { $week: '$date' } }
    : { year: { $year: '$date' }, month: { $month: '$date' } };

  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { ...groupFormat, type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    {
      $group: {
        _id: period === 'weekly'
          ? { year: '$_id.year', week: '$_id.week' }
          : { year: '$_id.year', month: '$_id.month' },
        entries: {
          $push: { type: '$_id.type', total: '$total', count: '$count' },
        },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  return result.map((item) => {
    const income = item.entries.find((e) => e.type === 'INCOME') || { total: 0, count: 0 };
    const expense = item.entries.find((e) => e.type === 'EXPENSE') || { total: 0, count: 0 };
    return {
      period: item._id,
      income: fromPaise(income.total),
      expense: fromPaise(expense.total),
      net: fromPaise(income.total - expense.total),
      transactionCount: income.count + expense.count,
    };
  });
};

const getRecentActivity = async (limit = 10) => {
  const records = await FinancialRecord.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  return records;
};

module.exports = { getSummary, getByCategory, getTrends, getRecentActivity };