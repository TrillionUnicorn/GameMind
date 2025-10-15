#!/bin/bash

###############################################################################
# Database Restore Script
# Restores PostgreSQL database from backup file
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATABASE_URL="${DATABASE_URL}"
BACKUP_FILE="$1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    log_error "Usage: $0 <backup_file>"
    log_info "Available backups:"
    ls -lh "$BACKUP_DIR"/gamemind_backup_*.sql.gz 2>/dev/null || log_warn "No backups found"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Warning
log_warn "⚠️  WARNING: This will REPLACE the current database!"
log_warn "Database: $DATABASE_URL"
log_warn "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

log_info "Starting database restore..."

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log_info "Decompressing backup..."
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/temp_restore.sql"
    RESTORE_FILE="$BACKUP_DIR/temp_restore.sql"
else
    RESTORE_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Drop existing database (optional, be careful!)
# log_warn "Dropping existing database..."
# psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore database
log_info "Restoring database..."
psql "$DATABASE_URL" < "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    log_info "✅ Database restored successfully"
    
    # Clean up temp file
    if [ -f "$BACKUP_DIR/temp_restore.sql" ]; then
        rm "$BACKUP_DIR/temp_restore.sql"
    fi
    
    log_info "🎉 Restore process complete!"
else
    log_error "Database restore failed"
    exit 1
fi

