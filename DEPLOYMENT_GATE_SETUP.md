# 🚀 Deployment Gate Setup Guide

This guide helps you configure a deployment gate so that Netlify only builds and deploys when GitHub Actions tests pass.

## 📋 Current Problem

- GitHub Actions runs tests/linting/security scans
- Netlify builds and deploys independently
- **Risk**: Broken code can reach users if tests fail but deployment succeeds

## ✅ Solution Implemented

A pre-deployment check that queries GitHub's API to ensure all CI checks passed before allowing Netlify to build.

## 🔧 Setup Steps

### 1. Update Repository Configuration

Edit `scripts/check-ci-status.js` and replace:

```javascript
const REPO_OWNER = "your-github-username"; // Replace with YOUR GitHub username
const REPO_NAME = "fitness-tracking-app"; // Replace with YOUR repo name
```

### 2. Configure Netlify Environment Variables

In your Netlify dashboard → Site settings → Environment variables, add:

**Optional but recommended:**

- `GITHUB_TOKEN`: GitHub personal access token (for higher rate limits)
  - Go to GitHub → Settings → Developer settings → Personal access tokens
  - Create token with `repo:status` permission
  - Add to Netlify environment variables

### 3. Test the Setup

1. Make a change that will fail tests
2. Push to main branch
3. Check Netlify build logs - it should show:
   ```
   🔍 Checking CI status for commit: abc1234...
   ❌ CI checks failed! Deployment blocked.
   ```

### 4. Alternative Implementation Options

If you prefer different approaches:

#### Option A: Full GitHub Actions Deployment

Move deployment entirely to GitHub Actions using Netlify CLI:

```yaml
# Add to .github/workflows/ci.yml
deploy:
  name: Deploy to Netlify
  runs-on: ubuntu-latest
  needs: [test, security]
  if: github.ref == 'refs/heads/main'

  steps:
    - uses: actions/checkout@v4
    - name: Deploy to Netlify
      run: npx netlify-cli deploy --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### Option B: Branch Protection Rules

1. GitHub → Repository → Settings → Branches
2. Add rule for `main` branch
3. Require status checks: `Test & Validate`, `Security Scan`
4. Configure Netlify to only deploy from `main` branch

## 🛡️ How It Works

1. **Code Push** → Triggers GitHub Actions
2. **GitHub Actions** → Runs tests, linting, security scans
3. **Netlify Build Starts** → Runs `pnpm run ci:pre-deploy`
4. **Pre-deploy Script** → Checks GitHub API for CI status
5. **If Tests Pass** → ✅ Build continues → Deploy
6. **If Tests Fail** → ❌ Build stops → No deployment

## 🚨 Failure Modes

The script handles different scenarios:

- **Tests Failed**: ❌ Blocks deployment
- **Tests Pending**: ⏳ Blocks deployment until complete
- **API Error**: ⚠️ Allows deployment (fail-open)
  - Change to fail-closed by uncommenting `process.exit(1)` in error handler

## 📊 Build Log Examples

**✅ Success:**

```
🔍 Checking CI status for commit: abc1234...
📊 Overall status: success
📈 Total checks: 3
✅ All CI checks passed! Proceeding with deployment...
```

**❌ Failure:**

```
🔍 Checking CI status for commit: abc1234...
📊 Overall status: failure
📋 Individual check results:
   ❌ Test & Validate: failure
   ✅ Security Scan: success
❌ CI checks failed! Deployment blocked.
```

## 🔍 Monitoring

- Check Netlify build logs for deployment gate status
- Monitor GitHub Actions for CI pipeline health
- Set up alerts for deployment failures

## 🤝 Team Workflow

1. **Developer** pushes code
2. **GitHub Actions** runs automatically
3. **If tests fail** → Fix issues and push again
4. **If tests pass** → Netlify builds and deploys
5. **No manual intervention needed** ✨

---

## 🚀 Ready to Deploy!

Your deployment pipeline now has a safety gate. Failed tests = blocked deployments.

**Next Steps:**

1. Update the repository configuration (Step 1)
2. Test with a failing commit
3. Celebrate safer deployments! 🎉
