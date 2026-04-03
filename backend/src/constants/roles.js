const ROLES = Object.freeze({
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
});

const RECORD_TYPES = Object.freeze({
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
});

const STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
});

module.exports = { ROLES, RECORD_TYPES, STATUS };