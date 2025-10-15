# 📊 PRODUCTION MONITORING SETUP

**Complete guide to setting up monitoring for GameMind**

---

## 🎯 MONITORING STACK

### Core Components:
1. **Sentry** - Error tracking & performance monitoring
2. **Railway/Vercel** - Built-in metrics & logs
3. **UptimeRobot** - Uptime monitoring (free)
4. **Health Checks** - Custom health endpoints

---

## 🔴 SENTRY SETUP (Error Tracking)

### Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Create account (free tier available)
3. Create new project
   - Platform: **Bun**
   - Project name: **GameMind Backend**
4. Copy DSN

### Step 2: Configure Backend

```bash
# Add to Railway environment variables
railway variables set SENTRY_DSN="https://your-key@sentry.io/project-id"
```

### Step 3: Verify Integration

```bash
# Trigger test error
curl https://your-backend.railway.app/api/test-error

# Check Sentry dashboard
# Should see error appear within seconds
```

### Step 4: Configure Alerts

1. Go to Sentry → Alerts
2. Create alert rule:
   - **Name:** Critical Errors
   - **Condition:** Error count > 10 in 5 minutes
   - **Action:** Email team
3. Create performance alert:
   - **Name:** Slow Transactions
   - **Condition:** P95 response time > 1000ms
   - **Action:** Email team

### Features to Enable:
- [x] Error tracking
- [x] Performance monitoring
- [x] Release tracking
- [x] User feedback
- [x] Session replay (optional)

---

## 📈 UPTIME MONITORING

### UptimeRobot Setup (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create account (free)
3. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-backend.railway.app/health`
   - **Interval:** 5 minutes
   - **Alert Contacts:** Your email
4. Add frontend monitor:
   - **URL:** `https://your-frontend.vercel.app`
   - **Interval:** 5 minutes

### Alternative: Pingdom, StatusCake, or Better Uptime

---

## 📊 RAILWAY MONITORING

### Built-in Metrics:

1. Go to Railway dashboard
2. Click on your service
3. View **Metrics** tab:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Log Monitoring:

1. Click **Deployments** tab
2. View real-time logs
3. Filter by level (info, warn, error)
4. Search logs

### Alerts:

1. Go to Project Settings
2. Configure notifications:
   - Deployment failures
   - Service crashes
   - Resource limits

---

## 🎨 VERCEL MONITORING

### Built-in Analytics:

1. Go to Vercel dashboard
2. Click on your project
3. View **Analytics** tab:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Real User Monitoring:

1. Enable Vercel Speed Insights
2. Add to your app:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/sveltekit';
   ```

### Web Vitals:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

## 🏥 HEALTH CHECK MONITORING

### Available Endpoints:

```bash
# Basic health
GET /health
Response: {"status":"healthy","uptime":12345}

# Detailed health
GET /health/detailed
Response: {
  "status": "healthy",
  "checks": {
    "database": {"healthy": true, "responseTime": 5},
    "memory": {"healthy": true, "usagePercent": 45}
  }
}

# Readiness (Kubernetes)
GET /health/ready
Response: {"status":"ready"}

# Liveness (Kubernetes)
GET /health/live
Response: {"status":"alive"}

# Performance metrics
GET /health/metrics
Response: {
  "performance": {
    "totalRequests": 1000,
    "averageDuration": 45,
    "slowRequests": 5
  }
}

# System info
GET /health/info
Response: {
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400
}
```

### Monitor These Endpoints:

1. **UptimeRobot:** Monitor `/health` every 5 minutes
2. **Sentry:** Track performance of all endpoints
3. **Custom Script:** Monitor `/health/detailed` every minute

---

## 📧 ALERT CONFIGURATION

### Critical Alerts (Immediate):
- Service down (uptime < 99%)
- Error rate > 5%
- Response time > 2s
- Database connection failed
- Memory usage > 90%

### Warning Alerts (15 min delay):
- Error rate > 1%
- Response time > 1s
- Slow queries > 100ms
- Cache hit rate < 50%

### Info Alerts (Daily digest):
- Daily statistics
- Performance summary
- User activity
- Resource usage

---

## 📊 CUSTOM MONITORING DASHBOARD

### Option 1: Grafana (Advanced)

1. Set up Grafana Cloud (free tier)
2. Connect to Railway metrics
3. Create dashboards:
   - System metrics
   - Application metrics
   - Business metrics

### Option 2: Simple Dashboard

Create a simple HTML dashboard that polls your health endpoints:

```html
<!DOCTYPE html>
<html>
<head>
  <title>GameMind Status</title>
  <script>
    async function checkHealth() {
      const response = await fetch('https://your-backend.railway.app/health/detailed');
      const data = await response.json();
      document.getElementById('status').innerHTML = JSON.stringify(data, null, 2);
    }
    setInterval(checkHealth, 30000); // Every 30 seconds
    checkHealth();
  </script>
</head>
<body>
  <h1>GameMind Status</h1>
  <pre id="status">Loading...</pre>
</body>
</html>
```

---

## 📱 MOBILE ALERTS

### PagerDuty Integration (Optional):

1. Create PagerDuty account
2. Integrate with Sentry
3. Configure on-call schedule
4. Receive SMS/phone alerts

### Slack Integration:

1. Create Slack webhook
2. Configure Sentry to send to Slack
3. Create #alerts channel
4. Get instant notifications

---

## 🔍 LOG AGGREGATION

### Railway Logs:

```bash
# View logs
railway logs

# Follow logs
railway logs --follow

# Filter logs
railway logs | grep ERROR
```

### Log Levels:

- **DEBUG:** Development info
- **INFO:** General information
- **WARN:** Warning messages
- **ERROR:** Error messages

### Log Format (Production):

```json
{
  "timestamp": "2024-12-01T10:30:00Z",
  "level": "INFO",
  "message": "User logged in",
  "context": {
    "userId": "123",
    "ip": "1.2.3.4"
  }
}
```

---

## 📊 METRICS TO TRACK

### Performance Metrics:
- Average response time
- P95 response time
- P99 response time
- Requests per second
- Error rate
- Cache hit rate

### Business Metrics:
- New user registrations
- Active users (DAU/MAU)
- Games played
- Subscription conversions
- Revenue

### System Metrics:
- CPU usage
- Memory usage
- Database connections
- Disk usage
- Network traffic

---

## 🎯 MONITORING CHECKLIST

### Initial Setup:
- [ ] Sentry project created
- [ ] Sentry DSN configured
- [ ] UptimeRobot monitors added
- [ ] Railway alerts configured
- [ ] Vercel analytics enabled

### Daily Monitoring:
- [ ] Check Sentry for errors
- [ ] Review performance metrics
- [ ] Check uptime status
- [ ] Review logs for warnings

### Weekly Review:
- [ ] Analyze performance trends
- [ ] Review slow queries
- [ ] Check resource usage
- [ ] Plan optimizations

### Monthly Review:
- [ ] Review all metrics
- [ ] Update alert thresholds
- [ ] Optimize based on data
- [ ] Plan capacity

---

## 🚨 INCIDENT RESPONSE

### When Alert Fires:

1. **Acknowledge:** Acknowledge alert immediately
2. **Assess:** Check health endpoints and logs
3. **Diagnose:** Identify root cause
4. **Fix:** Apply fix or rollback
5. **Verify:** Confirm issue resolved
6. **Document:** Write incident report

### Escalation:

1. **Level 1:** Automated alerts
2. **Level 2:** On-call engineer (15 min)
3. **Level 3:** Team lead (30 min)
4. **Level 4:** CTO (1 hour)

---

## 📈 SUCCESS METRICS

### Target SLAs:

- **Uptime:** 99.9% (43 minutes downtime/month)
- **Response Time:** P95 < 200ms
- **Error Rate:** < 0.1%
- **Availability:** 24/7

### Current Performance:

Check `/health/metrics` for real-time stats.

---

**Status:** Monitoring setup complete! 📊

**Next:** Configure alerts and start monitoring

