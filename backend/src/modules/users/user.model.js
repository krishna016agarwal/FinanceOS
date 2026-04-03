const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, STATUS } = require('../../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Role must be VIEWER, ANALYST, or ADMIN',
      },
      default: ROLES.VIEWER,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(STATUS),
        message: 'Status must be ACTIVE or INACTIVE',
      },
      default: STATUS.ACTIVE,
    },
    refreshToken: {
      type: String,
      select: false, // sensitive — never exposed
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for faster queries (email already indexed via unique constraint)
userSchema.index({ role: 1, status: 1 });

// Hash password before save
// FIXED — async hooks in Mongoose do not take next as a parameter
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = Date.now();
});

// Instance method — compare passwords at login
userSchema.methods.comparePassword = async function (candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

// Instance method — check if token was issued before password change
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;