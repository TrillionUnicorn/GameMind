#!/bin/bash

###############################################################################
# Database Backup Script
# Backs up PostgreSQL database to local file and optionally to cloud storage
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATABASE_URL="${DATABASE_URL}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="gamemind_backup_${TIMESTAMP}.sql"

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_info "Starting database backup..."
log_info "Backup file: $BACKUP_FILE"

# Perform backup
log_info "Dumping database..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log_info "Database dump successful"
    
    # Compress backup
    log_info "Compressing backup..."
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_info "Backup size: $FILE_SIZE"
    
    # Clean up old backups
    log_info "Cleaning up old backups (older than $BACKUP_RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "gamemind_backup_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/gamemind_backup_*.sql.gz 2>/dev/null | wc -l)
    log_info "Total backups: $BACKUP_COUNT"
    
    log_info "✅ Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
else
    log_error "Database dump failed"
    exit 1
fi

# Optional: Upload to cloud storage (uncomment and configure as needed)
# if [ -n "$AWS_S3_BUCKET" ]; then
#     log_info "Uploading to S3..."
#     aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/$BACKUP_FILE"
#     log_info "✅ Uploaded to S3"
# fi

log_info "🎉 Backup process complete!"

