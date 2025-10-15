#!/bin/bash

###############################################################################
# Production Readiness Verification Script
# Verifies that all components are ready for production deployment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((TOTAL_CHECKS++))
}

# Start verification
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     GAMEMIND PRODUCTION READINESS VERIFICATION            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# 1. File Structure Check
print_header "1. FILE STRUCTURE"

if [ -d "PRODUCTION/backend" ]; then
    check_pass "Backend directory exists"
else
    check_fail "Backend directory missing"
fi

if [ -d "src" ]; then
    check_pass "Frontend directory exists"
else
    check_fail "Frontend directory missing"
fi

if [ -f "PRODUCTION/backend/package.json" ]; then
    check_pass "Backend package.json exists"
else
    check_fail "Backend package.json missing"
fi

if [ -f "package.json" ]; then
    check_pass "Frontend package.json exists"
else
    check_fail "Frontend package.json missing"
fi

# 2. Backend Files Check
print_header "2. BACKEND FILES"

BACKEND_FILES=(
    "PRODUCTION/backend/src/index.ts"
    "PRODUCTION/backend/src/config/env.ts"
    "PRODUCTION/backend/src/config/monitoring.ts"
    "PRODUCTION/backend/src/config/logger.ts"
    "PRODUCTION/backend/src/db/schema.ts"
    "PRODUCTION/backend/src/db/index.ts"
    "PRODUCTION/backend/src/db/indexes.sql"
    "PRODUCTION/backend/src/middleware/auth.ts"
    "PRODUCTION/backend/src/middleware/cache.ts"
    "PRODUCTION/backend/src/middleware/performance.ts"
    "PRODUCTION/backend/src/routes/auth.ts"
    "PRODUCTION/backend/src/routes/users.ts"
    "PRODUCTION/backend/src/routes/games.ts"
    "PRODUCTION/backend/src/routes/payments.ts"
    "PRODUCTION/backend/src/routes/health.ts"
    "PRODUCTION/backend/src/routes/health-advanced.ts"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$(basename $file)"
    else
        check_fail "$(basename $file) missing"
    fi
done

# 3. Frontend Files Check
print_header "3. FRONTEND FILES"

FRONTEND_FILES=(
    "src/lib/api/client.ts"
    "src/lib/stores/auth.ts"
    "src/lib/components/ProtectedRoute.svelte"
    "src/routes/login/+page.svelte"
    "src/routes/register/+page.svelte"
    "src/routes/dashboard/+page.svelte"
    "src/routes/account/+page.svelte"
    "src/routes/account/billing/+page.svelte"
    "src/routes/history/+page.svelte"
    "src/routes/history/[id]/+page.svelte"
    "src/routes/leaderboard/+page.svelte"
    "src/routes/pricing/+page.svelte"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$(basename $file)"
    else
        check_fail "$(basename $file) missing"
    fi
done

# 4. Configuration Files Check
print_header "4. CONFIGURATION FILES"

CONFIG_FILES=(
    "PRODUCTION/backend/.env.example"
    "PRODUCTION/backend/Dockerfile"
    "PRODUCTION/backend/railway.json"
    ".github/workflows/ci-cd.yml"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$(basename $file)"
    else
        check_fail "$(basename $file) missing"
    fi
done

# 5. Documentation Check
print_header "5. DOCUMENTATION"

DOCS=(
    "README_FINAL.md"
    "MASTER_PROJECT_SUMMARY.md"
    "ABSOLUTE_FINAL_SUMMARY.md"
    "DEPLOYMENT_GUIDE.md"
    "PRODUCTION_DEPLOYMENT_CHECKLIST.md"
    "LAUNCH_GUIDE.md"
    "MONITORING_SETUP.md"
    "PRODUCTION/backend/README.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$(basename $doc)"
    else
        check_fail "$(basename $doc) missing"
    fi
done

# 6. Scripts Check
print_header "6. PRODUCTION SCRIPTS"

SCRIPTS=(
    "PRODUCTION/backend/scripts/backup-database.sh"
    "PRODUCTION/backend/scripts/restore-database.sh"
    "PRODUCTION/backend/tests/load-test.ts"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ] || [[ "$script" == *.ts ]]; then
            check_pass "$(basename $script)"
        else
            check_warn "$(basename $script) exists but not executable"
        fi
    else
        check_fail "$(basename $script) missing"
    fi
done

# 7. Environment Variables Check
print_header "7. ENVIRONMENT CONFIGURATION"

if [ -f "PRODUCTION/backend/.env.example" ]; then
    REQUIRED_VARS=(
        "NODE_ENV"
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_KEY"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "SENTRY_DSN"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" "PRODUCTION/backend/.env.example"; then
            check_pass "$var documented"
        else
            check_fail "$var not documented"
        fi
    done
fi

# 8. Dependencies Check
print_header "8. DEPENDENCIES"

if [ -f "PRODUCTION/backend/package.json" ]; then
    if grep -q "@sentry/bun" "PRODUCTION/backend/package.json"; then
        check_pass "Sentry dependency present"
    else
        check_fail "Sentry dependency missing"
    fi
    
    if grep -q "drizzle-orm" "PRODUCTION/backend/package.json"; then
        check_pass "Drizzle ORM present"
    else
        check_fail "Drizzle ORM missing"
    fi
    
    if grep -q "stripe" "PRODUCTION/backend/package.json"; then
        check_pass "Stripe dependency present"
    else
        check_fail "Stripe dependency missing"
    fi
fi

# 9. Git Check
print_header "9. VERSION CONTROL"

if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    if git remote -v | grep -q "origin"; then
        check_pass "Git remote configured"
    else
        check_warn "Git remote not configured"
    fi
else
    check_fail "Not a git repository"
fi

# 10. Summary
print_header "VERIFICATION SUMMARY"

echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
echo ""

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║  ✓ ALL CHECKS PASSED - PRODUCTION READY! 🚀              ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║  Pass Rate: $PASS_RATE%                                        ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║  Next Steps:                                              ║${NC}"
    echo -e "${GREEN}║  1. Review DEPLOYMENT_GUIDE.md                            ║${NC}"
    echo -e "${GREEN}║  2. Follow PRODUCTION_DEPLOYMENT_CHECKLIST.md             ║${NC}"
    echo -e "${GREEN}║  3. Execute LAUNCH_GUIDE.md                               ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
elif [ $PASS_RATE -ge 90 ]; then
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║  ⚠ MOSTLY READY - MINOR ISSUES FOUND                     ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║  Pass Rate: $PASS_RATE%                                        ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║  Please fix the failed checks above before deploying.    ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║  ✗ NOT READY - CRITICAL ISSUES FOUND                     ║${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║  Pass Rate: $PASS_RATE%                                        ║${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}║  Please fix all failed checks before deploying.          ║${NC}"
    echo -e "${RED}║                                                           ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

