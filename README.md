# AI Chat and Subscription Management API

TypeScript-based REST API implementing Clean Architecture (DDD-style) for managing AI chat interactions and subscription bundles with PostgreSQL.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

## Features

### Module 1: AI Chat Module
- Accept user questions and return mocked OpenAI responses
- Store questions, answers, and token usage in database
- Track monthly usage per user
- **Free tier**: 3 free messages per month (auto-reset on 1st of each month)
- **Paid tiers**: Subscription-based quotas
  - Basic: 10 responses
  - Pro: 100 responses
  - Enterprise: Unlimited responses
- Smart quota management: deducts from bundle with latest remaining quota
- Simulated OpenAI API response delay (configurable)
- Structured error handling for quota exceeded scenarios

### Module 2: Subscription Bundle Module
- Create subscription bundles (Basic, Pro, Enterprise)
- Choose billing cycle (monthly or yearly)
- Toggle auto-renew functionality
- Each subscription includes:
  - maxMessages, price, startDate, endDate, renewalDate
- Simulated billing logic:
  - Auto-renew subscriptions if enabled
  - Random payment failure simulation (10% failure rate)
  - Mark subscription inactive on payment failure
- Subscription cancellation:
  - Ends current billing cycle
  - Prevents renewal
  - Preserves usage history

## Architecture

This project follows **Clean Architecture (Domain-Driven Design)** principles:

```
src/
├── domain/                    # Business logic & rules
│   ├── entities/             # Core business entities
│   ├── repositories/         # Repository interfaces
│   └── errors/               # Custom error classes
├── services/                 # Business logic services
├── infrastructure/           # External concerns
│   ├── database/            # Database connection
│   └── repositories/        # Repository implementations
├── controllers/             # HTTP request handlers
├── routes/                  # API route definitions
└── middleware/              # Express middleware
```

### Layer Responsibilities

1. **Domain Layer**: Core business entities and rules (User, ChatMessage, SubscriptionBundle)
2. **Service Layer**: Business logic orchestration (ChatService, SubscriptionService)
3. **Infrastructure Layer**: Database access and external services
4. **Controller Layer**: HTTP request/response handling
5. **Routes**: API endpoint definitions

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Validation**: Express-validator
- **Code Quality**: ESLint, Prettier
- **Architecture**: Clean Architecture (DDD-style)

## Project Structure

```
ai-chat-subscription-api/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── ChatMessage.ts
│   │   │   ├── SubscriptionBundle.ts
│   │   │   └── UsageHistory.ts
│   │   ├── repositories/
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IChatMessageRepository.ts
│   │   │   ├── ISubscriptionBundleRepository.ts
│   │   │   └── IUsageHistoryRepository.ts
│   │   └── errors/
│   │       └── AppError.ts
│   ├── services/
│   │   ├── ChatService.ts
│   │   ├── SubscriptionService.ts
│   │   └── OpenAIService.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── connection.ts
│   │   └── repositories/
│   │       ├── UserRepository.ts
│   │       ├── ChatMessageRepository.ts
│   │       ├── SubscriptionBundleRepository.ts
│   │       └── UsageHistoryRepository.ts
│   ├── controllers/
│   │   ├── chat/
│   │   │   └── ChatController.ts
│   │   ├── subscriptions/
│   │   │   └── SubscriptionController.ts
│   │   └── users/
│   │       └── UserController.ts
│   ├── routes/
│   │   ├── chatRoutes.ts
│   │   ├── subscriptionRoutes.ts
│   │   └── userRoutes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validators.ts
│   └── server.ts
├── database/
│   └── schema.sql
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-chat-subscription-api
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
copy .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_chat_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
OPENAI_MOCK_DELAY=1000
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE ai_chat_db;
```

2. Run the schema migration:
```bash
psql -U postgres -d ai_chat_db -f database/schema.sql
```

Or connect to PostgreSQL and run the schema manually:
```bash
psql -U postgres -d ai_chat_db
\i database/schema.sql
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `ai_chat_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `OPENAI_MOCK_DELAY` | Simulated API delay (ms) | `1000` |

## Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
```

### Run Production Build:
```bash
npm start
```

### Linting:
```bash
npm run lint
npm run lint:fix
```

### Formatting:
```bash
npm run format
npm run format:check
```

## API Documentation

Base URL: `http://localhost:3000/api`

### Health Check
```
GET /health
```

### User Endpoints

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Get User by ID
```http
GET /api/users/:userId
```

#### Get User by Email
```http
GET /api/users?email=user@example.com
```

### Chat Endpoints

#### Ask Question
```http
POST /api/chat/ask
Content-Type: application/json

{
  "userId": 1,
  "question": "What is artificial intelligence?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question": "What is artificial intelligence?",
    "answer": "Based on your question about 'What is artificial intelligence?'...",
    "tokensUsed": 125,
    "isFreeMessage": true,
    "createdAt": "2026-01-09T10:30:00.000Z"
  }
}
```

#### Get Chat History
```http
GET /api/chat/history/:userId?limit=50
```

### Subscription Endpoints

#### Create Subscription
```http
POST /api/subscriptions
Content-Type: application/json

{
  "userId": 1,
  "bundleType": "Pro",
  "billingCycle": "monthly",
  "autoRenew": true
}
```

**Bundle Types:** `Basic`, `Pro`, `Enterprise`  
**Billing Cycles:** `monthly`, `yearly`

#### Get User Subscriptions
```http
GET /api/subscriptions/user/:userId
```

#### Get Active Subscriptions
```http
GET /api/subscriptions/user/:userId/active
```

#### Get Subscription Details
```http
GET /api/subscriptions/:subscriptionId
```

#### Toggle Auto-Renew
```http
PATCH /api/subscriptions/:subscriptionId/auto-renew
Content-Type: application/json

{
  "autoRenew": false
}
```

#### Cancel Subscription
```http
DELETE /api/subscriptions/:subscriptionId
```

## Business Logic

### Free Messages
- Each user gets **3 free messages per month**
- Free message counter resets automatically on the 1st of each month
- After exhausting free messages, a valid subscription bundle is required

### Subscription Bundles

| Bundle | Max Messages | Monthly Price | Yearly Price |
|--------|-------------|---------------|--------------|
| Basic | 10 | $9.99 | $99.99 |
| Pro | 100 | $29.99 | $299.99 |
| Enterprise | Unlimited | $99.99 | $999.99 |

### Quota Deduction Logic
1. First, check if user has free messages available
2. If free messages exhausted, find active subscription bundles
3. Deduct from bundle with **latest remaining quota** (highest remaining messages)
4. If all bundles exhausted, throw `QUOTA_EXCEEDED` error

### Auto-Renewal Process
- System checks for expired subscriptions with `auto_renew = true`
- Simulates payment processing (90% success rate)
- On success: Renews subscription, resets message count, saves usage history
- On failure: Marks subscription as inactive

## Error Handling

The API uses structured error responses:

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `QUOTA_EXCEEDED` | 429 | User has exhausted all message quotas |
| `SUBSCRIPTION_REQUIRED` | 402 | Valid subscription needed |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `INACTIVE_SUBSCRIPTION` | 403 | Subscription is inactive |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "All subscription bundles have exhausted their quota."
  }
}
```

## Testing

### Manual Testing with cURL

1. Create a user:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"name\":\"Test User\"}"
```

2. Ask a question (using free messages):
```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"question\":\"What is TypeScript?\"}"
```

3. Create a subscription:
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"bundleType\":\"Pro\",\"billingCycle\":\"monthly\"}"
```

## Key Implementation Highlights

1. **Clean Architecture**: Clear separation of concerns with domain, service, infrastructure, and presentation layers
2. **TypeScript-First**: Full type safety throughout the codebase
3. **REST Principles**: Proper HTTP methods, status codes, and resource naming
4. **Error Handling**: Structured errors with custom error classes
5. **Validation**: Input validation using express-validator
6. **Database Design**: Normalized schema with proper relationships and indexes
7. **Business Logic**: Smart quota management and subscription lifecycle handling
8. **Code Quality**: ESLint and Prettier configured for consistent code style


