const User     = require('./user.model');
const AppError = require('../../utils/AppError');

// Helper — fetch the requester to check their actual role
const getRequester = async (requesterId) => {
  const requester = await User.findById(requesterId);
  if (!requester) throw new AppError('Requester not found', 401);
  return requester;
};

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
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  const [totalActive, totalSuperAdmin, totalAdmin, totalAnalyst, totalViewer] =
    await Promise.all([
      User.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'SUPER_ADMIN' }),
      User.countDocuments({ role: 'ADMIN' }),
      User.countDocuments({ role: 'ANALYST' }),
      User.countDocuments({ role: 'VIEWER' }),
    ]);

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      totalUsers: total,
      totalActive,
      totalSuperAdmin,
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

const updateRole = async (targetId, newRole, requesterId) => {
  // Cannot change own role
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  const [requester, target] = await Promise.all([
    getRequester(requesterId),
    User.findById(targetId),
  ]);

  if (!target) throw new AppError('User not found', 404);

  // Nobody can touch SUPER_ADMIN role
  if (target.role === 'SUPER_ADMIN') {
    throw new AppError('Super admin role cannot be changed by anyone', 403);
  }

  // Nobody can assign SUPER_ADMIN role through API
  if (newRole === 'SUPER_ADMIN') {
    throw new AppError('Super admin role cannot be assigned through the API', 403);
  }

  // ADMIN cannot change another ADMIN's role — only SUPER_ADMIN can
  if (target.role === 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    throw new AppError(
      'Only super admin can change another admin\'s role', 403
    );
  }

  // ADMIN can only assign VIEWER or ANALYST — not ADMIN
  if (requester.role === 'ADMIN' && newRole === 'ADMIN') {
    throw new AppError(
      'Admins cannot promote users to admin. Only super admin can.', 403
    );
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { role: newRole },
    { new: true, runValidators: true }
  );
  return user;
};

const updateStatus = async (targetId, status, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot change your own status', 400);
  }

  const [requester, target] = await Promise.all([
    getRequester(requesterId),
    User.findById(targetId),
  ]);

  if (!target) throw new AppError('User not found', 404);

  // Cannot deactivate SUPER_ADMIN
  if (target.role === 'SUPER_ADMIN') {
    throw new AppError('Super admin account cannot be deactivated', 403);
  }

  // ADMIN cannot deactivate another ADMIN
  if (target.role === 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    throw new AppError(
      'Only super admin can deactivate an admin account', 403
    );
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { status },
    { new: true, runValidators: true }
  );
  return user;
};


const deleteUser = async (targetId, requesterId) => {
  if (targetId === requesterId.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const [requester, target] = await Promise.all([
    getRequester(requesterId),
    User.findById(targetId),
  ]);

  if (!target) throw new AppError('User not found', 404);

  // SUPER_ADMIN can never be deleted
  if (target.role === 'SUPER_ADMIN') {
    throw new AppError('Super admin account cannot be deleted', 403);
  }

  // ADMIN cannot delete another ADMIN — only SUPER_ADMIN can
  if (target.role === 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
    throw new AppError(
      'Only super admin can delete an admin account', 403
    );
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