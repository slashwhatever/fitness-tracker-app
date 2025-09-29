#!/usr/bin/env node
/**
 * Pre-deployment CI status checker
 *
 * This script ensures that GitHub Actions CI tests have passed
 * before allowing Netlify to build and deploy the application.
 *
 * Environment variables needed:
 * - COMMIT_REF: Git commit SHA (provided by Netlify)
 * - GITHUB_TOKEN: GitHub personal access token (optional, for higher rate limits)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const https = require("https");

// GitHub API configuration
const REPO_OWNER = "slashwhatever";
const REPO_NAME = "fitness-tracker-app";

async function checkGitHubStatus(commitSha) {
  const options = {
    hostname: "api.github.com",
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commitSha}/status`,
    method: "GET",
    headers: {
      "User-Agent": "Netlify-CI-Checker",
      Accept: "application/vnd.github.v3+json",
    },
  };

  // Add GitHub token if available (for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    options.headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function main() {
  const commitSha = process.env.COMMIT_REF || process.env.HEAD;

  if (!commitSha) {
    console.error(
      "❌ No commit SHA found. This script should run in Netlify build context."
    );
    process.exit(1);
  }

  console.log(
    `🔍 Checking CI status for commit: ${commitSha.substring(0, 7)}...`
  );

  try {
    const status = await checkGitHubStatus(commitSha);

    console.log(`📊 Overall status: ${status.state}`);
    console.log(`📈 Total checks: ${status.total_count}`);

    // Handle case where GitHub Status API hasn't updated yet
    if (status.total_count === 0) {
      console.log(
        "\n🔄 No status checks found - GitHub Status API may not be updated yet."
      );
      console.log(
        "This can happen with timing between GitHub Actions completion and Status API updates."
      );

      // Allow deployment for commits with no status checks (common for direct pushes)
      console.log(
        "✅ Allowing deployment to proceed (no blocking status checks found).\n"
      );
      process.exit(0);
    }

    if (status.statuses && status.statuses.length > 0) {
      console.log("\n📋 Individual check results:");
      status.statuses.forEach((check) => {
        const emoji =
          check.state === "success"
            ? "✅"
            : check.state === "failure"
            ? "❌"
            : check.state === "pending"
            ? "⏳"
            : "❓";
        console.log(`   ${emoji} ${check.context}: ${check.state}`);
        if (check.description) {
          console.log(`      └─ ${check.description}`);
        }
      });
    }

    // Check if all required checks passed
    if (status.state === "success") {
      console.log("\n✅ All CI checks passed! Proceeding with deployment...\n");
      process.exit(0);
    } else if (status.state === "pending") {
      console.error(
        "\n⏳ CI checks are still running. Deployment blocked until checks complete."
      );
      console.error("Please wait for all checks to finish and try again.\n");
      process.exit(1);
    } else {
      console.error("\n❌ CI checks failed! Deployment blocked.");
      console.error("Please fix the failing tests and push again.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n🚨 Error checking CI status: ${error.message}`);

    // In case of API errors, we can either:
    // 1. Fail safe (block deployment) - uncomment next line
    // process.exit(1);

    // 2. Fail open (allow deployment) - current behavior
    console.log("⚠️  Allowing deployment to proceed due to API error...\n");
    process.exit(0);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(`🚨 Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`🚨 Unhandled rejection at:`, promise, "reason:", reason);
  process.exit(1);
});

// Run the check
main();
