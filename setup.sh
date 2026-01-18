#!/bin/bash

echo "🚀 MotoPay Backend Setup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Installing via Homebrew...${NC}"
    brew install postgresql@14
    brew services start postgresql@14
else
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
fi

# Create database
echo -e "\n${YELLOW}Creating database...${NC}"
if psql -lqt | cut -d \| -f 1 | grep -qw motopay; then
    echo -e "${GREEN}✓ Database 'motopay' already exists${NC}"
else
    createdb motopay
    echo -e "${GREEN}✓ Database 'motopay' created${NC}"
fi

# Check .env file
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your actual credentials${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Install dependencies if needed
echo -e "\n${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Try to generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
if npx prisma generate 2>/dev/null; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${RED}✗ Prisma generate failed. Trying alternative method...${NC}"
    echo -e "${YELLOW}Using prisma db push instead...${NC}"
    npx prisma db push --skip-generate
    npm install @prisma/client
fi

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
npx prisma migrate dev --name init

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
npx ts-node prisma/seed.ts

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update .env with your actual credentials"
echo "2. Run: npm run dev"
echo "3. Test API at: http://localhost:5000"
echo ""
echo -e "${YELLOW}Test credentials:${NC}"
echo "Admin: admin@psirs.gov.ng / Admin123!"
echo "Agent: agent@motopay.ng / Agent123!"
echo ""
echo -e "${YELLOW}Sample vehicle:${NC}"
echo "Plate: PL-582-KN"
