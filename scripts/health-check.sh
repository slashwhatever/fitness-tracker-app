#!/bin/bash

# ============================================================================
# DEPLOYMENT HEALTH CHECK SCRIPT
# ============================================================================

set -e

# Configuration
HEALTH_ENDPOINT="${1:-https://fitness-tracking-app.netlify.app/health}"
MAX_RETRIES="${2:-5}"
RETRY_DELAY="${3:-10}"
TIMEOUT="${4:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Health check function
check_health() {
    local endpoint="$1"
    local attempt="$2"
    
    log_info "Health check attempt $attempt/$MAX_RETRIES for $endpoint"
    
    # Make the health check request
    local response=$(curl -s -w "%{http_code}|%{time_total}" --max-time "$TIMEOUT" "$endpoint" || echo "000|0")
    local http_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    local body=$(echo "$response" | cut -d'|' -f3-)
    
    # Parse response
    if [[ "$http_code" == "200" ]]; then
        log_success "Health check passed (HTTP $http_code, ${response_time}s)"
        
        # Parse JSON response if available
        if command -v jq &> /dev/null && [[ -n "$body" ]]; then
            local status=$(echo "$body" | jq -r '.status // "unknown"')
            local version=$(echo "$body" | jq -r '.version // "unknown"')
            local environment=$(echo "$body" | jq -r '.environment // "unknown"')
            
            log_info "Status: $status, Version: $version, Environment: $environment"
            
            # Check individual service status
            local db_status=$(echo "$body" | jq -r '.checks.database.status // "unknown"')
            local auth_status=$(echo "$body" | jq -r '.checks.authentication.status // "unknown"')
            local storage_status=$(echo "$body" | jq -r '.checks.storage.status // "unknown"')
            local api_status=$(echo "$body" | jq -r '.checks.external_apis.status // "unknown"')
            
            log_info "Service Status - DB: $db_status, Auth: $auth_status, Storage: $storage_status, APIs: $api_status"
            
            # Check for warnings or failures
            if [[ "$status" == "degraded" ]]; then
                log_warning "Application is in degraded state"
                return 1
            elif [[ "$status" == "unhealthy" ]]; then
                log_error "Application is unhealthy"
                return 2
            fi
        fi
        
        return 0
    elif [[ "$http_code" == "503" ]]; then
        log_error "Service unavailable (HTTP $http_code)"
        return 2
    elif [[ "$http_code" == "000" ]]; then
        log_error "Connection failed (timeout or network error)"
        return 2
    else
        log_warning "Unexpected HTTP status: $http_code"
        return 1
    fi
}

# Smoke tests for critical functionality
run_smoke_tests() {
    local base_url="$1"
    
    log_info "Running smoke tests..."
    
    # Test main page
    local main_response=$(curl -s -w "%{http_code}" --max-time 10 "$base_url" || echo "000")
    if [[ "$main_response" == *"200" ]]; then
        log_success "Main page accessible"
    else
        log_error "Main page failed (HTTP: ${main_response})"
        return 1
    fi
    
    # Test login page
    local login_response=$(curl -s -w "%{http_code}" --max-time 10 "$base_url/login" || echo "000")
    if [[ "$login_response" == *"200" ]]; then
        log_success "Login page accessible"
    else
        log_error "Login page failed (HTTP: ${login_response})"
        return 1
    fi
    
    # Test API health endpoint
    local api_response=$(curl -s -w "%{http_code}" --max-time 10 "$base_url/api/health" || echo "000")
    if [[ "$api_response" == *"200" ]] || [[ "$api_response" == *"404" ]]; then
        log_success "API endpoint accessible"
    else
        log_warning "API endpoint may have issues (HTTP: ${api_response})"
    fi
    
    return 0
}

# Performance check
check_performance() {
    local endpoint="$1"
    
    log_info "Running performance check..."
    
    # Use curl to measure timing
    local timing=$(curl -s -w "@-" --max-time 30 "$endpoint" <<< "
     time_namelookup:  %{time_namelookup}\n
     time_connect:     %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
     time_pretransfer: %{time_pretransfer}\n
     time_redirect:    %{time_redirect}\n
     time_starttransfer: %{time_starttransfer}\n
     time_total:       %{time_total}\n
     size_download:    %{size_download}\n
     speed_download:   %{speed_download}\n
" 2>/dev/null || echo "Performance check failed")
    
    if [[ "$timing" != "Performance check failed" ]]; then
        log_success "Performance metrics collected"
        echo "$timing" | while read line; do
            log_info "$line"
        done
    else
        log_warning "Performance check failed"
    fi
}

# Main execution
main() {
    log_info "Starting deployment health check"
    log_info "Endpoint: $HEALTH_ENDPOINT"
    log_info "Max retries: $MAX_RETRIES"
    log_info "Retry delay: ${RETRY_DELAY}s"
    log_info "Timeout: ${TIMEOUT}s"
    
    # Extract base URL for smoke tests
    local base_url=$(echo "$HEALTH_ENDPOINT" | sed 's|/health||')
    
    # Retry loop for health checks
    local attempt=1
    while [[ $attempt -le $MAX_RETRIES ]]; do
        if check_health "$HEALTH_ENDPOINT" "$attempt"; then
            log_success "Health check passed on attempt $attempt"
            
            # Run additional tests
            if run_smoke_tests "$base_url"; then
                log_success "Smoke tests passed"
            else
                log_warning "Some smoke tests failed"
            fi
            
            # Run performance check
            check_performance "$base_url"
            
            log_success "Deployment health check completed successfully"
            exit 0
        else
            local exit_code=$?
            if [[ $exit_code -eq 2 ]]; then
                log_error "Critical failure detected, stopping retries"
                exit 2
            fi
            
            if [[ $attempt -lt $MAX_RETRIES ]]; then
                log_warning "Health check failed, retrying in ${RETRY_DELAY}s..."
                sleep "$RETRY_DELAY"
            fi
        fi
        
        ((attempt++))
    done
    
    log_error "Health check failed after $MAX_RETRIES attempts"
    exit 1
}

# Help function
show_help() {
    cat << EOF
Deployment Health Check Script

Usage: $0 [HEALTH_ENDPOINT] [MAX_RETRIES] [RETRY_DELAY] [TIMEOUT]

Arguments:
  HEALTH_ENDPOINT  Health check endpoint URL (default: https://fitness-tracking-app.netlify.app/health)
  MAX_RETRIES      Maximum number of retry attempts (default: 5)
  RETRY_DELAY      Delay between retries in seconds (default: 10)
  TIMEOUT          Request timeout in seconds (default: 30)

Examples:
  $0
  $0 https://staging.example.com/health
  $0 https://example.com/health 3 5 15

Exit codes:
  0 - Success
  1 - Health check failed after retries
  2 - Critical failure (service unavailable)
EOF
}

# Check for help flag
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
