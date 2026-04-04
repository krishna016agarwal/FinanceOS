const User     = require('./user.model');
const AppError = require('../../utils/AppError');

const getAllUsers = async ({ page, limit, role, status, search }) => {
  const filter = {};
  if (role)   filter.role   = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  // Summary counts for the stats cards
  const [totalActive, totalAdmin, totalAnalyst, totalViewer] = await Promise.all([
    User.countDocuments({ status: 'ACTIVE' }),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ role: 'ANALYST' }),
    User.countDocuments({ role: 'VIEWER' }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalUsers:   total,
      totalActive,
      totalAdmin,
      totalAnalyst,
      totalViewer,
    },
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
  const user = await User.findByIdAndUpdate(
    targetId,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateStatus = async (targetId, status, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }
  const user = await User.findByIdAndUpdate(
    targetId,
    { status },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// Admin creates a user directly — no email verification needed
// const createUser = async ({ name, email, password, role }, requesterId) => {
//   const existing = await User.findOne({ email });
//   if (existing) throw new AppError('Email already registered', 409);

//   const user = await User.create({ name, email, password, role });
//   return user;
// };

// Soft approach — deactivate instead of delete
// Hard delete only if admin explicitly confirms
const deleteUser = async (targetId, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(targetId);
  if (!user) throw new AppError('User not found', 404);

  // Check if target is also an admin — prevent deleting other admins
  if (user.role === 'ADMIN') {
    throw new AppError('Cannot delete an admin account. Change their role first.', 403);
  }

  await User.findByIdAndDelete(targetId);
  return { message: 'User deleted successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateRole,
  updateStatus,
  
  deleteUser,
};