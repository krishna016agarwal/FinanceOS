# Finance Dashboard 

A production-grade RESTful backend for a multi-role financial data management system. Built with Node.js, Express, and MongoDB. Supports role-based access control, financial record management, and real-time dashboard analytics via aggregation pipelines.

---

## Table of Contents

- [What We Built](#what-we-built)
- [Tech Stack](#tech-stack)
- [Why MongoDB over SQL](#why-mongodb-over-sql)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Data Models](#data-models)
- [How Data Flows](#how-data-flows)
- [API Reference](#api-reference)
- [Role Permissions](#role-permissions)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Error Handling](#error-handling)


---

## What We Built

A backend API that powers a finance dashboard where users with different roles interact with financial records based on their access level.

**Core capabilities:**

- User registration and login with JWT access + refresh token strategy
- Role-based access control — `VIEWER`, `ANALYST`, `ADMIN` with enforced permissions at the middleware level
- Full CRUD for financial records with soft delete, filtering, sorting, and pagination
- Dashboard summary APIs powered by MongoDB aggregation pipelines — totals, category breakdowns, monthly/weekly trends, recent activity
- Input validation on every route using Zod schemas
- Consistent error responses with correct HTTP status codes throughout
- Rate limiting on authentication routes to prevent brute force
- Seeder script so any evaluator can test the API immediately without manual setup

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js | Non-blocking I/O, ideal for API servers |
| Framework | Express.js | Minimal, unopinionated, industry standard |
| Database | MongoDB Atlas | Document store, free cloud hosting, no local install needed |
| ODM | Mongoose | Schema validation, middleware hooks, query builder |
| Authentication | JSON Web Tokens (JWT) | Stateless, scalable, standard for REST APIs |
| Password Hashing | bcryptjs | Industry standard, slow by design to resist brute force |
| Validation | Zod | Schema-first validation with TypeScript-style inference in JS |
| Security | Helmet, CORS, express-rate-limit | HTTP header hardening, origin control, rate limiting |
| Logging | Morgan | Request logging in development |
| Environment | dotenv | Config from `.env` file, never hardcoded |

---

## Why MongoDB over SQL

This was a deliberate, documented decision.

### The honest case for SQL

Financial data is the textbook use case for relational databases. The data has a fixed, predictable shape — every transaction has an amount, type, date, and category. Aggregations like `SUM`, `GROUP BY`, and `JOIN` are SQL's native strength. Every real-world finance system (banking, ERP, accounting) runs on PostgreSQL or MySQL for exactly these reasons. SQL also offers `DECIMAL` type for exact monetary precision, and ACID transactions out of the box without any extra configuration.

### Why MongoDB was chosen for this project

| Factor | Reasoning |
|---|---|
| Evaluator experience | MongoDB Atlas provides a free connection string — zero local installation needed. PostgreSQL requires a local install or Docker setup before the evaluator can even run the project. |
| Stack fit | This project uses the MERN stack (MongoDB, Express, React, Node). MongoDB is the intended database for this stack. |
| Data simplicity | The data model is two collections with one relationship. MongoDB's limitations (no native JOINs, no DECIMAL type) only matter at scale or with complex relational data. |
| Aggregation pipeline | MongoDB's `$group`, `$match`, and `$sum` operators are powerful enough for all dashboard queries in this project. |

---

## Architecture Overview

The backend is organized into four strict layers. Each request passes through all four layers in sequence. No layer skips another.

```
             HTTP Request
                  │
                  ▼
┌─────────────────────────────────────────┐
│              Routes layer               │
│  auth · users · records · dashboard     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            Middleware layer             │
│  authenticate → authorize → validate    │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           Controllers layer             │
│  Parse req · call service · shape res   │
│  (zero business logic here)             │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│             Services layer              │
│  All business logic lives here          │
│  AuthService · UserService ·            │
│  RecordService · DashboardService       │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Mongoose ODM + MongoDB          │
│  users · financial_records              │
└─────────────────────────────────────────┘
```

**Why this layering matters:**

- **Routes** only know about paths and which middleware/controller to attach. No logic.
- **Middleware** handles cross-cutting concerns — auth, permissions, validation. Reusable, composable.
- **Controllers** are thin. They extract data from `req`, call a service method, and call `sendResponse`. If a controller is more than 10 lines, business logic has leaked in.
- **Services** are where decisions happen — checking if a user already exists, enforcing business rules, building aggregation pipelines. Testable in isolation without HTTP.

---

## Folder Structure

```
finance-dashboard-api/
├── src/
│   ├── config/
│   │   └── db.js                   # Mongoose connect with reconnect handling
│   ├── constants/
│   │   └── roles.js                # Frozen enums: ROLES, RECORD_TYPES, STATUS
│   ├── middlewares/
│   │   ├── authenticate.js         # JWT verify → attach req.user
│   │   ├── authorize.js            # Role guard: authorize('ADMIN', 'ANALYST')
│   │   ├── validate.js             # Zod schema middleware
│   │   └── errorHandler.js         # Global error formatter
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js      # POST /register /login /refresh /logout
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js     # register, login, refresh token, logout
│   │   │   └── auth.validation.js  # Zod schemas for auth inputs
│   │   ├── users/
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js     # getAllUsers, updateRole, updateStatus
│   │   │   ├── user.model.js       # Mongoose schema with bcrypt hooks
│   │   │   └── user.validation.js
│   │   ├── records/
│   │   │   ├── record.routes.js
│   │   │   ├── record.controller.js
│   │   │   ├── record.service.js   # CRUD + filters + soft delete
│   │   │   ├── record.model.js     # Compound indexes, soft delete pre-hook
│   │   │   └── record.validation.js
│   │   └── dashboard/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       └── dashboard.service.js  # MongoDB aggregation pipelines
│   ├── utils/
│   │   ├── AppError.js             # Custom error class with statusCode
│   │   ├── sendResponse.js         # Consistent response envelope
│   │   ├── asyncHandler.js         # Wraps async controllers, no try/catch needed
│   │   └── generateTokens.js       # Access + refresh token generation
│   ├── scripts/
│   │   └── seed.js                 # npm run seed — 3 users + 150 records
│   └── app.js                      # Express setup, route mounting, error handler
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## Data Models

### User

```
users collection
├── _id          ObjectId      Primary key
├── name         String        Required, 2–50 chars
├── email        String        Required, unique, indexed, lowercase
├── password     String        bcrypt hash (salt rounds: 12), never returned
├── role         Enum          VIEWER | ANALYST | ADMIN | SUPER_ADMIN (default: VIEWER)
├── status       Enum          ACTIVE | INACTIVE  (default: ACTIVE)
├── refreshToken String        Stored server-side for rotation validation, hidden
├── lastLoginAt  Date          Updated on every successful login
├── passwordChangedAt Date     Used to invalidate old tokens after password change
├── createdAt    Date          Auto (timestamps: true)
└── updatedAt    Date          Auto (timestamps: true)
```

**Indexes:** `email` (unique), compound `(role, status)` for admin user list queries.

### FinancialRecord

```
financialrecords collection
├── _id          ObjectId      Primary key
├── amount       Number        Integer in paise (₹1 = 100). e.g. ₹500 stored as 50000
├── type         Enum          INCOME | EXPENSE
├── category     String        Required, lowercase, e.g. "salary", "rent", "food"
├── date         Date          Transaction date (when it happened, not createdAt)
├── notes        String        Optional description, max 500 chars
├── createdBy    ObjectId      ref: User — accountability trail
├── isDeleted    Boolean       Soft delete flag (default: false, hidden from queries)
├── deletedAt    Date          Timestamp of soft delete
├── deletedBy    ObjectId      ref: User — who deleted it
├── createdAt    Date          Auto
└── updatedAt    Date          Auto
```

**Indexes:**
- `(createdBy, isDeleted)` — user-scoped record queries
- `(type, isDeleted)` — income/expense filters
- `(category, isDeleted)` — category breakdown
- `(date, isDeleted)` — date range queries, most used
- `(type, date)` — trend aggregations

**Soft delete pre-hook:** A Mongoose `pre(/^find/)` hook automatically appends `{ isDeleted: false }` to every find query. Deleted records are invisible without any extra code in controllers or services.

---

## How Data Flows

### Request lifecycle — every API call

```
1. Client sends:  POST /api/v1/records
                  Authorization: Bearer <accessToken>
                  Body: { amount, type, category, date }

2. authenticate   Decode JWT → verify signature → check expiry
   middleware     Fetch user from DB → confirm ACTIVE status
                  Attach user to req.user
                  ✗ Fail → 401 Unauthorized (invalid/expired token)

3. authorize      Check req.user.role is in allowed roles ['ADMIN']
   middleware     ✗ Fail → 403 Forbidden (wrong role)

4. validate       Run Zod schema against req.body
   middleware     ✗ Fail → 422 Unprocessable (field-level errors)

5. Controller     Extract req.body + req.user
                  Call RecordService.createRecord(data, userId)
                  Call sendResponse(res, { ... })

6. Service        Convert amount to paise
                  Call FinancialRecord.create({ ...data, createdBy: userId })
                  Populate createdBy field
                  Return document

7. Response       {
                    "success": true,
                    "message": "Record created",
                    "data": { "record": { ... } }
                  }
```

### Dashboard data flow — aggregation pipeline

```
Client → GET /api/v1/dashboard/summary

DashboardService.getSummary()
  │
  └─ MongoDB aggregation pipeline:
       $match  { isDeleted: false }          ← filter deleted records
       $group  { _id: '$type',               ← group by INCOME / EXPENSE
                 total: { $sum: '$amount' },
                 count: { $sum: 1 },
                 avg:   { $avg: '$amount' } }
  │
  └─ Transform: divide totals by 100 (paise → rupees)
  │
  └─ Return: { income, expense, netBalance, totalTransactions }
```

**Key principle:** Dashboard queries never fetch all records into memory and loop over them in JavaScript. All aggregation happens inside MongoDB. This keeps response times fast regardless of how many records exist.

### Token refresh flow

```
Client has:  accessToken (15 min TTL)
             refreshToken (7 day TTL)

When accessToken expires:
  Client → POST /api/v1/auth/refresh-token  { refreshToken }
  Server → verify refreshToken signature
         → fetch user from DB
         → compare stored refreshToken (rotation check)
         → issue new accessToken
         → return { accessToken }

If refreshToken is reused (rotation attack):
  Server → 401 "Refresh token reuse detected"
  (User must log in again)
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | None | `name, email, password` | Create account, returns token pair |
| POST | `/auth/login` | None | `email, password` | Login, returns token pair |
| POST | `/auth/refresh-token` | None | `refreshToken` | Get new access token |
| POST | `/auth/logout` | Any | — | Invalidate refresh token |
| GET | `/auth/me` | Any | — | Get own profile |

### Users

| Method | Endpoint | Auth | Query/Body | Description |
|--------|----------|------|------------|-------------|
| GET | `/users` | ADMIN, SUPER_ADMIN | `?page&limit&role&status&search` | List all users with pagination |
| GET | `/users/:id` | ADMIN, SUPER_ADMIN | — | Get single user |
| PATCH | `/users/:id/role` | ADMIN, SUPER_ADMIN | `{ role }` | Change user role |
| PATCH | `/users/:id/status` | ADMIN, SUPER_ADMIN | `{ status }` | Activate or deactivate user |

### Records

| Method | Endpoint | Auth | Query/Body | Description |
|--------|----------|------|------------|-------------|
| POST | `/records` | ADMIN, SUPER_ADMIN | `amount, type, category, date, notes?` | Create record |
| GET | `/records` | ADMIN, SUPER_ADMIN, ANALYST | `?page&limit&type&category&from&to&sortBy&order` | List records with filters |
| GET | `/records/:id` | ADMIN, SUPER_ADMIN, ANALYST | — | Get single record |
| PATCH | `/records/:id` | ADMIN, SUPER_ADMIN | any record fields | Update record |
| DELETE | `/records/:id` | ADMIN, SUPER_ADMIN | — | Soft delete record |

**GET /records query parameters:**

| Param | Type | Example | Default |
|-------|------|---------|---------|
| `page` | number | `?page=2` | 1 |
| `limit` | number | `?limit=20` | 20 |
| `type` | string | `?type=INCOME` | — |
| `category` | string | `?category=salary` | — |
| `from` | date | `?from=2024-01-01` | — |
| `to` | date | `?to=2024-12-31` | — |
| `sortBy` | string | `?sortBy=amount` | date |
| `order` | string | `?order=asc` | desc |

### Dashboard

| Method | Endpoint | Auth | Query | Description |
|--------|----------|------|-------|-------------|
| GET | `/dashboard/summary` | ADMIN, ANALYST, SUPER_ADMIN | — | Total income, expense, net balance |
| GET | `/dashboard/by-category` | ADMIN, ANALYST, SUPER_ADMIN | — | Totals grouped by category |
| GET | `/dashboard/trends` | ADMIN, ANALYST, SUPER_ADMIN | `?period=monthly\|weekly` | Monthly or weekly breakdown (last 12 periods) |
| GET | `/dashboard/recent` | ADMIN, ANALYST, SUPER_ADMIN | `?limit=10` | Most recent transactions |

### Sample responses

**Successful response:**
```json
{
  "success": true,
  "message": "Records fetched",
  "data": {
    "records": [ ... ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

**Error response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be positive" },
    { "field": "date", "message": "Invalid date format" }
  ]
}
```

---

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN | SUPER_ADMIN |
|--------|--------|---------|-------|-------------|
| Register / Login | ✓ | ✓ | ✓ | ✓ | 
| View records | ✗ | ✓ | ✓ | ✓ | 
| Create records | ✗ | ✗ | ✓ | ✓ | 
| Update records | ✗ | ✗ | ✓ | ✓ | 
| Delete records | ✗ | ✗ | ✓ | ✓ | 
| View dashboard | ✓ | ✓ | ✓ | ✓ | 
| List all users | ✗ | ✗ | ✓ | ✓ |  
| Change user role except Admin | ✗ | ✗ | ✓ | ✓ | 
| Change user role to Admin | ✗ | ✗ | ✗ | ✓ | 
| Delete Admin Profiles | ✗ | ✗ | ✗ | ✓ | 
| Activate/deactivate user | ✗ | ✗ | ✓ | ✓ | 

**Implementation note:** Permissions are enforced at the middleware level, not inside controllers. The `authorize('ADMIN', 'ANALYST','SUPER_ADMIN')` middleware rejects any request with the wrong role before the controller function is ever called.

```js
// Example — how routes express permissions declaratively
router.post('/',    authenticate, authorize('ADMIN','SUPER_ADMIN'),            createRecord);
router.get('/',     authenticate, authorize('ADMIN', 'ANALYST','SUPER_ADMIN'), getRecords);
router.delete('/:id', authenticate, authorize('ADMIN','SUPER_ADMIN'),          deleteRecord);
```



---

## Local Setup

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (free tier is sufficient) OR a local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/your-username/finance-dashboard-api.git
cd finance-dashboard-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values. See [Environment Variables](#environment-variables) for details. The only required value to change is `MONGODB_URI`.

### 4. Seed the database

```bash
npm run seed
```

This creates three users and 150 sample financial records. Credentials are printed to the console.

### 5. Start the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000`.

### 6. Verify it works

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "environment": "development"
}
```

### 7. Test login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@finance.com", "password": "Password@123" }'
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default 5000) | `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/finance_db` |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens (min 32 chars) | `your-secret-key-here` |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) | `another-secret-key` |
| `JWT_ACCESS_EXPIRES` | No | Access token TTL (default 15m) | `15m` |
| `JWT_REFRESH_EXPIRES` | No | Refresh token TTL (default 7d) | `7d` |
| `NODE_ENV` | No | Environment flag | `development` |
| `FRONTEND_URL` | No | Allowed CORS origin in production | `https://your-app.com` |
| `SUPER_ADMIN_PASSWORD` | YES | Password for SUPER_ADMIN Profile | `wkkwdhcihiuc` |



---

## Seeding the Database

```bash
npm run seed
```

The seed script drops existing data and creates:

**Users:**

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@finance.com | Password@123 | ADMIN |
| Analyst User | analyst@finance.com | Password@123 | ANALYST |
| Viewer User | viewer@finance.com | Password@123 | VIEWER |

**Records:** 50 financial records with varied types, categories, amounts, and dates spread across the last 12 months.

---

## Error Handling

All errors return a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable description",
  "errors": []
}
```

For validation errors, `errors` is populated with field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be positive" },
    { "field": "type", "message": "Type must be INCOME or EXPENSE" }
  ]
}
```

### HTTP status codes used

| Code | Meaning | When used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE, POST (non-creation) |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Invalid operation (e.g. admin trying to change own role) |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | Valid token but insufficient role |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate email on register |
| 422 | Unprocessable | Validation failed (Zod schema errors) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unhandled exception (details hidden from client) |

---



*Built as part of a backend engineering project. The goal was to demonstrate API design, data modeling, access control, and backend architecture *
