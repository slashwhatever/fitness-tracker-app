# Environment Configuration Guide

This document provides a comprehensive guide for setting up environment variables for the Fitness Tracking App across different deployment environments.

## Quick Setup

1. Copy the environment template below to `.env.local` for local development
2. Set the required variables in your deployment platform (Netlify, Vercel, etc.)
3. Ensure all secrets are properly secured and never committed to version control

## Environment Variables Template

```bash
# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

# Application environment (development, staging, production)
NEXT_PUBLIC_APP_ENV=development

# Application version (automatically set in CI/CD)
NEXT_PUBLIC_APP_VERSION=1.0.0

# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================

# Supabase Project URL (Public)
# Get this from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key (Public)
# This is safe to expose in client-side code
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (Private - Server Only)
# NEVER expose this in client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase Project Reference (for CLI operations)
SUPABASE_PROJECT_REF=your-project-ref

# Supabase Access Token (for CI/CD operations)
SUPABASE_ACCESS_TOKEN=your-access-token

# ============================================================================
# DEPLOYMENT CONFIGURATION
# ============================================================================

# Netlify Configuration
NETLIFY_AUTH_TOKEN=your-netlify-auth-token
NETLIFY_SITE_ID=your-netlify-site-id
NETLIFY_STAGING_SITE_ID=your-staging-site-id
NETLIFY_PRODUCTION_SITE_ID=your-production-site-id

# ============================================================================
# MONITORING AND ALERTING
# ============================================================================

# Slack webhook for deployment notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Sentry DSN for error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Snyk token for security scanning
SNYK_TOKEN=your-snyk-token
```

## Environment-Specific Configurations

### Development (.env.local)

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
DEBUG=true
```

### Staging (Netlify Environment Variables)

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_BASE_URL=https://staging-fitness-app.netlify.app
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
```

### Production (Netlify Environment Variables)

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BASE_URL=https://fitness-tracking-app.netlify.app
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
```

## Required Variables Checklist

### For Local Development

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### For CI/CD Pipeline

- ✅ `SUPABASE_ACCESS_TOKEN`
- ✅ `NETLIFY_AUTH_TOKEN`
- ✅ `NETLIFY_SITE_ID`
- ✅ All staging/production Supabase credentials

### For Monitoring (Optional but Recommended)

- ✅ `SLACK_WEBHOOK_URL`
- ✅ `NEXT_PUBLIC_SENTRY_DSN`

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different Supabase projects for staging and production**
3. **Rotate keys regularly, especially service role keys**
4. **Use environment-specific configurations**
5. **Monitor access logs for suspicious activity**
6. **Use GitHub Secrets for CI/CD environment variables**
7. **Validate all environment variables at application startup**

## Setting Up Environments

### GitHub Secrets

Add these secrets to your GitHub repository:

- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_PROJECT_REF`
- `PRODUCTION_SUPABASE_URL`
- `PRODUCTION_SUPABASE_ANON_KEY`
- `PRODUCTION_SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `NETLIFY_STAGING_SITE_ID`
- `NETLIFY_PRODUCTION_SITE_ID`
- `SLACK_WEBHOOK_URL`
- `SNYK_TOKEN`

### Netlify Environment Variables

Set these in your Netlify site settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_BASE_URL`

## Troubleshooting

### Common Issues

1. **Build fails with missing environment variables**

   - Check that all required variables are set in the deployment environment
   - Verify variable names match exactly (case-sensitive)

2. **Supabase connection fails**

   - Verify the Supabase URL format
   - Check that the anonymous key is correct
   - Ensure the Supabase project is active

3. **Health checks fail**
   - Verify all environment variables are properly set
   - Check Supabase project status
   - Review application logs for specific errors

### Validation Script

Use this script to validate your environment setup:

```bash
#!/bin/bash
# validate-env.sh

required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing required variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo "🎉 All required environment variables are set!"
```
