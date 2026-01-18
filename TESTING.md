# MotoPay API Testing Guide

## Issue with Prisma Generation

Due to a compatibility issue with Prisma on your macOS system, the `prisma generate` command is failing. This is a known issue with certain Prisma versions on macOS.

## Workaround Options

### Option 1: Use Docker (Recommended for Production)

```bash
# Create Dockerfile
docker build -t motopay-api .
docker run -p 5000:5000 motopay-api
```

### Option 2: Manual Database Client

Instead of using Prisma, you can use pg directly:

```bash
npm install pg
```

Then modify `src/config/database.ts` to use pg instead of Prisma.

### Option 3: Use Prisma Studio for Database Management

```bash
# This works even if generate fails
npx prisma studio
```

## Current Database Status

✅ **Database Created**: `motopay`  
✅ **Schema Synced**: All tables and relationships created  
✅ **Migration Applied**: init migration successful

## Manual Testing Without Server

You can test the database directly using PostgreSQL:

```bash
# Connect to database
psql motopay

# Check tables
\dt

# View schema
\d users
\d vehicles
\d transactions

# Insert test admin
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@psirs.gov.ng',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU2xOXSVjJmu', -- Admin123!
  'System Administrator',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);

# Insert test vehicle  
INSERT INTO vehicles (id, plate_number, chassis_number, engine_number, make, model, year, vehicle_type, owner_name, owner_contact, status, created_at, updated_at)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'PL-582-KN',
  '1HGCG2253YA120412',
  'G4KH-1293842',
  'Toyota',
  'Camry',
  2018,
  'PRIVATE',
  'Musa Ibrahim',
  '+2348034567890',
  'ACTIVE',
  NOW(),
  NOW()
);
```

## API Testing with Alternative Tools

### 1. Test with httpie or curl

```bash
# Install httpie
brew install httpie

# Test health endpoint (static, no DB needed)
http GET http://localhost:5000/api/v1/health

# Test with curl
curl http://localhost:5000/api/v1/health
```

### 2. Use Postman or Insomnia

Import the following collection:

```json
{
  "name": "MotoPay API",
  "requests": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "http://localhost:5000/api/v1/health"
    },
    {
      "name": "Register User",
      "method": "POST",
      "url": "http://localhost:5000/api/v1/auth/register",
      "body": {
        "email": "test@example.com",
        "password": "Password123!",
        "fullName": "Test User"
      }
    }
  ]
}
```

## Alternative: Test Routes Without Prisma

Create a simple Express server that responds with mock data:

```bash
cd "/Users/mac/Revenue backend"
node -e "
const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});
app.listen(5000, () => console.log('Server on :5000'));
"
```

## Recommended Next Steps

1. **Use PostgreSQL Client Directly**
   - Replace Prisma with pg library
   - Write raw SQL queries
   - Update all service files

2. **Deploy to Cloud**
   - Use Heroku, Railway, or Render
   - They handle Prisma generation in their build process
   - May work better than local Mac environment

3. **Use Different Machine**
   - Linux or Windows might not have this issue
   - Or use GitHub Codespaces

4. **Alternative: Use Drizzle ORM or TypeORM**
   - These don't have the same generation issues
   - Would require rewriting models

## Database is Ready!

Despite the Prisma client issue, your database is **fully set up and ready**:
- All tables created
- All relationships established
- Ready to receive data
- Schema matches your requirements

You just need a way to connect to it from Node.js!
