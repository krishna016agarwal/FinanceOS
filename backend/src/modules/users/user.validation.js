const { z } = require('zod');

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN'], {
      required_error: 'Role is required',
    }),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE'], {
      required_error: 'Status is required',
    }),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
});

const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().trim().optional(),
  }),
});

module.exports = { updateRoleSchema, updateStatusSchema, getUsersSchema };