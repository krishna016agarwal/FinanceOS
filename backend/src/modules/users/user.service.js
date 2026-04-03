const User = require('./user.model');
const AppError = require('../../utils/AppError');

const getAllUsers = async ({ page, limit, role, status, search }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateRole = async (targetId, role, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }
  const user = await User.findByIdAndUpdate(targetId, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateStatus = async (targetId, status, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }
  const user = await User.findByIdAndUpdate(targetId, { status }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

module.exports = { getAllUsers, getUserById, updateRole, updateStatus };