const { z } = require('zod');

const createRecordSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be positive')
      .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      required_error: 'Type is required',
      invalid_type_error: 'Type must be INCOME or EXPENSE',
    }),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(1, 'Category cannot be empty')
      .max(50, 'Category too long'),
    date: z.coerce.date({ required_error: 'Date is required', invalid_type_error: 'Invalid date format' }),
    notes: z.string().trim().max(500, 'Notes too long').optional().default(''),
  }),
});

const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().multipleOf(0.01).optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record ID'),
  }),
});

const getRecordsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    // FIX: empty string should be treated as "not provided"
    type: z.enum(['INCOME', 'EXPENSE']).optional().or(z.literal('')).transform(v => v || undefined),
    
    category: z.string().trim().optional().transform(v => v || undefined),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),

    // FIX: accept -date, -amount etc and strip the minus sign
    sortBy: z.string()
      .optional()
      .default('date')
      .transform((v) => v.replace(/^-/, '')),  // strip leading dash

    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

module.exports = { createRecordSchema, updateRecordSchema, getRecordsSchema };