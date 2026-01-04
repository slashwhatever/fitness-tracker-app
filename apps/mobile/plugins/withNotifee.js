const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Expo config plugin to add notifee's local Maven repository
 * Required because pnpm hoists packages to the workspace root
 */
function withNotifee(config) {
  return withProjectBuildGradle(config, (config) => {
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
}

module.exports = withNotifee;
