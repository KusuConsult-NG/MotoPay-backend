# MotoPay Backend API

Backend system for Plateau State vehicle levy and insurance management platform.

## Features

- ✅ RESTful API with JWT authentication
- ✅ Vehicle registration and lookup
- ✅ Compliance status checking
- ✅ Payment processing (Paystack integration)
- ✅ Admin dashboard and reporting
- ✅ Agent portal with commission tracking
- ✅ Exception queue management
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting and security

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Payment**: Paystack
- **Logging**: Winston
- **Validation**: Joi

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

## Installation

1. **Clone the repository**
```bash
cd "/Users/mac/Revenue backend"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
# Create PostgreSQL database
createdb motopay

# Run migrations
npm run migrate
```

5. **Generate Prisma client**
```bash
npm run db:generate
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run Prisma Studio (Database GUI)
npm run db:studio
```

## Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npm run migrate:deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Vehicles
- `POST /api/v1/vehicles/lookup` - Look up vehicle by TIN/Plate/VIN
- `POST /api/v1/vehicles/register` - Register new vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle details
- `GET /api/v1/vehicles/:id/compliance` - Get compliance status
- `GET /api/v1/vehicles/:id/history` - Get transaction history

### Payments
- `POST /api/v1/payments/initialize` - Initialize payment
- `POST /api/v1/payments/verify/:reference` - Verify payment
- `POST /api/v1/payments/webhook` - Payment webhook
- `GET /api/v1/payments/transaction/:id` - Get transaction

### Admin (Requires ADMIN/SUPER_ADMIN role)
- `GET /api/v1/admin/metrics` - Dashboard metrics
- `GET /api/v1/admin/transactions` - List transactions
- `GET /api/v1/admin/collections` - Daily/monthly collections
- `POST /api/v1/admin/export` - Export reports

## Environment Variables

See `.env.example` for all required environment variables.

Critical variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Paystack public key

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript types
├── utils/            # Utility functions
└── app.ts            # Express app setup
```

## Testing

```bash
npm test
```

## Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on sensitive endpoints
- Input validation with Joi
- CORS configuration
- Helmet.js for security headers
- SQL injection prevention (Prisma ORM)

## Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong JWT secrets
4. Configure payment gateway production keys
5. Run migrations: `npm run migrate:deploy`
6. Build: `npm run build`
7. Start: `npm start`

## License

© 2024 Plateau State Internal Revenue Service

## Support

For issues or questions, contact: support@motopay.pl.gov.ng
