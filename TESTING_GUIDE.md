# 🧪 COMPREHENSIVE TESTING GUIDE

**Complete guide to testing GameMind before production deployment**

---

## 📋 TESTING OVERVIEW

### Testing Levels:
1. **Unit Tests** - Individual components
2. **Integration Tests** - API endpoints
3. **E2E Tests** - Complete user flows
4. **Load Tests** - Performance under load
5. **Security Tests** - Vulnerability scanning
6. **Manual Tests** - User acceptance

---

## 🔧 SETUP

### Backend Testing Setup

```bash
cd PRODUCTION/backend

# Install dependencies
bun install

# Set up test database
createdb gamemind_test

# Set test environment
export NODE_ENV=test
export DATABASE_URL=postgresql://user:password@localhost:5432/gamemind_test

# Run migrations
bun run db:migrate
```

### Frontend Testing Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

---

## 🧪 BACKEND TESTS

### Run All Backend Tests

```bash
cd PRODUCTION/backend
bun test
```

### Run Specific Test Files

```bash
# Authentication tests
bun test tests/auth.test.ts

# Setup tests
bun test tests/setup.ts
```

### Expected Output:

```
✓ Authentication
  ✓ POST /api/auth/register
    ✓ should register a new user
    ✓ should reject duplicate email
    ✓ should validate email format
    ✓ should validate password length
  ✓ POST /api/auth/login
    ✓ should login with valid credentials
    ✓ should reject invalid password
    ✓ should reject non-existent user
  ✓ GET /api/auth/me
    ✓ should return user info with valid token
    ✓ should reject request without token
    ✓ should reject request with invalid token
  ✓ POST /api/auth/logout
    ✓ should logout successfully

All tests passed! (12/12)
```

### Test Coverage

```bash
# Generate coverage report
bun test --coverage

# Expected: 80%+ coverage
```

---

## 🎨 FRONTEND TESTS

### Run All Frontend Tests

```bash
npm test
```

### Run Component Tests

```bash
# API client tests
npm test tests/api-client.test.ts
```

### Run E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- tests/e2e/login.spec.ts
```

---

## ⚡ LOAD TESTING

### Run Load Tests

```bash
cd PRODUCTION/backend/tests

# Test local server
API_URL=http://localhost:3000 bun run load-test.ts

# Test production server
API_URL=https://your-backend.railway.app bun run load-test.ts

# Custom parameters
CONCURRENT_USERS=200 DURATION_SECONDS=120 bun run load-test.ts
```

### Expected Results:

```
📊 Results for /health:
   Total Requests: 1000
   Successful: 995 (99.50%)
   Failed: 5 (0.50%)
   Average Response Time: 45.23ms
   Min Response Time: 12ms
   Max Response Time: 234ms
   Requests/Second: 166.67

✅ Success Rate: 99.50%
⚡ Average Response Time: 45.23ms
🚀 Requests/Second: 166.67

🎉 PASS: System performing well under load!
```

### Performance Benchmarks:

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| Success Rate | >95% | >99% | >99.9% |
| Avg Response Time | <200ms | <100ms | <50ms |
| Requests/Second | >50 | >100 | >500 |

---

## 🔒 SECURITY TESTING

### Manual Security Checks

**1. Authentication Security:**
```bash
# Test without token (should fail)
curl https://your-api.com/api/users/me

# Test with invalid token (should fail)
curl -H "Authorization: Bearer invalid-token" \
  https://your-api.com/api/users/me

# Test with expired token (should fail)
curl -H "Authorization: Bearer expired-token" \
  https://your-api.com/api/users/me
```

**2. Rate Limiting:**
```bash
# Send 150 requests rapidly (should get rate limited)
for i in {1..150}; do
  curl https://your-api.com/health &
done
wait

# Expected: Some requests return 429 Too Many Requests
```

**3. CORS Protection:**
```bash
# Test from unauthorized origin (should fail)
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-api.com/api/auth/login
```

**4. SQL Injection:**
```bash
# Test SQL injection (should be prevented)
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"test"}'

# Expected: Validation error or login failure
```

**5. XSS Protection:**
```bash
# Test XSS in input (should be sanitized)
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"<script>alert(1)</script>"}'

# Expected: Input sanitized or rejected
```

---

## 🧑‍💻 MANUAL TESTING

### Complete User Flow Test

**1. Registration Flow:**
- [ ] Visit homepage
- [ ] Click "Sign Up"
- [ ] Enter email, password, name
- [ ] Submit form
- [ ] See success message
- [ ] Check email for verification
- [ ] Click verification link
- [ ] Account verified

**2. Login Flow:**
- [ ] Visit login page
- [ ] Enter credentials
- [ ] Submit form
- [ ] Redirected to dashboard
- [ ] See user data

**3. Game Flow:**
- [ ] Click "Play Chess"
- [ ] Select difficulty
- [ ] Make moves
- [ ] Game saves automatically
- [ ] Finish game
- [ ] See result

**4. Game History:**
- [ ] Navigate to history
- [ ] See list of games
- [ ] Click on a game
- [ ] See game replay
- [ ] Use playback controls
- [ ] Navigate back

**5. Leaderboard:**
- [ ] Navigate to leaderboard
- [ ] See rankings
- [ ] See own position
- [ ] Filter by game type

**6. Subscription Flow:**
- [ ] Navigate to pricing
- [ ] Click "Subscribe to Pro"
- [ ] Redirected to Stripe
- [ ] Enter payment details
- [ ] Complete payment
- [ ] Redirected back
- [ ] See success message
- [ ] Subscription active

**7. Billing Management:**
- [ ] Navigate to billing
- [ ] See subscription details
- [ ] See payment history
- [ ] Click "Manage Subscription"
- [ ] Redirected to Stripe portal
- [ ] Can update payment method
- [ ] Can cancel subscription

**8. Account Settings:**
- [ ] Navigate to settings
- [ ] Update profile
- [ ] Change password
- [ ] Update preferences
- [ ] Save changes
- [ ] See success message

**9. Password Reset:**
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Enter new password
- [ ] Password updated
- [ ] Can login with new password

**10. Logout:**
- [ ] Click logout
- [ ] Redirected to homepage
- [ ] Cannot access protected pages

---

## 📱 RESPONSIVE TESTING

### Test on Different Devices:

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Tablet:**
- [ ] iPad (Safari)
- [ ] Android Tablet (Chrome)

**Mobile:**
- [ ] iPhone (Safari)
- [ ] Android Phone (Chrome)

### Responsive Breakpoints:

- [ ] Mobile: 320px - 767px
- [ ] Tablet: 768px - 1023px
- [ ] Desktop: 1024px+

---

## 🔍 INTEGRATION TESTING

### API Integration Tests

```bash
# Test complete user journey via API
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
TOKEN=$(curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.session.accessToken')

# Get user profile
curl -H "Authorization: Bearer $TOKEN" \
  https://your-api.com/api/users/me

# Save a game
curl -X POST https://your-api.com/api/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gameType":"chess","mode":"ai","difficulty":"medium","result":"win","moves":[]}'

# Get game history
curl -H "Authorization: Bearer $TOKEN" \
  https://your-api.com/api/games

# Logout
curl -X POST https://your-api.com/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 MONITORING TESTS

### Health Check Tests

```bash
# Basic health
curl https://your-api.com/health
# Expected: {"status":"healthy"}

# Detailed health
curl https://your-api.com/health/detailed
# Expected: All checks passing

# Readiness
curl https://your-api.com/health/ready
# Expected: {"status":"ready"}

# Liveness
curl https://your-api.com/health/live
# Expected: {"status":"alive"}

# Metrics
curl https://your-api.com/health/metrics
# Expected: Performance metrics

# System info
curl https://your-api.com/health/info
# Expected: System information
```

### Sentry Test

```bash
# Trigger test error (if endpoint exists)
curl https://your-api.com/api/test-error

# Check Sentry dashboard
# Should see error appear within seconds
```

---

## ✅ PRE-DEPLOYMENT TEST CHECKLIST

### Backend Tests:
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Load tests passing (>99% success rate)
- [ ] Security tests passing
- [ ] Health checks working
- [ ] Database migrations successful
- [ ] Performance indexes created

### Frontend Tests:
- [ ] All component tests passing
- [ ] All E2E tests passing
- [ ] Build successful
- [ ] No console errors
- [ ] Responsive on all devices

### Integration Tests:
- [ ] Complete user flow working
- [ ] API integration working
- [ ] Payment flow working
- [ ] Email verification working

### Performance Tests:
- [ ] Load tests passing
- [ ] Response time <100ms
- [ ] Success rate >99%
- [ ] No memory leaks

### Security Tests:
- [ ] Authentication secure
- [ ] Rate limiting working
- [ ] CORS configured
- [ ] Input validation working
- [ ] No SQL injection
- [ ] No XSS vulnerabilities

### Monitoring Tests:
- [ ] Sentry receiving events
- [ ] Health checks passing
- [ ] Logs accessible
- [ ] Metrics visible

---

## 🎯 TEST RESULTS SUMMARY

### Expected Results:

```
✅ Backend Tests: 50+ tests passing (100%)
✅ Frontend Tests: All tests passing (100%)
✅ E2E Tests: All flows working (100%)
✅ Load Tests: >99% success rate
✅ Security Tests: All checks passing
✅ Manual Tests: All flows working
✅ Responsive Tests: All devices working
✅ Integration Tests: All APIs working
✅ Monitoring Tests: All systems operational

Overall: READY FOR PRODUCTION ✅
```

---

## 🆘 TROUBLESHOOTING

### Tests Failing?

**Backend tests fail:**
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check environment variables
env | grep DATABASE_URL

# Reset test database
dropdb gamemind_test
createdb gamemind_test
bun run db:migrate
```

**Frontend tests fail:**
```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Update Playwright
npx playwright install
```

**Load tests fail:**
```bash
# Check server is running
curl http://localhost:3000/health

# Reduce concurrent users
CONCURRENT_USERS=10 bun run load-test.ts

# Check server logs
railway logs
```

---

**Status:** Testing guide complete! 🧪

**Next:** Run all tests before deployment

