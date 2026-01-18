# MotoPay Backend Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Domain name with SSL certificate
- Environment variables configured

---

## Option 1: Railway Deployment (Recommended)

Railway offers the easiest deployment with automatic Prisma support.

### Steps:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add
   # Select PostgreSQL
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set REFRESH_TOKEN_SECRET=your-refresh-secret
   railway variables set PAYSTACK_SECRET_KEY=your-paystack-key
   railway variables set SENDGRID_API_KEY=your-sendgrid-key
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

7. **Get Domain**
   ```bash
   railway domain
   ```

Your API will be live at the provided URL!

---

## Option 2: Heroku Deployment

### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create motopay-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Buildpacks**
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set REFRESH_TOKEN_SECRET=your-refresh-secret
   heroku config:set PAYSTACK_SECRET_KEY=your-paystack-key
   heroku config:set SENDGRID_API_KEY=your-sendgrid-key
   heroku config:set NODE_ENV=production
   ```

6. **Add Release Command** (in `Procfile`):
   ```
   release: npx prisma migrate deploy
   web: npm start
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

8. **Scale Dynos**
   ```bash
   heroku ps:scale web=1
   ```

---

## Option 3: Docker Deployment

### Local Docker

1. **Build Image**
   ```bash
   docker build -t motopay-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3 **Check Logs**
   ```bash
   docker-compose logs -f api
   ```

### Production Docker

1. **Use Docker Registry**
   ```bash
   docker tag motopay-api your-registry.com/motopay-api:latest
   docker push your-registry.com/motopay-api:latest
   ```

2. **Deploy to Cloud**
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

---

## Option 4: VPS Deployment (Ubuntu)

### Setup:

1. **SSH into Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql nginx
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/KusuConsult-NG/MotoPay-backend.git
   cd MotoPay-backend
   ```

4. **Install Node Modules**
   ```bash
   npm ci --only=production
   ```

5. **Create .env File**
   ```bash
   nano .env
   # Add all environment variables
   ```

6. **Setup PostgreSQL**
   ```bash
   sudo -u postgres createdb motopay
   sudo -u postgres psql motopay -c "ALTER USER postgres WITH PASSWORD 'your-password';"
   ```

7. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

8. **Build Application**
   ```bash
   npm run build
   ```

9. **Setup PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start dist/app.js --name motopay-api
   pm2 save
   pm2 startup
   ```

10. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/motopay
    ```
    
    Add:
    ```nginx
    server {
        listen 80;
        server_name api.motopay.pl.gov.ng;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/motopay /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **Setup SSL**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.motopay.pl.gov.ng
    ```

---

## Option 5: Render Deployment

1. **Connect GitHub**
   - Go to render.com
   - Connect your GitHub repository

2. **Create Web Service**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL**
   - Create PostgreSQL database in Render
   - Copy DATABASE_URL

4. **Set Environment Variables**
   - Add all required variables in Render dashboard

5. **Deploy**
   - Render auto-deploys on push to main branch

---

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Health check endpoint responding
- [ ] Swagger documentation accessible
- [ ] Payment webhook configured
- [ ] Monitoring setup (optional)
- [ ] Backup strategy configured
- [ ] Rate limiting active
- [ ] CORS configured correctly

---

## Environment Variables Checklist

```env
# Core
NODE_ENV=production
PORT=5000
API_VERSION=v1
BASE_URL=https://api.motopay.pl.gov.ng
FRONTEND_URL=https://motopay.pl.gov.ng

# Database
DATABASE_URL=postgresql://user:pass@host:5432/motopay

# Security
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Payment
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@motopay.pl.gov.ng
EMAIL_FROM_NAME=MotoPay

# SMS
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+234xxxxx

# Optional
REDIS_URL=redis://localhost:6379
LEGACY_DB_URL=http://legacy-api.psirs.gov.ng
LEGACY_API_KEY=xxxxx
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## Monitoring Setup

### Option 1: Sentry
```bash
npm install @sentry/node
```

Add to `src/app.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Option 2: DataDog
```bash
npm install dd-trace
```

### Option 3: New Relic
```bash
npm install newrelic
```

---

## Backup Strategy

### Database Backups

**Railway/Heroku:**
- Automatic daily backups included

**VPS:**
```bash
# Add to crontab
0 2 * * * pg_dump motopay | gzip > /backups/motopay-$(date +\%Y\%m\%d).sql.gz
```

### File Backups (Uploads)
```bash
# Backup to S3
aws s3 sync /app/uploads s3://motopay-backups/uploads
```

---

## Troubleshooting

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database (CAUTION)
npx prisma migrate reset

# View studio
npx prisma studio
```

### Port Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

## Support

For deployment issues:
- Email: devops@motopay.pl.gov.ng
- Documentation: https://github.com/KusuConsult-NG/MotoPay-backend

---

**Deployment Complete! 🚀**
