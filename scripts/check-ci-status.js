#!/usr/bin/env node
/**
 * Pre-deployment CI status checker
 *
 * This script ensures that GitHub Actions CI tests have passed
 * before allowing Netlify to build and deploy the application.
 *
 * Environment variables needed:
 * - COMMIT_REF: Git commit SHA (provided by Netlify)
 * - GITHUB_TOKEN: GitHub personal access token (required for Checks API)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const https = require("https");

// GitHub API configuration
const REPO_OWNER = "slashwhatever";
const REPO_NAME = "fitness-tracker-app";

async function makeGitHubRequest(path) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required for Checks API");
  }

  const options = {
    hostname: "api.github.com",
    path,
    method: "GET",
    headers: {
      "User-Agent": "Netlify-CI-Checker",
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  };

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

async function checkGitHubChecks(commitSha) {
  // Check both Check Runs (for GitHub Actions) and Commit Status (for other CI)
  const checksPath = `/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commitSha}/check-runs`;
  const statusPath = `/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commitSha}/status`;

  try {
    const [checksData, statusData] = await Promise.all([
      makeGitHubRequest(checksPath),
      makeGitHubRequest(statusPath),
    ]);

    return {
      checks: checksData,
      status: statusData,
    };
  } catch (error) {
    throw new Error(`Failed to fetch CI status: ${error.message}`);
  }
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
    const { checks, status } = await checkGitHubChecks(commitSha);

    console.log(`\n📊 Check Runs: ${checks.total_count} found`);
    console.log(`📊 Status Checks: ${status.total_count} found`);

    // If no checks at all have been created, block deployment
    if (checks.total_count === 0 && status.total_count === 0) {
      console.error(
        "\n❌ No CI checks found for this commit! Deployment blocked."
      );
      console.error(
        "This usually means GitHub Actions workflow hasn't started yet."
      );
      console.error("Please wait for CI checks to begin and try again.\n");
      process.exit(1);
    }

    // Check GitHub Actions check runs
    let allChecksPassed = true;
    let anyChecksPending = false;

    if (checks.total_count > 0) {
      console.log("\n📋 GitHub Actions Check Runs:");
      checks.check_runs.forEach((check) => {
        const emoji =
          check.conclusion === "success"
            ? "✅"
            : check.conclusion === "failure"
            ? "❌"
            : check.conclusion === null && check.status === "in_progress"
            ? "⏳"
            : check.conclusion === null && check.status === "queued"
            ? "🔄"
            : "❓";

        console.log(`   ${emoji} ${check.name}: ${check.conclusion || check.status}`);

        if (check.conclusion === "failure") {
          allChecksPassed = false;
        }
        if (check.status === "in_progress" || check.status === "queued") {
          anyChecksPending = true;
        }
      });
    }

    // Check commit status (for other CI integrations)
    if (status.total_count > 0) {
      console.log("\n📋 Commit Status Checks:");
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

        if (check.state === "failure") {
          allChecksPassed = false;
        }
        if (check.state === "pending") {
          anyChecksPending = true;
        }
      });
    }

    // Decision logic
    if (!allChecksPassed) {
      console.error("\n❌ CI checks failed! Deployment blocked.");
      console.error("Please fix the failing tests and push again.\n");
      process.exit(1);
    }

    if (anyChecksPending) {
      console.error(
        "\n⏳ CI checks are still running. Deployment blocked until checks complete."
      );
      console.error("Please wait for all checks to finish and try again.\n");
      process.exit(1);
    }

    console.log("\n✅ All CI checks passed! Proceeding with deployment...\n");
    process.exit(0);
  } catch (error) {
    console.error(`\n🚨 Error checking CI status: ${error.message}`);

    // Fail-safe approach: block deployment on API errors
    // This prevents deploying when we can't verify CI status
    console.error("❌ Deployment blocked due to CI verification error.\n");
    process.exit(1);
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
