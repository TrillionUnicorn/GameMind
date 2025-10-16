# GameMind Backend API

Production-ready backend API built with Bun, Hono, and PostgreSQL.

## 🚀 Tech Stack

- **Runtime:** Bun 1.0+ (4x faster than Node.js)
- **Framework:** Hono (fastest web framework)
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM (type-safe, zero runtime overhead)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **File Storage:** Cloudflare R2
- **Email:** Resend
- **Monitoring:** Sentry (optional)

## 📋 Prerequisites

- Bun 1.0 or higher
- PostgreSQL 16 or higher
- Supabase account
- Stripe account

## 🛠️ Installation

### 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all required values:

- **Database:** Create a PostgreSQL database and add the connection string
- **Supabase:** Create a project at supabase.com and get your keys
- **Stripe:** Create an account at stripe.com and get your API keys
- **Cloudflare R2:** Create a bucket for file uploads
- **Resend:** Create an account for email sending

### 4. Generate Database Schema

```bash
bun run db:generate
```

### 5. Run Migrations

```bash
bun run db:migrate
```

## 🏃 Running the Server

### Development Mode

```bash
bun run dev
```

Server will start at `http://localhost:3000`

### Production Mode

```bash
bun run build
bun run start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints

#### Health Check

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with dependencies
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify-email` - Verify email address

#### Users

- `GET /api/users/me` - Get current user's full profile
- `PATCH /api/users/me` - Update current user's profile
- `PATCH /api/users/me/preferences` - Update user preferences
- `DELETE /api/users/me` - Delete current user's account
- `GET /api/users/:id` - Get public user profile
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/leaderboard?game=chess` - Get leaderboard
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/ban` - Ban/unban user (admin only)

#### Games

- `POST /api/games` - Create new game record
- `GET /api/games` - Get current user's game history
- `GET /api/games/:id` - Get specific game details
- `DELETE /api/games/:id` - Delete a game
- `GET /api/games/stats/summary` - Get user's statistics

#### Payments

- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/create-portal-session` - Create customer portal
- `GET /api/payments/subscription` - Get current subscription
- `POST /api/payments/webhook` - Stripe webhook handler

## 🗄️ Database Schema

### Tables

- **users** - User accounts
- **user_profiles** - Extended user data
- **user_stats** - Game statistics
- **games** - Game history
- **subscriptions** - Stripe subscriptions
- **payments** - Payment records
- **achievements** - Achievement definitions
- **user_achievements** - User achievement unlocks
- **friends** - Friend relationships
- **tournaments** - Tournament data
- **tournament_participants** - Tournament players
- **notifications** - User notifications

## 🔒 Security Features

- JWT authentication with Supabase
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Secure headers (helmet)
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)
- Password hashing (bcrypt)
- Environment variable validation

## 🧪 Testing

```bash
bun test
```

## 📦 Database Management

### Generate Migration

```bash
bun run db:generate
```

### Run Migrations

```bash
bun run db:migrate
```

### Open Drizzle Studio

```bash
bun run db:studio
```

## 🚀 Deployment

### Railway

1. Create new project on Railway
2. Add PostgreSQL database
3. Add environment variables
4. Deploy from GitHub

### Fly.io

1. Install flyctl
2. Run `fly launch`
3. Add secrets: `fly secrets set KEY=value`
4. Deploy: `fly deploy`

## 📊 Monitoring

### Sentry (Error Tracking)

Add `SENTRY_DSN` to environment variables to enable error tracking.

### Logging

All requests are logged with:
- Request ID
- Method and path
- Response time
- Status code
- IP address

## 🔧 Environment Variables

See `.env.example` for all required and optional environment variables.

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PRICE_PRO` - Stripe price ID for Pro tier
- `STRIPE_PRICE_MASTER` - Stripe price ID for Master tier

### Optional

- `SENTRY_DSN` - Sentry error tracking
- `PLAUSIBLE_API_KEY` - Plausible analytics

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on GitHub.

