const {
  withProjectBuildGradle,
  withAndroidManifest,
} = require("expo/config-plugins");

/**
 * Expo config plugin to:
 * 1. Add notifee's local Maven repository (for pnpm hoisting)
 * 2. Configure the foreground service type to mediaPlayback
 *    This prevents the 3-minute timeout ANR on Android 14+
 */
function withNotifee(config) {
  // First, add the maven repository
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      // Add notifee maven repository to allprojects
      const mavenRepo = `
        maven {
            url("\$rootDir/../../../node_modules/@notifee/react-native/android/libs")
            content {
                includeGroup("app.notifee")
            }
        }`;

      // Find the allprojects { repositories { block and add our maven repo
      const searchPattern = /allprojects\s*\{\s*repositories\s*\{/;

      if (config.modResults.contents.match(searchPattern)) {
        config.modResults.contents = config.modResults.contents.replace(
          searchPattern,
          `allprojects {
    repositories {${mavenRepo}`
        );
      }
    }
    return config;
  });

  // Then, configure the foreground service type in AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];

    // Add required permission for mediaPlayback foreground service type
    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }
    const hasMediaPlaybackPermission = manifest["uses-permission"].some(
      (p) =>
        p.$?.["android:name"] ===
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
    );
    if (!hasMediaPlaybackPermission) {
      manifest["uses-permission"].push({
        $: {
          "android:name":
            "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        },
      });
    }

    if (application) {
      // Ensure service array exists
      if (!application.service) {
        application.service = [];
      }

      // Check if notifee service already exists
      const existingServiceIndex = application.service.findIndex(
        (s) => s.$?.["android:name"] === "app.notifee.core.ForegroundService"
      );

      const notifeeService = {
        $: {
          "android:name": "app.notifee.core.ForegroundService",
          // Use mediaPlayback to avoid SHORT_SERVICE 3-minute timeout
          "android:foregroundServiceType": "mediaPlayback",
        },
      };

      if (existingServiceIndex >= 0) {
        // Update existing service
        application.service[existingServiceIndex] = notifeeService;
      } else {
        // Add new service
        application.service.push(notifeeService);
      }
    }

    return config;
  });

  return config;
}

module.exports = withNotifee;
