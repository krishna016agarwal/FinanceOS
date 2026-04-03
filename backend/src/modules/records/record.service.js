const FinancialRecord = require('./record.model');
const AppError = require('../../utils/AppError');

// Convert rupees to paise before saving
const toPaise = (amount) => Math.round(amount * 100);

const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({
    ...data,
    amount: toPaise(data.amount),
    createdBy: userId,
  });
  return FinancialRecord.findById(record._id).populate('createdBy', 'name email');
};

const getRecords = async ({ page, limit, type, category, from, to, sortBy, order }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) throw new AppError('Record not found', 404);
  return record;
};

const updateRecord = async (id, data) => {
  if (data.amount) data.amount = toPaise(data.amount);

  const record = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email');

  if (!record) throw new AppError('Record not found', 404);
  return record;
};

const deleteRecord = async (id, userId) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
    { new: true }
  );
  if (!record) throw new AppError('Record not found', 404);
  return record;
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };