# 🚀 DEPLOYMENT GUIDE

**Complete guide to deploying GameMind to production**

---

## 📋 PREREQUISITES

Before deploying, ensure you have:
- [x] All features complete and tested
- [x] GitHub repository set up
- [x] Railway account (for backend)
- [x] Vercel account (for frontend)
- [x] Supabase project created
- [x] Stripe account configured
- [x] Domain name (optional)

---

## 🗄️ PHASE 1: DATABASE SETUP

### Option A: Railway PostgreSQL (Recommended)

1. **Create PostgreSQL Database on Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   ```

2. **Get Database URL:**
   - Go to Railway dashboard
   - Click on PostgreSQL service
   - Copy `DATABASE_URL` from Variables tab

3. **Run Migrations:**
   ```bash
   cd PRODUCTION/backend
   DATABASE_URL="your-railway-postgres-url" bun run db:migrate
   ```

### Option B: Supabase PostgreSQL

1. **Use Supabase Database:**
   - Already have Supabase project
   - Get connection string from Settings → Database
   - Use direct connection (not pooler)

2. **Run Migrations:**
   ```bash
   cd PRODUCTION/backend
   DATABASE_URL="your-supabase-postgres-url" bun run db:migrate
   ```

---

## 🔧 PHASE 2: BACKEND DEPLOYMENT (Railway)

### Step 1: Prepare Backend

1. **Update package.json:**
   ```json
   {
     "scripts": {
       "start": "bun run src/index.ts",
       "build": "bun install",
       "db:migrate": "bun run src/db/migrate.ts"
     }
   }
   ```

2. **Ensure all environment variables are documented in `.env.example`**

### Step 2: Deploy to Railway

**Option A: Using Railway CLI**

```bash
cd PRODUCTION/backend

# Login to Railway
railway login

# Link to project (or create new)
railway link

# Add environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="your-database-url"
railway variables set SUPABASE_URL="your-supabase-url"
railway variables set SUPABASE_ANON_KEY="your-anon-key"
railway variables set SUPABASE_SERVICE_KEY="your-service-key"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set STRIPE_SECRET_KEY="your-stripe-key"
railway variables set STRIPE_WEBHOOK_SECRET="your-webhook-secret"
railway variables set STRIPE_PRICE_PRO="your-pro-price-id"
railway variables set STRIPE_PRICE_MASTER="your-master-price-id"
railway variables set FRONTEND_URL="https://gamemind.app"

# Deploy
railway up
```

**Option B: Using GitHub Integration**

1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `PRODUCTION/backend` as root directory
6. Add all environment variables in Settings
7. Deploy

### Step 3: Configure Domain (Optional)

1. Go to Railway project settings
2. Click "Generate Domain" or add custom domain
3. Note the URL (e.g., `https://gamemind-backend.up.railway.app`)

### Step 4: Test Backend

```bash
# Health check
curl https://your-backend-url.railway.app/health

# Should return: {"status":"healthy"}
```

---

## 🎨 PHASE 3: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Frontend

1. **Update environment variables:**
   ```bash
   # Create .env.production
   VITE_API_URL=https://your-backend-url.railway.app
   ```

2. **Test build locally:**
   ```bash
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_API_URL production

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: SvelteKit
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit`
5. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
6. Deploy

### Step 3: Configure Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain
3. Update DNS records as instructed

### Step 4: Test Frontend

1. Visit your Vercel URL
2. Test complete user flow:
   - Register → Login → Play → View Stats
3. Check browser console for errors

---

## 🔗 PHASE 4: STRIPE WEBHOOK CONFIGURATION

### Step 1: Get Webhook URL

Your webhook URL will be:
```
https://your-backend-url.railway.app/api/payments/webhook
```

### Step 2: Configure in Stripe

1. Go to Stripe Dashboard
2. Navigate to Developers → Webhooks
3. Click "Add endpoint"
4. Enter webhook URL
5. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the webhook signing secret

### Step 3: Update Environment Variable

```bash
# On Railway
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_secret"
```

### Step 4: Test Webhook

1. Use Stripe CLI to test:
   ```bash
   stripe listen --forward-to https://your-backend-url.railway.app/api/payments/webhook
   ```

2. Trigger test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 🔐 PHASE 5: SECURITY CONFIGURATION

### Step 1: Update CORS Settings

In `PRODUCTION/backend/src/index.ts`, update CORS origin:
```typescript
app.use('/*', cors({
  origin: [
    'https://gamemind.app',
    'https://www.gamemind.app',
  ],
  credentials: true,
}));
```

### Step 2: Enable HTTPS Only

Ensure both Railway and Vercel are using HTTPS (they do by default).

### Step 3: Set Secure Headers

Already configured in backend middleware.

### Step 4: Rate Limiting

Already configured (100 requests per 15 minutes).

---

## 📊 PHASE 6: MONITORING SETUP

### Step 1: Sentry (Error Tracking)

1. Create Sentry project at sentry.io
2. Get DSN
3. Add to Railway:
   ```bash
   railway variables set SENTRY_DSN="your-sentry-dsn"
   ```

### Step 2: Railway Logs

- View logs in Railway dashboard
- Set up log drains if needed

### Step 3: Vercel Analytics

- Enable in Vercel dashboard
- Automatic for all deployments

---

## 🧪 PHASE 7: POST-DEPLOYMENT TESTING

### Checklist:

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Email verification works (check Supabase)
- [ ] Login works
- [ ] Dashboard shows correct data
- [ ] Chess game saves correctly
- [ ] Game history displays
- [ ] Leaderboard works
- [ ] Pricing page loads
- [ ] Stripe checkout works
- [ ] Webhook receives events
- [ ] Subscription updates correctly
- [ ] Account settings work
- [ ] Password reset works
- [ ] All pages are responsive
- [ ] No console errors

---

## 🔄 PHASE 8: CI/CD SETUP

### Step 1: GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `RAILWAY_TOKEN`: Get from Railway dashboard
   - `VERCEL_TOKEN`: Get from Vercel settings
   - `VERCEL_ORG_ID`: Get from Vercel settings
   - `VERCEL_PROJECT_ID`: Get from Vercel project settings

### Step 2: Enable GitHub Actions

The workflow file is already created at `.github/workflows/ci-cd.yml`.

It will automatically:
- Run tests on every push
- Deploy to production on push to `main` branch

### Step 3: Test CI/CD

1. Make a small change
2. Commit and push to `main`
3. Check GitHub Actions tab
4. Verify deployment succeeded

---

## 📝 PHASE 9: DOCUMENTATION

### Update README

Add production URLs:
```markdown
## Live Demo

- **Frontend:** https://gamemind.app
- **Backend API:** https://api.gamemind.app
- **Status:** https://status.gamemind.app
```

### Create Status Page

Use services like:
- status.io
- statuspage.io
- Or build custom with Railway/Vercel status

---

## 🎉 DEPLOYMENT COMPLETE!

Your application is now live at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app

### Next Steps:

1. **Monitor:** Check logs and error tracking
2. **Optimize:** Review performance metrics
3. **Scale:** Adjust resources as needed
4. **Market:** Start promoting your app!

---

## 🆘 TROUBLESHOOTING

### Backend won't start:
- Check Railway logs
- Verify all environment variables are set
- Ensure database migrations ran successfully

### Frontend shows API errors:
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify backend is running

### Stripe webhooks not working:
- Verify webhook URL is correct
- Check webhook signing secret
- Review Stripe dashboard for failed events

### Database connection errors:
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP whitelist includes Railway IPs

---

**Status:** Ready for production deployment! 🚀

