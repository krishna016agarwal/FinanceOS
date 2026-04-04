const { z } = require("zod");

const createRecordSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive")
      .multipleOf(0.01, "Amount can have at most 2 decimal places"),

    type: z.enum(["INCOME", "EXPENSE"], {
      required_error: "Type is required",
      invalid_type_error: "Type must be INCOME or EXPENSE",
    }),

    category: z
      .string({ required_error: "Category is required" })
      .trim()
      .min(1, "Category cannot be empty")
      .max(50, "Category too long")
      // Must contain at least one letter — blocks pure numbers like "123423"
      .regex(
        /^[a-zA-Z\s\-&]+$/,
        "Category must contain only letters, spaces, or hyphens",
      )
      .transform((v) => v.toLowerCase()), // normalize to lowercase before saving

    date: z.coerce
      .date({
        required_error: "Date is required",
        invalid_type_error: "Invalid date format",
      })
      // Block only VERY far future — more than 1 year ahead
      // This catches typos (year 2099) but allows legitimate post-dated entries
      .refine(
        (date) => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        { message: "Date cannot be more than 1 year in the future" },
      )
      // Block very old dates — catches typos like year 1990
      .refine((date) => date >= new Date("2000-01-01"), {
        message: "Date cannot be before year 2000",
      }),

    notes: z.string().trim().max(500, "Notes too long").optional().default(""),

    // Optional flag — frontend can send this to acknowledge future date
    isFutureAcknowledged: z.boolean().optional().default(false),
  }),
});

const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().multipleOf(0.01).optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(
        /^[a-zA-Z\s\-&]+$/,
        "Category must contain only letters, spaces, or hyphens",
      )
      .transform((v) => v.toLowerCase())
      .optional(),

    date: z.coerce
      .date()
      .refine(
        (date) => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        { message: "Date cannot be more than 1 year in the future" },
      )
      .refine((date) => date >= new Date("2000-01-01"), {
        message: "Date cannot be before year 2000",
      })
      .optional(),

    notes: z.string().trim().max(500).optional(),
    isFutureAcknowledged: z.boolean().optional(),
  }),

  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid record ID"),
  }),
});

const getRecordsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    type: z
      .enum(["INCOME", "EXPENSE"])
      .optional()
      .or(z.literal(""))
      .transform((v) => v || undefined),

    category: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),

    sortBy: z
      .string()
      .optional()
      .default("date")
      .transform((v) => v.replace(/^-/, "")),

    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

module.exports = { createRecordSchema, updateRecordSchema, getRecordsSchema };
