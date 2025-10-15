# ✅ PRODUCTION DEPLOYMENT CHECKLIST

**Use this checklist to ensure a smooth production deployment**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Backend Preparation
- [ ] All environment variables documented in `.env.example`
- [ ] Database migrations tested locally
- [ ] Performance indexes script ready (`src/db/indexes.sql`)
- [ ] All tests passing (`bun test`)
- [ ] No console.log statements in production code
- [ ] Error handling comprehensive
- [ ] Rate limiting configured
- [ ] CORS origins set correctly

### Frontend Preparation
- [ ] All environment variables documented in `.env.example`
- [ ] Build successful (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] API URL points to production backend
- [ ] Error boundaries implemented
- [ ] Loading states everywhere

### Security Checklist
- [ ] JWT_SECRET is strong (min 32 characters)
- [ ] Supabase service key is secure
- [ ] Stripe webhook secret configured
- [ ] No secrets in code or git history
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation on all endpoints

### Monitoring Setup
- [ ] Sentry project created
- [ ] Sentry DSN configured
- [ ] Error tracking tested
- [ ] Performance monitoring enabled
- [ ] Health check endpoints working
- [ ] Logging configured

---

## 🗄️ DATABASE DEPLOYMENT

### Step 1: Create Production Database
```bash
# On Railway or your provider
# Create PostgreSQL database
# Note the DATABASE_URL
```

### Step 2: Run Migrations
```bash
cd PRODUCTION/backend
DATABASE_URL="your-production-url" bun run db:migrate
```

### Step 3: Run Performance Indexes
```bash
psql $DATABASE_URL < src/db/indexes.sql
```

### Step 4: Verify Database
```bash
# Connect and verify tables
psql $DATABASE_URL
\dt  # List tables
\di  # List indexes
```

**Checklist:**
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Indexes created
- [ ] Connection tested
- [ ] Backup configured

---

## 🚀 BACKEND DEPLOYMENT (Railway)

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy to Railway
```bash
cd PRODUCTION/backend
railway login
railway init  # or railway link
railway up
```

### Step 3: Configure Environment Variables
```bash
# Set all required variables
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
railway variables set FRONTEND_URL="https://your-frontend-url.vercel.app"
railway variables set SENTRY_DSN="your-sentry-dsn"
railway variables set APP_VERSION="1.0.0"
```

### Step 4: Verify Deployment
```bash
# Get your Railway URL
railway domain

# Test health check
curl https://your-backend.railway.app/health

# Test detailed health
curl https://your-backend.railway.app/health/detailed
```

**Checklist:**
- [ ] Backend deployed
- [ ] All environment variables set
- [ ] Health check returns 200
- [ ] Database connected
- [ ] Logs show no errors
- [ ] Domain configured (optional)

---

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Deploy to Vercel
```bash
vercel login
vercel  # Deploy to preview
```

### Step 2: Configure Environment Variables
```bash
# Add production environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app
```

### Step 3: Deploy to Production
```bash
vercel --prod
```

### Step 4: Verify Deployment
```bash
# Visit your Vercel URL
# Test complete user flow
```

**Checklist:**
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] API connection working
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Domain configured (optional)

---

## 💳 STRIPE CONFIGURATION

### Step 1: Get Webhook URL
```
https://your-backend.railway.app/api/payments/webhook
```

### Step 2: Configure Webhook in Stripe
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret

### Step 3: Update Environment Variable
```bash
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_secret"
```

### Step 4: Test Webhook
```bash
# Use Stripe CLI
stripe listen --forward-to https://your-backend.railway.app/api/payments/webhook
stripe trigger checkout.session.completed
```

**Checklist:**
- [ ] Webhook endpoint added
- [ ] Events selected
- [ ] Signing secret configured
- [ ] Webhook tested
- [ ] Test payment successful

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Backend Verification
```bash
# Health check
curl https://your-backend.railway.app/health
# Expected: {"status":"healthy"}

# Detailed health
curl https://your-backend.railway.app/health/detailed
# Expected: All checks passing

# Metrics
curl https://your-backend.railway.app/health/metrics
# Expected: Performance metrics

# Test API endpoint
curl https://your-backend.railway.app/api/auth/health
# Expected: 200 OK
```

### Frontend Verification
- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard shows data
- [ ] Chess game works
- [ ] Game saves correctly
- [ ] Game history displays
- [ ] Leaderboard works
- [ ] Pricing page loads
- [ ] Stripe checkout works
- [ ] Account settings work
- [ ] Password reset works

### Integration Testing
- [ ] Complete user flow (register → play → subscribe)
- [ ] Email verification works
- [ ] Payment processing works
- [ ] Webhook receives events
- [ ] Subscription updates correctly
- [ ] Game replay works
- [ ] Leaderboard updates

### Performance Testing
- [ ] Page load time < 2s
- [ ] API response time < 100ms
- [ ] Database queries < 10ms
- [ ] No memory leaks
- [ ] No console errors

### Monitoring Verification
- [ ] Sentry receiving events
- [ ] Error tracking working
- [ ] Performance monitoring active
- [ ] Health checks passing
- [ ] Logs accessible

---

## 🔄 CI/CD VERIFICATION

### GitHub Actions
- [ ] Workflow file exists (`.github/workflows/ci-cd.yml`)
- [ ] Secrets configured in GitHub
  - `RAILWAY_TOKEN`
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- [ ] Push to main triggers deployment
- [ ] Tests run automatically
- [ ] Deployment succeeds

### Test CI/CD
```bash
# Make a small change
echo "# Test" >> README.md
git add .
git commit -m "Test CI/CD"
git push origin main

# Check GitHub Actions tab
# Verify deployment succeeded
```

**Checklist:**
- [ ] CI/CD pipeline configured
- [ ] Secrets added to GitHub
- [ ] Tests run on push
- [ ] Auto-deployment works
- [ ] Notifications configured

---

## 📊 MONITORING SETUP

### Sentry Configuration
- [ ] Project created in Sentry
- [ ] DSN configured in backend
- [ ] Error tracking tested
- [ ] Performance monitoring enabled
- [ ] Alerts configured
- [ ] Team members invited

### Health Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Monitor `/health` endpoint
- [ ] Alert on downtime
- [ ] Monitor response times

### Log Monitoring
- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error logs reviewed
- [ ] Performance logs reviewed

**Checklist:**
- [ ] Sentry configured
- [ ] Uptime monitoring active
- [ ] Alerts configured
- [ ] Logs accessible
- [ ] Dashboard created

---

## 🎉 LAUNCH CHECKLIST

### Final Verification
- [ ] All features working
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security hardened
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation complete

### Launch Preparation
- [ ] Announcement prepared
- [ ] Support email configured
- [ ] Terms of service ready
- [ ] Privacy policy ready
- [ ] Contact page working

### Go Live!
- [ ] Remove "beta" labels
- [ ] Enable public registration
- [ ] Announce launch
- [ ] Monitor closely for 24h
- [ ] Respond to issues quickly

---

## 🆘 ROLLBACK PLAN

### If Issues Occur:

**Backend Rollback:**
```bash
railway rollback
```

**Frontend Rollback:**
```bash
vercel rollback
```

**Database Rollback:**
```bash
# Restore from backup
# Run previous migration
```

**Checklist:**
- [ ] Backup before deployment
- [ ] Rollback plan tested
- [ ] Team knows rollback procedure
- [ ] Monitoring alerts configured

---

## 📝 POST-LAUNCH

### Week 1
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on data

### Week 2-4
- [ ] Review analytics
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Improve documentation
- [ ] Scale as needed

---

**Status:** Ready for production deployment! 🚀

**Next Action:** Follow this checklist step-by-step

