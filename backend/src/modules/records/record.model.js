const mongoose = require('mongoose');
const { RECORD_TYPES } = require('../../constants/roles');

const recordSchema = new mongoose.Schema(
  {
    // Store amount in smallest unit (paise) to avoid float precision issues
    // e.g. ₹1250.75 is stored as 125075
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer (store in paise/cents)',
      },
    },
    type: {
      type: String,
      enum: {
        values: Object.values(RECORD_TYPES),
        message: 'Type must be INCOME or EXPENSE',
      },
      required: [true, 'Record type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      // This is when the transaction HAPPENED, not when it was created
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // hidden from normal queries — must opt-in
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        // Convert paise back to rupees for the client
        ret.amount = ret.amount / 100;
        return ret;
      },
    },
  }
);

// Compound indexes for dashboard aggregation performance
recordSchema.index({ createdBy: 1, isDeleted: 1 });
recordSchema.index({ type: 1, isDeleted: 1 });
recordSchema.index({ category: 1, isDeleted: 1 });
recordSchema.index({ date: -1, isDeleted: 1 });
recordSchema.index({ type: 1, date: -1 }); // for trend queries

// Always exclude soft-deleted records unless explicitly queried
// FIXED
recordSchema.pre(/^find/, function () {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: false });
  }
});

const FinancialRecord = mongoose.model('FinancialRecord', recordSchema);
module.exports = FinancialRecord;